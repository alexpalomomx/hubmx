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