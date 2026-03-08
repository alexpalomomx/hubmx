import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type TimeRange = "7d" | "30d" | "90d" | "all";

const getDateThreshold = (range: TimeRange): string | null => {
  if (range === "all") return null;
  const now = new Date();
  const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
  const threshold = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return threshold.toISOString();
};

export const useImpactReport = (timeRange: TimeRange = "all") => {
  const dateThreshold = getDateThreshold(timeRange);

  const communitiesQuery = useQuery({
    queryKey: ["impact-communities", timeRange],
    queryFn: async () => {
      let query = supabase.from("communities").select("id, name, category, members_count, created_at").eq("status", "active");
      if (dateThreshold) query = query.gte("created_at", dateThreshold);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  const allCommunitiesQuery = useQuery({
    queryKey: ["impact-all-communities"],
    queryFn: async () => {
      const { count, error } = await supabase.from("communities").select("id", { count: "exact", head: true }).eq("status", "active");
      if (error) throw error;
      return count || 0;
    },
  });

  const eventsQuery = useQuery({
    queryKey: ["impact-events", timeRange],
    queryFn: async () => {
      let query = supabase.from("events").select("id, title, event_date, category, source_id, approval_status");
      if (dateThreshold) query = query.gte("created_at", dateThreshold);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  const eventInterestsQuery = useQuery({
    queryKey: ["impact-event-interests", timeRange],
    queryFn: async () => {
      let query = supabase.from("event_interests").select("id, event_id, created_at");
      if (dateThreshold) query = query.gte("created_at", dateThreshold);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  const communityMembersQuery = useQuery({
    queryKey: ["impact-community-members", timeRange],
    queryFn: async () => {
      let query = supabase.from("community_members").select("id, community_id, created_at").eq("status", "active");
      if (dateThreshold) query = query.gte("created_at", dateThreshold);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  const connectionsQuery = useQuery({
    queryKey: ["impact-connections", timeRange],
    queryFn: async () => {
      let query = supabase.from("user_connections").select("id, status, created_at");
      if (dateThreshold) query = query.gte("created_at", dateThreshold);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  const categoriesQuery = useQuery({
    queryKey: ["impact-categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("community_categories").select("value, label").eq("is_active", true);
      if (error) throw error;
      return data || [];
    },
  });

  // Compute derived metrics
  const events = eventsQuery.data || [];
  const interests = eventInterestsQuery.data || [];
  const communities = communitiesQuery.data || [];
  const members = communityMembersQuery.data || [];
  const connections = connectionsQuery.data || [];
  const categories = categoriesQuery.data || [];

  // Top events by interest count
  const interestsByEvent = interests.reduce((acc, i) => {
    acc[i.event_id] = (acc[i.event_id] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topEvents = events
    .map((e) => ({ ...e, interest_count: interestsByEvent[e.id] || 0 }))
    .sort((a, b) => b.interest_count - a.interest_count)
    .slice(0, 10);

  // Category distribution
  const categoryCount = communities.reduce((acc, c) => {
    const label = categories.find((cat) => cat.value === c.category)?.label || c.category;
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryData = Object.entries(categoryCount).map(([name, value]) => ({ name, value }));

  // Members by community (top 10)
  const membersByCommunity = members.reduce((acc, m) => {
    acc[m.community_id] = (acc[m.community_id] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Connection stats
  const acceptedConnections = connections.filter((c) => c.status === "accepted").length;
  const pendingConnections = connections.filter((c) => c.status === "pending").length;

  const isLoading = communitiesQuery.isLoading || eventsQuery.isLoading || eventInterestsQuery.isLoading || communityMembersQuery.isLoading || connectionsQuery.isLoading;

  return {
    isLoading,
    totalCommunities: allCommunitiesQuery.data || 0,
    newCommunities: communities.length,
    totalEvents: events.length,
    totalInterests: interests.length,
    totalMembers: members.length,
    totalConnections: connections.length,
    acceptedConnections,
    pendingConnections,
    topEvents,
    categoryData,
    membersByCommunity,
    communities,
    events,
    interests,
    members,
    connections,
    categories,
  };
};
