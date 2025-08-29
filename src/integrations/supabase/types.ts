export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      alliances: {
        Row: {
          alliance_type: string
          approval_status: string | null
          approved_at: string | null
          approved_by: string | null
          benefits: string[] | null
          contact_email: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          logo_url: string | null
          name: string
          rejection_reason: string | null
          status: string | null
          submitted_by: string | null
          updated_at: string
          website_url: string | null
        }
        Insert: {
          alliance_type: string
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          benefits?: string[] | null
          contact_email?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          name: string
          rejection_reason?: string | null
          status?: string | null
          submitted_by?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          alliance_type?: string
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          benefits?: string[] | null
          contact_email?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          rejection_reason?: string | null
          status?: string | null
          submitted_by?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          approval_status: string | null
          approved_at: string | null
          approved_by: string | null
          author_id: string | null
          content: string | null
          created_at: string
          excerpt: string | null
          featured_image_url: string | null
          id: string
          published_at: string | null
          rejection_reason: string | null
          slug: string | null
          status: string | null
          submitted_by: string | null
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          author_id?: string | null
          content?: string | null
          created_at?: string
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          published_at?: string | null
          rejection_reason?: string | null
          slug?: string | null
          status?: string | null
          submitted_by?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          author_id?: string | null
          content?: string | null
          created_at?: string
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          published_at?: string | null
          rejection_reason?: string | null
          slug?: string | null
          status?: string | null
          submitted_by?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      calls: {
        Row: {
          application_deadline: string | null
          application_url: string | null
          approval_status: string | null
          approved_at: string | null
          approved_by: string | null
          benefits: string[] | null
          call_type: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          image_url: string | null
          rejection_reason: string | null
          requirements: string[] | null
          status: string | null
          submitted_by: string | null
          title: string
          updated_at: string
        }
        Insert: {
          application_deadline?: string | null
          application_url?: string | null
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          benefits?: string[] | null
          call_type: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          rejection_reason?: string | null
          requirements?: string[] | null
          status?: string | null
          submitted_by?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          application_deadline?: string | null
          application_url?: string | null
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          benefits?: string[] | null
          call_type?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          rejection_reason?: string | null
          requirements?: string[] | null
          status?: string | null
          submitted_by?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      communities: {
        Row: {
          category: string
          contact_email: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          location: string | null
          logo_url: string | null
          members_count: number | null
          name: string
          social_links: Json | null
          status: string | null
          topics: string[] | null
          updated_at: string
          website_url: string | null
        }
        Insert: {
          category: string
          contact_email?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          location?: string | null
          logo_url?: string | null
          members_count?: number | null
          name: string
          social_links?: Json | null
          status?: string | null
          topics?: string[] | null
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          category?: string
          contact_email?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          location?: string | null
          logo_url?: string | null
          members_count?: number | null
          name?: string
          social_links?: Json | null
          status?: string | null
          topics?: string[] | null
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      community_leaders: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          community_id: string
          id: string
          status: string
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          community_id: string
          id?: string
          status?: string
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          community_id?: string
          id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_leaders_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      community_members: {
        Row: {
          community_id: string
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          joined_at: string
          nickname: string
          phone: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          community_id: string
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          joined_at?: string
          nickname: string
          phone: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          community_id?: string
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          joined_at?: string
          nickname?: string
          phone?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "community_members_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      event_registrations: {
        Row: {
          created_at: string
          email: string
          event_id: string
          id: string
          nickname: string
          updated_at: string
          whatsapp: string
        }
        Insert: {
          created_at?: string
          email: string
          event_id: string
          id?: string
          nickname: string
          updated_at?: string
          whatsapp: string
        }
        Update: {
          created_at?: string
          email?: string
          event_id?: string
          id?: string
          nickname?: string
          updated_at?: string
          whatsapp?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          approval_status: string | null
          approved_at: string | null
          approved_by: string | null
          category: string | null
          created_at: string
          created_by: string | null
          current_attendees: number | null
          description: string | null
          event_date: string
          event_time: string | null
          event_type: string
          id: string
          image_url: string | null
          location: string | null
          max_attendees: number | null
          organizer_id: string | null
          registration_url: string | null
          rejection_reason: string | null
          status: string | null
          submitted_by: string | null
          title: string
          updated_at: string
        }
        Insert: {
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          current_attendees?: number | null
          description?: string | null
          event_date: string
          event_time?: string | null
          event_type?: string
          id?: string
          image_url?: string | null
          location?: string | null
          max_attendees?: number | null
          organizer_id?: string | null
          registration_url?: string | null
          rejection_reason?: string | null
          status?: string | null
          submitted_by?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          current_attendees?: number | null
          description?: string | null
          event_date?: string
          event_time?: string | null
          event_type?: string
          id?: string
          image_url?: string | null
          location?: string | null
          max_attendees?: number | null
          organizer_id?: string | null
          registration_url?: string | null
          rejection_reason?: string | null
          status?: string | null
          submitted_by?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      points_history: {
        Row: {
          action_type: string
          created_at: string
          description: string | null
          id: string
          points_awarded: number
          user_id: string
        }
        Insert: {
          action_type: string
          created_at?: string
          description?: string | null
          id?: string
          points_awarded: number
          user_id: string
        }
        Update: {
          action_type?: string
          created_at?: string
          description?: string | null
          id?: string
          points_awarded?: number
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_points: {
        Row: {
          community_joins: number
          created_at: string
          event_registrations: number
          id: string
          total_points: number
          updated_at: string
          user_id: string
        }
        Insert: {
          community_joins?: number
          created_at?: string
          event_registrations?: number
          id?: string
          total_points?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          community_joins?: number
          created_at?: string
          event_registrations?: number
          id?: string
          total_points?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      award_points: {
        Args: {
          _action_type: string
          _description?: string
          _points: number
          _user_id: string
        }
        Returns: undefined
      }
      get_user_email: {
        Args: { _user_id: string }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_community_leader: {
        Args: { _community_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "coordinator"
        | "user"
        | "community_leader"
        | "collaborator"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "admin",
        "coordinator",
        "user",
        "community_leader",
        "collaborator",
      ],
    },
  },
} as const
