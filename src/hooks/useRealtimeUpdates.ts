import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useRealtimeUpdates = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    // Canal para actualizaciones en tiempo real
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'communities'
        },
        (payload) => {
          console.log('Community change:', payload);
          // Invalidar queries relacionadas con comunidades
          queryClient.invalidateQueries({ queryKey: ['communities'] });
          queryClient.invalidateQueries({ queryKey: ['stats'] });
          
          if (payload.eventType === 'INSERT') {
            toast({
              title: "Nueva comunidad",
              description: "Se ha registrado una nueva comunidad en la plataforma",
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'events'
        },
        (payload) => {
          console.log('Event change:', payload);
          queryClient.invalidateQueries({ queryKey: ['events'] });
          queryClient.invalidateQueries({ queryKey: ['stats'] });
          
          if (payload.eventType === 'INSERT') {
            toast({
              title: "Nuevo evento",
              description: "Se ha publicado un nuevo evento",
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'calls'
        },
        (payload) => {
          console.log('Call change:', payload);
          queryClient.invalidateQueries({ queryKey: ['calls'] });
          
          if (payload.eventType === 'INSERT' && payload.new?.status === 'open') {
            toast({
              title: "Nueva convocatoria",
              description: "Se ha abierto una nueva convocatoria",
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'alliances'
        },
        (payload) => {
          console.log('Alliance change:', payload);
          queryClient.invalidateQueries({ queryKey: ['alliances'] });
          queryClient.invalidateQueries({ queryKey: ['stats'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'blog_posts'
        },
        (payload) => {
          console.log('Blog post change:', payload);
          queryClient.invalidateQueries({ queryKey: ['blogPosts'] });
          
          if (payload.eventType === 'UPDATE' && 
              payload.old?.status !== 'published' && 
              payload.new?.status === 'published') {
            toast({
              title: "Nueva publicación",
              description: "Se ha publicado una nueva entrada en el blog",
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, toast]);

  return null;
};