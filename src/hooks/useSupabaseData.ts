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
          .select('*, author:author_id(display_name)')
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