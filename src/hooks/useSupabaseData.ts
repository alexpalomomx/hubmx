import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Hook para obtener comunidades
export const useCommunities = (category?: string) => {
  return useQuery({
    queryKey: ["communities", category],
    queryFn: async () => {
      let query = supabase
        .from("communities")
        .select("*")
        .eq("status", "active")
        .order("members_count", { ascending: false });

      if (category && category !== "all") {
        query = query.eq("category", category);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
};

// Hook para obtener eventos
export const useEvents = (status?: string) => {
  return useQuery({
    queryKey: ["events", status],
    queryFn: async () => {
      let query = supabase
        .from("events")
        .select(`
          *,
          organizer:organizer_id(name)
        `)
        .order("event_date", { ascending: true });

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
};

// Hook para obtener eventos del usuario actual (para líderes de comunidad)
// Incluye eventos creados por el líder, de su comunidad, y de fuentes externas asignadas
export const useMyEvents = (userId?: string, communityId?: string) => {
  return useQuery({
    queryKey: ["my-events", userId, communityId],
    queryFn: async () => {
      if (!userId) return [];
      
      // 1. Get events created by the user or from their community
      let query = supabase
        .from("events")
        .select(`
          *,
          organizer:organizer_id(name)
        `)
        .order("event_date", { ascending: true });

      if (communityId) {
        query = query.or(`submitted_by.eq.${userId},created_by.eq.${userId},organizer_id.eq.${communityId}`);
      } else {
        query = query.or(`submitted_by.eq.${userId},created_by.eq.${userId}`);
      }

      const { data: ownEvents, error } = await query;
      if (error) throw error;

      // 2. Get events from assigned external sources
      const { data: sources } = await supabase
        .from("event_sources")
        .select("id")
        .eq("assigned_leader_id", userId);

      let sourceEvents: any[] = [];
      if (sources && sources.length > 0) {
        const sourceIds = sources.map(s => s.id);
        const { data: sEvents } = await supabase
          .from("events")
          .select(`*, organizer:organizer_id(name)`)
          .in("source_id", sourceIds)
          .order("event_date", { ascending: true });
        sourceEvents = sEvents || [];
      }

      // 3. Merge and deduplicate
      const allEvents = [...(ownEvents || [])];
      const existingIds = new Set(allEvents.map(e => e.id));
      for (const ev of sourceEvents) {
        if (!existingIds.has(ev.id)) {
          allEvents.push(ev);
        }
      }

      return allEvents.sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());
    },
    enabled: !!userId,
  });
};

// Hook para obtener fuentes de eventos del usuario actual
export const useMyEventSources = (userId?: string) => {
  return useQuery({
    queryKey: ["my-event-sources", userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from("event_sources")
        .select("*")
        .eq("created_by", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
};

// Hook para obtener fuentes de eventos asignadas a un líder
export const useLeaderAssignedEventSources = (userId?: string) => {
  return useQuery({
    queryKey: ["leader-assigned-event-sources", userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from("event_sources")
        .select("*")
        .eq("assigned_leader_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
};

// Hook legacy para obtener fuentes de eventos asignadas a una comunidad
export const useCommunityEventSources = (communityId?: string) => {
  return useQuery({
    queryKey: ["community-event-sources", communityId],
    queryFn: async () => {
      if (!communityId) return [];
      
      const { data, error } = await supabase
        .from("event_sources")
        .select("*")
        .eq("community_id", communityId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!communityId,
  });
};

// Hook para obtener intereses de eventos de fuentes de una comunidad
export const useCommunityEventInterests = (communityId?: string) => {
  return useQuery({
    queryKey: ["community-event-interests", communityId],
    queryFn: async () => {
      if (!communityId) return [];

      const { data: sources, error: sourcesError } = await supabase
        .from("event_sources")
        .select("id")
        .eq("community_id", communityId);

      if (sourcesError) throw sourcesError;
      if (!sources || sources.length === 0) return [];

      const sourceIds = sources.map(s => s.id);

      const { data: events, error: eventsError } = await supabase
        .from("events")
        .select("id, title, event_date")
        .in("source_id", sourceIds);

      if (eventsError) throw eventsError;
      if (!events || events.length === 0) return [];

      const eventIds = events.map(e => e.id);

      const { data: interests, error: interestsError } = await supabase
        .from("event_interests")
        .select(`
          id,
          user_id,
          event_id,
          created_at,
          events (id, title, event_date),
          profiles (display_name, avatar_url)
        `)
        .in("event_id", eventIds)
        .order("created_at", { ascending: false });

      if (interestsError) throw interestsError;
      return interests || [];
    },
    enabled: !!communityId,
  });
};

// Hook para obtener eventos de fuentes externas asignadas a un líder
export const useLeaderSourceEvents = (userId?: string) => {
  return useQuery({
    queryKey: ["leader-source-events", userId],
    queryFn: async () => {
      if (!userId) return [];

      // Get sources assigned to this leader
      const { data: sources, error: sourcesError } = await supabase
        .from("event_sources")
        .select("id")
        .eq("assigned_leader_id", userId);

      if (sourcesError) throw sourcesError;
      if (!sources || sources.length === 0) return [];

      const sourceIds = sources.map(s => s.id);

      const { data: events, error: eventsError } = await supabase
        .from("events")
        .select(`*, organizer:organizer_id(name)`)
        .in("source_id", sourceIds)
        .order("event_date", { ascending: true });

      if (eventsError) throw eventsError;
      return events || [];
    },
    enabled: !!userId,
  });
};

// Hook para obtener intereses de eventos de fuentes asignadas a un líder
export const useLeaderEventInterests = (userId?: string) => {
  return useQuery({
    queryKey: ["leader-event-interests", userId],
    queryFn: async () => {
      if (!userId) return [];

      // Get sources assigned to this leader
      const { data: sources, error: sourcesError } = await supabase
        .from("event_sources")
        .select("id")
        .eq("assigned_leader_id", userId);

      if (sourcesError) throw sourcesError;
      if (!sources || sources.length === 0) return [];

      const sourceIds = sources.map(s => s.id);

      // Get events from those sources
      const { data: events, error: eventsError } = await supabase
        .from("events")
        .select("id, title, event_date")
        .in("source_id", sourceIds);

      if (eventsError) throw eventsError;
      if (!events || events.length === 0) return [];

      const eventIds = events.map(e => e.id);

      // Get interests for those events
      const { data: interests, error: interestsError } = await supabase
        .from("event_interests")
        .select(`
          id,
          user_id,
          event_id,
          created_at,
          events (id, title, event_date),
          profiles (display_name, avatar_url)
        `)
        .in("event_id", eventIds)
        .order("created_at", { ascending: false });

      if (interestsError) throw interestsError;
      return interests || [];
    },
    enabled: !!userId,
  });
};

// Hook para obtener alianzas
export const useAlliances = () => {
  return useQuery({
    queryKey: ["alliances"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("alliances")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};

// Hook para obtener convocatorias
export const useCalls = (status?: string) => {
  return useQuery({
    queryKey: ["calls", status],
    queryFn: async () => {
      let query = supabase
        .from("calls")
        .select("*")
        .order("application_deadline", { ascending: true });

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
};

// Hook para obtener posts del blog
export const useBlogPosts = () => {
  return useQuery({
    queryKey: ["blogPosts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select(`
          *,
          author:author_id(display_name)
        `)
        .eq("status", "published")
        .order("published_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};

// Hook para obtener registros de eventos
export const useEventRegistrations = (eventId?: string) => {
  return useQuery({
    queryKey: ["eventRegistrations", eventId],
    queryFn: async () => {
      let query = supabase
        .from("event_registrations")
        .select(`
          *,
          event:event_id(title, event_date)
        `)
        .order("created_at", { ascending: false });

      if (eventId) {
        query = query.eq("event_id", eventId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
};

// Hook para obtener estadísticas generales
export const useStats = () => {
  return useQuery({
    queryKey: ["stats"],
    queryFn: async () => {
      const [communitiesRes, eventsRes, alliancesRes] = await Promise.all([
        supabase.from("communities").select("id", { count: "exact" }).eq("status", "active"),
        supabase.from("events").select("id", { count: "exact" }),
        supabase.from("alliances").select("id", { count: "exact" }).eq("status", "active"),
      ]);

      // Obtener total de miembros sumando members_count
      const { data: memberData } = await supabase
        .from("communities")
        .select("members_count")
        .eq("status", "active");

      const totalMembers = memberData?.reduce((sum, community) => sum + (community.members_count || 0), 0) || 0;

      return {
        communities: communitiesRes.count || 0,
        events: eventsRes.count || 0,
        alliances: alliancesRes.count || 0,
        members: totalMembers,
      };
    },
  });
};

// Hook para obtener solicitudes pendientes de aprobación
export const usePendingApprovals = () => {
  return useQuery({
    queryKey: ['pending-approvals'],
    queryFn: async () => {
      const [
        communitiesRes, 
        alliancesRes, 
        eventsRes, 
        callsRes, 
        blogPostsRes
      ] = await Promise.all([
        supabase
          .from('communities')
          .select('*')
          .eq('status', 'pending')
          .order('created_at', { ascending: false }),
        supabase
          .from('alliances')
          .select('*')
          .eq('approval_status', 'pending')
          .order('created_at', { ascending: false }),
        supabase
          .from('events')
          .select('*, organizer:organizer_id(name)')
          .eq('approval_status', 'pending')
          .order('created_at', { ascending: false }),
        supabase
          .from('calls')
          .select('*')
          .eq('approval_status', 'pending')
          .order('created_at', { ascending: false }),
        supabase
          .from('blog_posts')
          .select('*')
          .eq('approval_status', 'pending')
          .order('created_at', { ascending: false })
      ]);

      if (communitiesRes.error) throw communitiesRes.error;
      if (alliancesRes.error) throw alliancesRes.error;
      if (eventsRes.error) throw eventsRes.error;
      if (callsRes.error) throw callsRes.error;
      if (blogPostsRes.error) throw blogPostsRes.error;

      return {
        communities: communitiesRes.data || [],
        alliances: alliancesRes.data || [],
        events: eventsRes.data || [],
        calls: callsRes.data || [],
        blogPosts: blogPostsRes.data || []
      };
    },
  });
};

// Hook para obtener miembros de comunidades
export const useCommunityMembers = (communityId?: string) => {
  return useQuery({
    queryKey: ['community-members', communityId],
    queryFn: async () => {
      let query = supabase
        .from('community_members')
        .select('*')
        .order('created_at', { ascending: false });

      if (communityId) {
        query = query.eq('community_id', communityId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
};

// Hook para obtener las comunidades de un usuario específico (usando user_id)
export const useUserCommunities = (userId?: string) => {
  return useQuery({
    queryKey: ['user-communities', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('community_members')
        .select(`
          id,
          community_id,
          joined_at,
          nickname,
          communities (
            id,
            name,
            description,
            category,
            logo_url,
            website_url,
            members_count,
            topics
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('joined_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  }) as any;
};

// Hook para obtener los eventos registrados por un usuario (usando email)
export const useUserEventRegistrations = (userEmail?: string) => {
  return useQuery({
    queryKey: ['user-event-registrations', userEmail],
    queryFn: async () => {
      if (!userEmail) return [];
      
      const { data, error } = await supabase
        .from('event_registrations')
        .select(`
          id,
          event_id,
          created_at,
          events (
            id,
            title,
            description,
            event_date,
            event_time,
            location,
            event_type,
            status,
            current_attendees,
            max_attendees
          )
        `)
        .eq('email', userEmail)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!userEmail,
  }) as any;
};

export const useUserPoints = () => {
  return useQuery({
    queryKey: ['user-points'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_points')
        .select(`
          *,
          profiles(display_name, avatar_url)
        `)
        .order('total_points', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data;
    },
  });
};

// Hook para registrar y obtener intereses en eventos
export const useEventInterests = (userId?: string) => {
  return useQuery({
    queryKey: ['event-interests', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('event_interests')
        .select(`
          id,
          event_id,
          created_at,
          events (
            id,
            title,
            description,
            event_date,
            event_time,
            location,
            event_type,
            status,
            current_attendees,
            max_attendees
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });
};

// Hook para verificar si el usuario ya mostró interés en un evento
export const useUserEventInterest = (userId?: string, eventId?: string) => {
  return useQuery({
    queryKey: ['user-event-interest', userId, eventId],
    queryFn: async () => {
      if (!userId || !eventId) return null;
      
      const { data, error } = await supabase
        .from('event_interests')
        .select('id')
        .eq('user_id', userId)
        .eq('event_id', eventId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!userId && !!eventId,
  });
};

// Hook para obtener todos los intereses de eventos (admin)
export const useAllEventInterests = (eventId?: string) => {
  return useQuery({
    queryKey: ['all-event-interests', eventId],
    queryFn: async () => {
      let query = supabase
        .from('event_interests')
        .select(`
          id,
          user_id,
          event_id,
          created_at,
          events (
            id,
            title,
            event_date
          ),
          profiles (
            display_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (eventId && eventId !== "all") {
        query = query.eq('event_id', eventId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });
};