import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CommunityCategory {
  id: string;
  value: string;
  label: string;
  description: string | null;
  color: string | null;
  is_active: boolean;
  sort_order: number;
}

export const useCommunityCategories = () => {
  return useQuery({
    queryKey: ['community-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_categories' as any)
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return (data as any[]) as CommunityCategory[];
    },
  });
};

export const useAllCommunityCategories = () => {
  return useQuery({
    queryKey: ['community-categories-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_categories' as any)
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return (data as any[]) as CommunityCategory[];
    },
  });
};
