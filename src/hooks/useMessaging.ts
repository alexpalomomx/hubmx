import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

// Hook for conversations
export const useConversations = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["conversations", user?.id],
    queryFn: async () => {
      const { data: conversations, error } = await supabase
        .from("conversations")
        .select("*")
        .or(`participant1_id.eq.${user?.id},participant2_id.eq.${user?.id}`)
        .order("last_message_at", { ascending: false });

      if (error) throw error;

      // Fetch participant profiles separately
      const enrichedConversations = await Promise.all(
        conversations.map(async (conv) => {
          const participant1Id = conv.participant1_id;
          const participant2Id = conv.participant2_id;
          
          const { data: profiles } = await supabase
            .from("profiles")
            .select("user_id, display_name, avatar_url")
            .in("user_id", [participant1Id, participant2Id]);

          const participant1 = profiles?.find(p => p.user_id === participant1Id);
          const participant2 = profiles?.find(p => p.user_id === participant2Id);

          // Get last message
          const { data: messages } = await supabase
            .from("messages")
            .select("content, created_at")
            .eq("conversation_id", conv.id)
            .order("created_at", { ascending: false })
            .limit(1);

          return {
            ...conv,
            participant1,
            participant2,
            messages: messages || []
          };
        })
      );

      return enrichedConversations;
    },
    enabled: !!user?.id,
  });
};

// Hook for messages in a conversation
export const useMessages = (conversationId?: string) => {
  return useQuery({
    queryKey: ["messages", conversationId],
    queryFn: async () => {
      if (!conversationId) return [];
      
      const { data: messages, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Fetch sender profiles separately
      const enrichedMessages = await Promise.all(
        messages.map(async (message) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("user_id, display_name, avatar_url")
            .eq("user_id", message.sender_id)
            .single();

          return {
            ...message,
            sender: profile
          };
        })
      );

      return enrichedMessages;
    },
    enabled: !!conversationId,
  });
};

// Hook to create or get conversation
export const useGetOrCreateConversation = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (otherUserId: string) => {
      if (!user?.id || !otherUserId) throw new Error("User ID required");

      // Sort IDs to ensure consistent unique constraint
      const [participant1, participant2] = [user.id, otherUserId].sort();

      // Try to find existing conversation
      let { data: existing, error: findError } = await supabase
        .from("conversations")
        .select("*")
        .or(`and(participant1_id.eq.${participant1},participant2_id.eq.${participant2})`)
        .single();

      if (findError && findError.code !== 'PGRST116') {
        throw findError;
      }

      // Create new conversation if doesn't exist
      if (!existing) {
        const { data: newConv, error: createError } = await supabase
          .from("conversations")
          .insert({
            participant1_id: participant1,
            participant2_id: participant2
          })
          .select()
          .single();

        if (createError) throw createError;
        existing = newConv;
      }

      return existing;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo crear la conversación",
        variant: "destructive",
      });
    },
  });
};

// Hook to send message
export const useSendMessage = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      conversationId, 
      content, 
      messageType = "text" 
    }: {
      conversationId: string;
      content: string;
      messageType?: string;
    }) => {
      if (!user?.id) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("messages")
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content,
          message_type: messageType
        })
        .select()
        .single();

      if (error) throw error;

      // Update conversation's last message timestamp
      await supabase
        .from("conversations")
        .update({ last_message_at: new Date().toISOString() })
        .eq("id", conversationId);

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["messages", variables.conversationId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo enviar el mensaje",
        variant: "destructive",
      });
    },
  });
};

// Hook to mark message as read
export const useMarkMessageAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (messageId: string) => {
      const { error } = await supabase
        .from("messages")
        .update({ is_read: true })
        .eq("id", messageId);

      if (error) throw error;
    },
    onSuccess: (_, messageId) => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
  });
};

// Real-time messaging hook
export const useRealtimeMessages = (conversationId?: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
          queryClient.invalidateQueries({ queryKey: ["conversations"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, queryClient]);
};