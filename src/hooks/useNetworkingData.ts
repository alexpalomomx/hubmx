import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Hook for user connections
export const useUserConnections = () => {
  return useQuery({
    queryKey: ["user-connections"],
    queryFn: async () => {
      // Get connections and then fetch profile data separately
      const { data: connections, error } = await supabase
        .from("user_connections")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;

      // Get all unique user IDs
      const userIds = [
        ...connections.map(c => c.requester_id),
        ...connections.map(c => c.requested_id)
      ];

      // Get profile data for all users
      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .in("user_id", userIds);

      // Combine data
      const connectionsWithProfiles = connections.map(connection => ({
        ...connection,
        requester: profiles?.find(p => p.user_id === connection.requester_id),
        requested: profiles?.find(p => p.user_id === connection.requested_id)
      }));

      return connectionsWithProfiles;
    },
  });
};

// Hook for connection requests (pending)
export const useConnectionRequests = () => {
  return useQuery({
    queryKey: ["connection-requests"],
    queryFn: async () => {
      // Get connection requests and then fetch profile data separately
      const { data: requests, error } = await supabase
        .from("user_connections")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      
      if (error) throw error;

      // Get all unique user IDs
      const userIds = [
        ...requests.map(r => r.requester_id),
        ...requests.map(r => r.requested_id)
      ];

      // Get profile data for all users
      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .in("user_id", userIds);

      // Combine data
      const requestsWithProfiles = requests.map(request => ({
        ...request,
        requester: profiles?.find(p => p.user_id === request.requester_id),
        requested: profiles?.find(p => p.user_id === request.requested_id)
      }));

      return requestsWithProfiles;
    },
  });
};

// Hook for member directory with networking profiles
export const useMemberDirectory = (filters?: {
  search?: string;
  skills?: string[];
  location?: string;
  available_for_mentoring?: boolean;
}) => {
  return useQuery({
    queryKey: ["member-directory", filters],
    queryFn: async () => {
      // Get profiles with networking data in separate queries for better type safety
      const profilesQuery = supabase
        .from("profiles")
        .select("*")
        .order("display_name");

      if (filters?.search) {
        profilesQuery.ilike("display_name", `%${filters.search}%`);
      }

      const { data: profiles, error: profilesError } = await profilesQuery;
      if (profilesError) throw profilesError;

      // Get networking profiles
      const { data: networkingProfiles } = await supabase
        .from("user_networking_profile")
        .select("*");

      // Get skills
      const { data: userSkills } = await supabase
        .from("user_skills")
        .select("*");

      // Get interests
      const { data: userInterests } = await supabase
        .from("user_interests")
        .select("*");

      // Combine data
      let combinedData = profiles?.map((profile) => ({
        ...profile,
        networking_profile: networkingProfiles?.find(np => np.user_id === profile.user_id),
        skills: userSkills?.filter(skill => skill.user_id === profile.user_id) || [],
        interests: userInterests?.filter(interest => interest.user_id === profile.user_id) || [],
      })) || [];

      // Apply additional filters
      if (filters?.location) {
        combinedData = combinedData.filter(
          (member) => 
            member.networking_profile?.location?.toLowerCase().includes(filters.location!.toLowerCase())
        );
      }

      if (filters?.available_for_mentoring !== undefined) {
        combinedData = combinedData.filter(
          (member) => 
            member.networking_profile?.is_available_for_mentoring === filters.available_for_mentoring
        );
      }

      if (filters?.skills && filters.skills.length > 0) {
        combinedData = combinedData.filter((member) =>
          member.skills?.some((skill: any) =>
            filters.skills!.some((filterSkill) =>
              skill.skill_name.toLowerCase().includes(filterSkill.toLowerCase())
            )
          )
        );
      }

      return combinedData;
    },
  });
};

// Hook for user skills
export const useUserSkills = (userId?: string) => {
  return useQuery({
    queryKey: ["user-skills", userId],
    queryFn: async () => {
      let query = supabase.from("user_skills").select("*");
      
      if (userId) {
        query = query.eq("user_id", userId);
      }
      
      const { data, error } = await query.order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
};

// Hook for user interests
export const useUserInterests = (userId?: string) => {
  return useQuery({
    queryKey: ["user-interests", userId],
    queryFn: async () => {
      let query = supabase.from("user_interests").select("*");
      
      if (userId) {
        query = query.eq("user_id", userId);
      }
      
      const { data, error } = await query.order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
};

// Hook for networking profile
export const useNetworkingProfile = (userId?: string) => {
  return useQuery({
    queryKey: ["networking-profile", userId],
    queryFn: async () => {
      let query = supabase.from("user_networking_profile").select("*");
      
      if (userId) {
        query = query.eq("user_id", userId);
      }
      
      const { data, error } = await query.single();
      
      if (error && error.code !== 'PGRST116') throw error; // Ignore not found error
      return data;
    },
  });
};

// Hook for mentorship requests
export const useMentorshipRequests = () => {
  return useQuery({
    queryKey: ["mentorship-requests"],
    queryFn: async () => {
      // Get mentorship requests and then fetch profile data separately
      const { data: requests, error } = await supabase
        .from("mentorship_requests")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;

      // Get all unique user IDs
      const userIds = [
        ...requests.map(r => r.mentor_id),
        ...requests.map(r => r.mentee_id)
      ];

      // Get profile data for all users
      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .in("user_id", userIds);

      // Combine data
      const requestsWithProfiles = requests.map(request => ({
        ...request,
        mentor: profiles?.find(p => p.user_id === request.mentor_id),
        mentee: profiles?.find(p => p.user_id === request.mentee_id)
      }));

      return requestsWithProfiles;
    },
  });
};

// Mutation hooks
export const useCreateConnection = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ requested_id, message }: { requested_id: string; message?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuario no autenticado");

      const { data, error } = await supabase
        .from("user_connections")
        .insert({
          requester_id: user.id,
          requested_id,
          message,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-connections"] });
      queryClient.invalidateQueries({ queryKey: ["connection-requests"] });
      toast({
        title: "Solicitud enviada",
        description: "Tu solicitud de conexión ha sido enviada.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateConnection = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "pending" | "accepted" | "blocked" | "cancelled" }) => {
      const { data, error } = await supabase
        .from("user_connections")
        .update({ status })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error('Error updating connection:', error);
        throw error;
      }
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["user-connections"] });
      queryClient.invalidateQueries({ queryKey: ["connection-requests"] });
      queryClient.invalidateQueries({ queryKey: ["member-directory"] });
      
      const message = variables.status === "accepted" 
        ? "Conexión aceptada exitosamente"
        : variables.status === "cancelled"
        ? "Conexión rechazada"
        : "Conexión actualizada";
      
      toast({
        title: "Éxito",
        description: message,
      });
    },
    onError: (error: any) => {
      console.error('Connection update error:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar la conexión",
        variant: "destructive",
      });
    },
  });
};

export const useCreateMentorshipRequest = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      mentor_id, 
      skill_area, 
      message 
    }: { 
      mentor_id: string; 
      skill_area: string; 
      message?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuario no autenticado");

      const { data, error } = await supabase
        .from("mentorship_requests")
        .insert({
          mentor_id,
          mentee_id: user.id,
          skill_area,
          message,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mentorship-requests"] });
      toast({
        title: "Solicitud enviada",
        description: "Tu solicitud de mentoría ha sido enviada.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateNetworkingProfile = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (profileData: any) => {
      const { data, error } = await supabase
        .from("user_networking_profile")
        .upsert(profileData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["networking-profile"] });
      queryClient.invalidateQueries({ queryKey: ["member-directory"] });
      toast({
        title: "Perfil actualizado",
        description: "Tu perfil de networking ha sido actualizado.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useAddSkill = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (skillData: {
      skill_name: string;
      proficiency_level: number;
      is_offering_mentorship?: boolean;
      is_seeking_mentorship?: boolean;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuario no autenticado");

      const { data, error } = await supabase
        .from("user_skills")
        .insert({
          user_id: user.id,
          ...skillData
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-skills"] });
      queryClient.invalidateQueries({ queryKey: ["member-directory"] });
      toast({
        title: "Habilidad agregada",
        description: "La habilidad ha sido agregada a tu perfil.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useAddInterest = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ interest_name }: { interest_name: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuario no autenticado");

      const { data, error } = await supabase
        .from("user_interests")
        .insert({ 
          user_id: user.id,
          interest_name 
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-interests"] });
      queryClient.invalidateQueries({ queryKey: ["member-directory"] });
      toast({
        title: "Interés agregado",
        description: "El interés ha sido agregado a tu perfil.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Update mentorship request status
export const useUpdateMentorship = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updateData }: { 
      id: string; 
      status?: "pending" | "active" | "completed" | "cancelled"; 
      start_date?: string; 
      end_date?: string; 
    }) => {
      console.log('Updating mentorship:', id, updateData);
      
      const { data, error } = await supabase
        .from("mentorship_requests")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error('Error updating mentorship:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      console.log('Mentorship updated successfully:', data);
      queryClient.invalidateQueries({ queryKey: ["mentorship-requests"] });
      
      const statusMessage = data.status === "active" 
        ? "Mentoría aceptada exitosamente"
        : data.status === "cancelled"
        ? "Mentoría rechazada"  
        : data.status === "completed"
        ? "Mentoría marcada como completada"
        : "Mentoría actualizada";
      
      toast({
        title: "Éxito",
        description: statusMessage,
      });
    },
    onError: (error) => {
      console.error('Error updating mentorship:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la mentoría",
        variant: "destructive",
      });
    },
  });
};