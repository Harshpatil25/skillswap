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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      certificates: {
        Row: {
          certificate_url: string | null
          code: string
          id: string
          issued_at: string
          profile_id: string
          title: string
          workshop_id: string | null
        }
        Insert: {
          certificate_url?: string | null
          code?: string
          id?: string
          issued_at?: string
          profile_id: string
          title: string
          workshop_id?: string | null
        }
        Update: {
          certificate_url?: string | null
          code?: string
          id?: string
          issued_at?: string
          profile_id?: string
          title?: string
          workshop_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "certificates_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_workshop_id_fkey"
            columns: ["workshop_id"]
            isOneToOne: false
            referencedRelation: "workshops"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          city: string | null
          created_at: string
          description: string | null
          id: string
          industry: string | null
          latitude: number | null
          logo_url: string | null
          longitude: number | null
          name: string
          owner_profile_id: string | null
          team_size: string | null
          updated_at: string
          verified: boolean
          website: string | null
        }
        Insert: {
          city?: string | null
          created_at?: string
          description?: string | null
          id?: string
          industry?: string | null
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          name: string
          owner_profile_id?: string | null
          team_size?: string | null
          updated_at?: string
          verified?: boolean
          website?: string | null
        }
        Update: {
          city?: string | null
          created_at?: string
          description?: string | null
          id?: string
          industry?: string | null
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          name?: string
          owner_profile_id?: string | null
          team_size?: string | null
          updated_at?: string
          verified?: boolean
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "companies_owner_profile_id_fkey"
            columns: ["owner_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          profile_id: string
        }
        Insert: {
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          profile_id: string
        }
        Update: {
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      internship_applications: {
        Row: {
          cover_note: string | null
          created_at: string
          id: string
          internship_id: string
          profile_id: string
          resume_url: string | null
          status: Database["public"]["Enums"]["application_status"]
        }
        Insert: {
          cover_note?: string | null
          created_at?: string
          id?: string
          internship_id: string
          profile_id: string
          resume_url?: string | null
          status?: Database["public"]["Enums"]["application_status"]
        }
        Update: {
          cover_note?: string | null
          created_at?: string
          id?: string
          internship_id?: string
          profile_id?: string
          resume_url?: string | null
          status?: Database["public"]["Enums"]["application_status"]
        }
        Relationships: [
          {
            foreignKeyName: "internship_applications_internship_id_fkey"
            columns: ["internship_id"]
            isOneToOne: false
            referencedRelation: "internships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "internship_applications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      internships: {
        Row: {
          company_id: string
          created_at: string
          deadline: string | null
          description: string | null
          duration_months: number
          id: string
          is_open: boolean
          latitude: number | null
          location: string | null
          longitude: number | null
          mode: Database["public"]["Enums"]["workshop_mode"]
          openings: number
          skills: string[]
          stipend: number
          title: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          deadline?: string | null
          description?: string | null
          duration_months?: number
          id?: string
          is_open?: boolean
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          mode?: Database["public"]["Enums"]["workshop_mode"]
          openings?: number
          skills?: string[]
          stipend?: number
          title: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          deadline?: string | null
          description?: string | null
          duration_months?: number
          id?: string
          is_open?: boolean
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          mode?: Database["public"]["Enums"]["workshop_mode"]
          openings?: number
          skills?: string[]
          stipend?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "internships_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      mentor_reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          mentor_profile_id: string
          rating: number
          reviewer_profile_id: string | null
          workshop_id: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          mentor_profile_id: string
          rating?: number
          reviewer_profile_id?: string | null
          workshop_id?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          mentor_profile_id?: string
          rating?: number
          reviewer_profile_id?: string | null
          workshop_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mentor_reviews_mentor_profile_id_fkey"
            columns: ["mentor_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentor_reviews_reviewer_profile_id_fkey"
            columns: ["reviewer_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentor_reviews_workshop_id_fkey"
            columns: ["workshop_id"]
            isOneToOne: false
            referencedRelation: "workshops"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          body: string
          created_at: string
          id: string
          is_read: boolean
          recipient_profile_id: string
          sender_profile_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          is_read?: boolean
          recipient_profile_id: string
          sender_profile_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          is_read?: boolean
          recipient_profile_id?: string
          sender_profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_recipient_profile_id_fkey"
            columns: ["recipient_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_profile_id_fkey"
            columns: ["sender_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          profile_id: string
          title: string
          type: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          profile_id: string
          title: string
          type?: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          profile_id?: string
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          city: string | null
          created_at: string
          email: string | null
          experience_years: number
          full_name: string
          headline: string | null
          hourly_rate: number
          id: string
          is_demo: boolean
          languages: string[]
          latitude: number | null
          longitude: number | null
          rating: number
          rating_count: number
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          experience_years?: number
          full_name?: string
          headline?: string | null
          hourly_rate?: number
          id?: string
          is_demo?: boolean
          languages?: string[]
          latitude?: number | null
          longitude?: number | null
          rating?: number
          rating_count?: number
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          experience_years?: number
          full_name?: string
          headline?: string | null
          hourly_rate?: number
          id?: string
          is_demo?: boolean
          languages?: string[]
          latitude?: number | null
          longitude?: number | null
          rating?: number
          rating_count?: number
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      skills: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          name: string
          popularity: number
          slug: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          popularity?: number
          slug: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          popularity?: number
          slug?: string
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
      user_skills: {
        Row: {
          created_at: string
          id: string
          is_teaching: boolean
          level: string
          profile_id: string
          skill_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_teaching?: boolean
          level?: string
          profile_id: string
          skill_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_teaching?: boolean
          level?: string
          profile_id?: string
          skill_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_skills_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      workshop_registrations: {
        Row: {
          attended: boolean
          created_at: string
          id: string
          profile_id: string
          progress: number
          status: Database["public"]["Enums"]["registration_status"]
          workshop_id: string
        }
        Insert: {
          attended?: boolean
          created_at?: string
          id?: string
          profile_id: string
          progress?: number
          status?: Database["public"]["Enums"]["registration_status"]
          workshop_id: string
        }
        Update: {
          attended?: boolean
          created_at?: string
          id?: string
          profile_id?: string
          progress?: number
          status?: Database["public"]["Enums"]["registration_status"]
          workshop_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workshop_registrations_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workshop_registrations_workshop_id_fkey"
            columns: ["workshop_id"]
            isOneToOne: false
            referencedRelation: "workshops"
            referencedColumns: ["id"]
          },
        ]
      }
      workshops: {
        Row: {
          address: string | null
          banner_url: string | null
          capacity: number
          category: string
          city: string | null
          company_id: string | null
          created_at: string
          description: string | null
          duration_minutes: number
          host_profile_id: string | null
          id: string
          language: string
          latitude: number | null
          level: string
          longitude: number | null
          mode: Database["public"]["Enums"]["workshop_mode"]
          price: number
          rating: number
          rating_count: number
          seats_taken: number
          skill_id: string | null
          slug: string
          starts_at: string
          status: Database["public"]["Enums"]["workshop_status"]
          title: string
          updated_at: string
          views: number
        }
        Insert: {
          address?: string | null
          banner_url?: string | null
          capacity?: number
          category?: string
          city?: string | null
          company_id?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number
          host_profile_id?: string | null
          id?: string
          language?: string
          latitude?: number | null
          level?: string
          longitude?: number | null
          mode?: Database["public"]["Enums"]["workshop_mode"]
          price?: number
          rating?: number
          rating_count?: number
          seats_taken?: number
          skill_id?: string | null
          slug: string
          starts_at?: string
          status?: Database["public"]["Enums"]["workshop_status"]
          title: string
          updated_at?: string
          views?: number
        }
        Update: {
          address?: string | null
          banner_url?: string | null
          capacity?: number
          category?: string
          city?: string | null
          company_id?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number
          host_profile_id?: string | null
          id?: string
          language?: string
          latitude?: number | null
          level?: string
          longitude?: number | null
          mode?: Database["public"]["Enums"]["workshop_mode"]
          price?: number
          rating?: number
          rating_count?: number
          seats_taken?: number
          skill_id?: string | null
          slug?: string
          starts_at?: string
          status?: Database["public"]["Enums"]["workshop_status"]
          title?: string
          updated_at?: string
          views?: number
        }
        Relationships: [
          {
            foreignKeyName: "workshops_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workshops_host_profile_id_fkey"
            columns: ["host_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workshops_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_profile_id: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "student" | "mentor" | "msme" | "admin"
      application_status: "applied" | "shortlisted" | "rejected" | "hired"
      registration_status: "registered" | "cancelled" | "completed"
      workshop_mode: "online" | "offline" | "hybrid"
      workshop_status: "pending" | "approved" | "rejected" | "cancelled"
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
      app_role: ["student", "mentor", "msme", "admin"],
      application_status: ["applied", "shortlisted", "rejected", "hired"],
      registration_status: ["registered", "cancelled", "completed"],
      workshop_mode: ["online", "offline", "hybrid"],
      workshop_status: ["pending", "approved", "rejected", "cancelled"],
    },
  },
} as const
