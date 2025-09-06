import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

// Hook for networking suggestions
export const useNetworkingSuggestions = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["networking-suggestions", user?.id],
    queryFn: async () => {
      const { data: suggestions, error } = await supabase
        .from("networking_suggestions")
        .select("*")
        .eq("user_id", user?.id)
        .eq("status", "pending")
        .order("match_score", { ascending: false });

      if (error) throw error;

      // Fetch suggested users data separately
      const enrichedSuggestions = await Promise.all(
        suggestions.map(async (suggestion) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("user_id, display_name, avatar_url")
            .eq("user_id", suggestion.suggested_user_id)
            .single();

          const { data: networkingProfile } = await supabase
            .from("user_networking_profile")
            .select("*")
            .eq("user_id", suggestion.suggested_user_id)
            .single();

          const { data: skills } = await supabase
            .from("user_skills")
            .select("*")
            .eq("user_id", suggestion.suggested_user_id);

          return {
            ...suggestion,
            suggested_user: {
              ...profile,
              networking_profile: networkingProfile,
              skills: skills || []
            }
          };
        })
      );

      return enrichedSuggestions;
    },
    enabled: !!user?.id,
  });
};

// Hook to update suggestion status
export const useUpdateSuggestionStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      suggestionId, 
      status 
    }: { 
      suggestionId: string; 
      status: string; 
    }) => {
      const { data, error } = await supabase
        .from("networking_suggestions")
        .update({ status })
        .eq("id", suggestionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["networking-suggestions"] });
      
      const message = variables.status === "accepted" 
        ? "Sugerencia aceptada"
        : variables.status === "dismissed" 
        ? "Sugerencia descartada"
        : "Sugerencia actualizada";
        
      toast({
        title: "Éxito",
        description: message,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar la sugerencia",
        variant: "destructive",
      });
    },
  });
};

// Hook to generate suggestions (called by Edge Function)
export const useGenerateSuggestions = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (userId?: string) => {
      const targetUserId = userId || user?.id;
      const response = await supabase.functions.invoke('connection-matcher', {
        body: { user_id: targetUserId }
      });

      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["networking-suggestions"] });
      toast({
        title: "Éxito",
        description: "Nuevas sugerencias generadas",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudieron generar sugerencias",
        variant: "destructive",
      });
    },
  });
};

// Hook for suggestion analytics
export const useSuggestionAnalytics = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["suggestion-analytics", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("networking_suggestions")
        .select("status")
        .eq("user_id", user?.id);

      if (error) throw error;

      const analytics = data.reduce((acc, suggestion) => {
        acc[suggestion.status] = (acc[suggestion.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        total: data.length,
        pending: analytics.pending || 0,
        accepted: analytics.accepted || 0,
        dismissed: analytics.dismissed || 0,
        acceptance_rate: data.length > 0 ? ((analytics.accepted || 0) / data.length * 100) : 0,
      };
    },
    enabled: !!user?.id,
  });
};

// Hook for admin suggestion management
export const useAdminSuggestionAnalytics = () => {
  return useQuery({
    queryKey: ["admin-suggestion-analytics"],
    queryFn: async () => {
      const { data: suggestions, error } = await supabase
        .from("networking_suggestions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch user profiles separately
      const enrichedSuggestions = await Promise.all(
        suggestions.map(async (suggestion) => {
          const { data: userProfile } = await supabase
            .from("profiles")
            .select("user_id, display_name")
            .eq("user_id", suggestion.user_id)
            .single();

          const { data: suggestedProfile } = await supabase
            .from("profiles")
            .select("user_id, display_name")
            .eq("user_id", suggestion.suggested_user_id)
            .single();

          return {
            ...suggestion,
            user: userProfile,
            suggested_user: suggestedProfile
          };
        })
      );

      const stats = suggestions.reduce((acc, suggestion) => {
        acc[suggestion.status] = (acc[suggestion.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Calculate match score distribution
      const scoreDistribution = suggestions.reduce((acc, suggestion) => {
        const score = Math.floor(suggestion.match_score * 10) / 10; // Round to 1 decimal
        acc[score] = (acc[score] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);

      return {
        total_suggestions: suggestions.length,
        by_status: stats,
        score_distribution: scoreDistribution,
        average_match_score: suggestions.length > 0 
          ? suggestions.reduce((sum, s) => sum + s.match_score, 0) / suggestions.length 
          : 0,
        suggestions: enrichedSuggestions,
      };
    },
  });
};