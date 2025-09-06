import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// Hook for networking analytics
export const useNetworkingAnalytics = (userId?: string) => {
  const { user } = useAuth();
  const targetUserId = userId || user?.id;

  return useQuery({
    queryKey: ["networking-analytics", targetUserId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("networking_analytics")
        .select("*")
        .eq("user_id", targetUserId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!targetUserId,
  });
};

// Hook for networking statistics summary
export const useNetworkingStats = (userId?: string) => {
  const { user } = useAuth();
  const targetUserId = userId || user?.id;

  return useQuery({
    queryKey: ["networking-stats", targetUserId],
    queryFn: async () => {
      const { data: analytics, error } = await supabase
        .from("networking_analytics")
        .select("action_type")
        .eq("user_id", targetUserId);

      if (error) throw error;

      const stats = analytics.reduce((acc, action) => {
        acc[action.action_type] = (acc[action.action_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        profile_views: stats.profile_view || 0,
        connection_requests_sent: stats.connection_request_sent || 0,
        connection_requests_received: stats.connection_request_received || 0,
        connections_made: stats.connection_accepted || 0,
        mentorship_requests_sent: stats.mentorship_request_sent || 0,
        mentorship_requests_received: stats.mentorship_request_received || 0,
        messages_sent: stats.message_sent || 0,
        total_activities: analytics.length,
      };
    },
    enabled: !!targetUserId,
  });
};

// Hook for admin analytics (all users)
export const useAdminNetworkingAnalytics = () => {
  return useQuery({
    queryKey: ["admin-networking-analytics"],
    queryFn: async () => {
      const { data: analytics, error } = await supabase
        .from("networking_analytics")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1000);

      if (error) throw error;

      // Fetch user profiles separately
      const enrichedAnalytics = await Promise.all(
        analytics.map(async (activity) => {
          const { data: userProfile } = await supabase
            .from("profiles")
            .select("user_id, display_name")
            .eq("user_id", activity.user_id)
            .single();

          let targetProfile = null;
          if (activity.target_user_id) {
            const { data: targetUserProfile } = await supabase
              .from("profiles")
              .select("user_id, display_name")
              .eq("user_id", activity.target_user_id)
              .single();
            targetProfile = targetUserProfile;
          }

          return {
            ...activity,
            user: userProfile,
            target_user: targetProfile
          };
        })
      );

      return enrichedAnalytics;
    },
  });
};

// Hook to track networking action
export const useTrackNetworkingAction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      action_type,
      target_user_id,
      event_id,
      metadata = {}
    }: {
      action_type: string;
      target_user_id?: string;
      event_id?: string;
      metadata?: any;
    }) => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) throw new Error("User not authenticated");

      const { data: analyticsData, error: analyticsError } = await supabase
        .from("networking_analytics")
        .insert({
          user_id: data.user.id,
          action_type,
          target_user_id,
          event_id,
          metadata
        })
        .select()
        .single();

      if (analyticsError) throw analyticsError;
      return analyticsData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["networking-analytics"] });
      queryClient.invalidateQueries({ queryKey: ["networking-stats"] });
      queryClient.invalidateQueries({ queryKey: ["admin-networking-analytics"] });
    },
  });
};

// Hook for networking engagement metrics
export const useNetworkingEngagement = (timeRange: "day" | "week" | "month" = "week") => {
  return useQuery({
    queryKey: ["networking-engagement", timeRange],
    queryFn: async () => {
      const now = new Date();
      let dateThreshold: Date;

      switch (timeRange) {
        case "day":
          dateThreshold = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case "week":
          dateThreshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "month":
          dateThreshold = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
      }

      const { data, error } = await supabase
        .from("networking_analytics")
        .select("action_type, created_at")
        .gte("created_at", dateThreshold.toISOString());

      if (error) throw error;

      // Group by action type and count
      const engagement = data.reduce((acc, action) => {
        const type = action.action_type;
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Calculate daily breakdown
      const dailyBreakdown = data.reduce((acc, action) => {
        const date = action.created_at.split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        total_actions: data.length,
        by_action_type: engagement,
        daily_breakdown: dailyBreakdown,
        most_active_day: Object.keys(dailyBreakdown).reduce((a, b) => 
          dailyBreakdown[a] > dailyBreakdown[b] ? a : b, Object.keys(dailyBreakdown)[0]
        ),
      };
    },
  });
};