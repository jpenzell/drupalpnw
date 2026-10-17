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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      big_idea_submissions: {
        Row: {
          caption: string | null
          created_at: string
          id: string
          photo_url: string
          session_id: string
          user_id: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          photo_url: string
          session_id: string
          user_id: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          photo_url?: string
          session_id?: string
          user_id?: string
        }
        Relationships: []
      }
      connect_submissions: {
        Row: {
          created_at: string
          email: string | null
          id: string
          linkedin_clicked: boolean
          name: string | null
          note: string | null
          user_agent: string | null
          wants_followup: boolean
          wants_slides: boolean
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          linkedin_clicked?: boolean
          name?: string | null
          note?: string | null
          user_agent?: string | null
          wants_followup?: boolean
          wants_slides?: boolean
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          linkedin_clicked?: boolean
          name?: string | null
          note?: string | null
          user_agent?: string | null
          wants_followup?: boolean
          wants_slides?: boolean
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      polls: {
        Row: {
          created_at: string
          id: string
          is_open: boolean | null
          poll_config: Json | null
          poll_type: Database["public"]["Enums"]["poll_type"]
          session_id: string
          slide_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_open?: boolean | null
          poll_config?: Json | null
          poll_type: Database["public"]["Enums"]["poll_type"]
          session_id: string
          slide_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_open?: boolean | null
          poll_config?: Json | null
          poll_type?: Database["public"]["Enums"]["poll_type"]
          session_id?: string
          slide_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "polls_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      responses: {
        Row: {
          created_at: string
          id: string
          participant_id: string
          poll_id: string
          value: Json
        }
        Insert: {
          created_at?: string
          id?: string
          participant_id: string
          poll_id: string
          value: Json
        }
        Update: {
          created_at?: string
          id?: string
          participant_id?: string
          poll_id?: string
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "responses_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          code: string
          created_at: string
          current_slide: string | null
          id: string
          is_active: boolean | null
          presenter_id: string | null
        }
        Insert: {
          code: string
          created_at?: string
          current_slide?: string | null
          id?: string
          is_active?: boolean | null
          presenter_id?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          current_slide?: string | null
          id?: string
          is_active?: boolean | null
          presenter_id?: string | null
        }
        Relationships: []
      }
      story_game_state: {
        Row: {
          created_at: string
          current_writer_position: number | null
          id: string
          max_volunteers: number | null
          session_id: string
          stage: string
          topic: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_writer_position?: number | null
          id?: string
          max_volunteers?: number | null
          session_id: string
          stage?: string
          topic?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_writer_position?: number | null
          id?: string
          max_volunteers?: number | null
          session_id?: string
          stage?: string
          topic?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_game_state_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: true
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      story_topic_votes: {
        Row: {
          created_at: string
          id: string
          participant_id: string
          topic_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          participant_id: string
          topic_id: string
        }
        Update: {
          created_at?: string
          id?: string
          participant_id?: string
          topic_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_topic_votes_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "story_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      story_topics: {
        Row: {
          created_at: string
          id: string
          is_winner: boolean | null
          session_id: string
          submitted_by: string
          text: string
          vote_count: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_winner?: boolean | null
          session_id: string
          submitted_by: string
          text: string
          vote_count?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          is_winner?: boolean | null
          session_id?: string
          submitted_by?: string
          text?: string
          vote_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "story_topics_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      story_volunteers: {
        Row: {
          created_at: string
          id: string
          participant_id: string
          participant_name: string
          position: number
          session_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          participant_id: string
          participant_name?: string
          position: number
          session_id: string
        }
        Update: {
          created_at?: string
          id?: string
          participant_id?: string
          participant_name?: string
          position?: number
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_volunteers_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      story_words: {
        Row: {
          added_by: string
          created_at: string
          id: string
          position: number
          session_id: string
          word: string
        }
        Insert: {
          added_by: string
          created_at?: string
          id?: string
          position: number
          session_id: string
          word: string
        }
        Update: {
          added_by?: string
          created_at?: string
          id?: string
          position?: number
          session_id?: string
          word?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_words_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      is_session_presenter: { Args: { _session_id: string }; Returns: boolean }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
    }
    Enums: {
      poll_type: "multiple_choice" | "slider" | "text"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      poll_type: ["multiple_choice", "slider", "text"],
    },
  },
} as const
