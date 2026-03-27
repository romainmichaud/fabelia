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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      admin_logs: {
        Row: {
          action: string
          admin_id: string
          after_state: Json | null
          before_state: Json | null
          created_at: string
          id: string
          ip_address: string | null
          resource: string
          resource_id: string | null
        }
        Insert: {
          action: string
          admin_id: string
          after_state?: Json | null
          before_state?: Json | null
          created_at?: string
          id?: string
          ip_address?: string | null
          resource: string
          resource_id?: string | null
        }
        Update: {
          action?: string
          admin_id?: string
          after_state?: Json | null
          before_state?: Json | null
          created_at?: string
          id?: string
          ip_address?: string | null
          resource?: string
          resource_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_logs_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      book_exports: {
        Row: {
          download_count: number
          file_size: number | null
          filename: string
          generated_at: string
          id: string
          last_downloaded_at: string | null
          order_id: string | null
          project_id: string
          storage_path: string
          type: string
        }
        Insert: {
          download_count?: number
          file_size?: number | null
          filename: string
          generated_at?: string
          id?: string
          last_downloaded_at?: string | null
          order_id?: string | null
          project_id: string
          storage_path: string
          type?: string
        }
        Update: {
          download_count?: number
          file_size?: number | null
          filename?: string
          generated_at?: string
          id?: string
          last_downloaded_at?: string | null
          order_id?: string | null
          project_id?: string
          storage_path?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "book_exports_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "book_exports_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "book_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      book_images: {
        Row: {
          created_at: string
          id: string
          is_cover: boolean
          is_selected: boolean
          page_id: string | null
          project_id: string
          prompt_used: string | null
          storage_path: string | null
          style: string | null
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_cover?: boolean
          is_selected?: boolean
          page_id?: string | null
          project_id: string
          prompt_used?: string | null
          storage_path?: string | null
          style?: string | null
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          is_cover?: boolean
          is_selected?: boolean
          page_id?: string | null
          project_id?: string
          prompt_used?: string | null
          storage_path?: string | null
          style?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "book_images_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "book_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      book_pages: {
        Row: {
          chapter_title: string | null
          content_text: string | null
          created_at: string
          id: string
          illustration_url: string | null
          image_style: string | null
          layout: string | null
          metadata: Json | null
          page_number: number
          page_type: Database["public"]["Enums"]["page_type"]
          project_id: string
        }
        Insert: {
          chapter_title?: string | null
          content_text?: string | null
          created_at?: string
          id?: string
          illustration_url?: string | null
          image_style?: string | null
          layout?: string | null
          metadata?: Json | null
          page_number: number
          page_type: Database["public"]["Enums"]["page_type"]
          project_id: string
        }
        Update: {
          chapter_title?: string | null
          content_text?: string | null
          created_at?: string
          id?: string
          illustration_url?: string | null
          image_style?: string | null
          layout?: string | null
          metadata?: Json | null
          page_number?: number
          page_type?: Database["public"]["Enums"]["page_type"]
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "book_pages_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "book_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      book_previews: {
        Row: {
          chapter_excerpt: string | null
          chapter_title: string | null
          created_at: string
          expires_at: string
          id: string
          illustration_url: string | null
          is_active: boolean
          passed: boolean
          project_id: string
          score: number | null
        }
        Insert: {
          chapter_excerpt?: string | null
          chapter_title?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          illustration_url?: string | null
          is_active?: boolean
          passed?: boolean
          project_id: string
          score?: number | null
        }
        Update: {
          chapter_excerpt?: string | null
          chapter_title?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          illustration_url?: string | null
          is_active?: boolean
          passed?: boolean
          project_id?: string
          score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "book_previews_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "book_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      book_projects: {
        Row: {
          book_format: Database["public"]["Enums"]["book_format"] | null
          created_at: string
          error_message: string | null
          generation_status: Database["public"]["Enums"]["generation_status"]
          id: string
          is_book_ready: boolean
          is_preview_ready: boolean
          language: string
          paid_at: string | null
          product_type: Database["public"]["Enums"]["product_type"] | null
          theme: Database["public"]["Enums"]["book_theme"] | null
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          book_format?: Database["public"]["Enums"]["book_format"] | null
          created_at?: string
          error_message?: string | null
          generation_status?: Database["public"]["Enums"]["generation_status"]
          id?: string
          is_book_ready?: boolean
          is_preview_ready?: boolean
          language?: string
          paid_at?: string | null
          product_type?: Database["public"]["Enums"]["product_type"] | null
          theme?: Database["public"]["Enums"]["book_theme"] | null
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          book_format?: Database["public"]["Enums"]["book_format"] | null
          created_at?: string
          error_message?: string | null
          generation_status?: Database["public"]["Enums"]["generation_status"]
          id?: string
          is_book_ready?: boolean
          is_preview_ready?: boolean
          language?: string
          paid_at?: string | null
          product_type?: Database["public"]["Enums"]["product_type"] | null
          theme?: Database["public"]["Enums"]["book_theme"] | null
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "book_projects_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          code: string
          created_at: string
          discount_type: string
          discount_value: number
          id: string
          is_active: boolean
          max_uses: number | null
          min_amount: number | null
          uses_count: number
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          code: string
          created_at?: string
          discount_type?: string
          discount_value: number
          id?: string
          is_active?: boolean
          max_uses?: number | null
          min_amount?: number | null
          uses_count?: number
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          discount_type?: string
          discount_value?: number
          id?: string
          is_active?: boolean
          max_uses?: number | null
          min_amount?: number | null
          uses_count?: number
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      dynamic_answers: {
        Row: {
          answer_value: string | null
          id: string
          project_id: string
          question_key: string
          updated_at: string
        }
        Insert: {
          answer_value?: string | null
          id?: string
          project_id: string
          question_key: string
          updated_at?: string
        }
        Update: {
          answer_value?: string | null
          id?: string
          project_id?: string
          question_key?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dynamic_answers_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "book_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          book_format: Database["public"]["Enums"]["book_format"] | null
          book_project_id: string | null
          coupon_code: string | null
          created_at: string
          currency: string
          discount_amount: number
          id: string
          order_number: string
          paid_at: string | null
          paypal_order_id: string | null
          product_type: Database["public"]["Enums"]["product_type"]
          quantity: number
          shipping_address: Json | null
          status: Database["public"]["Enums"]["order_status"]
          stripe_payment_intent_id: string | null
          tax_amount: number
          total_amount: number
          unit_price: number
          updated_at: string
          user_id: string
        }
        Insert: {
          book_format?: Database["public"]["Enums"]["book_format"] | null
          book_project_id?: string | null
          coupon_code?: string | null
          created_at?: string
          currency?: string
          discount_amount?: number
          id?: string
          order_number?: string
          paid_at?: string | null
          paypal_order_id?: string | null
          product_type: Database["public"]["Enums"]["product_type"]
          quantity?: number
          shipping_address?: Json | null
          status?: Database["public"]["Enums"]["order_status"]
          stripe_payment_intent_id?: string | null
          tax_amount?: number
          total_amount: number
          unit_price: number
          updated_at?: string
          user_id: string
        }
        Update: {
          book_format?: Database["public"]["Enums"]["book_format"] | null
          book_project_id?: string | null
          coupon_code?: string | null
          created_at?: string
          currency?: string
          discount_amount?: number
          id?: string
          order_number?: string
          paid_at?: string | null
          paypal_order_id?: string | null
          product_type?: Database["public"]["Enums"]["product_type"]
          quantity?: number
          shipping_address?: Json | null
          status?: Database["public"]["Enums"]["order_status"]
          stripe_payment_intent_id?: string | null
          tax_amount?: number
          total_amount?: number
          unit_price?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_book_project_id_fkey"
            columns: ["book_project_id"]
            isOneToOne: false
            referencedRelation: "book_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          metadata: Json | null
          order_id: string
          provider: string
          provider_id: string | null
          status: Database["public"]["Enums"]["payment_status"]
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          metadata?: Json | null
          order_id: string
          provider: string
          provider_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          metadata?: Json | null
          order_id?: string
          provider?: string
          provider_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      print_jobs: {
        Row: {
          created_at: string
          delivered_at: string | null
          estimated_delivery: string | null
          id: string
          order_id: string
          project_id: string
          provider: string
          provider_job_id: string | null
          shipped_at: string | null
          shipping_address: Json
          status: string
          submitted_at: string | null
          tracking_number: string | null
          tracking_url: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          delivered_at?: string | null
          estimated_delivery?: string | null
          id?: string
          order_id: string
          project_id: string
          provider?: string
          provider_job_id?: string | null
          shipped_at?: string | null
          shipping_address: Json
          status?: string
          submitted_at?: string | null
          tracking_number?: string | null
          tracking_url?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          delivered_at?: string | null
          estimated_delivery?: string | null
          id?: string
          order_id?: string
          project_id?: string
          provider?: string
          provider_job_id?: string | null
          shipped_at?: string | null
          shipping_address?: Json
          status?: string
          submitted_at?: string | null
          tracking_number?: string | null
          tracking_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "print_jobs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "print_jobs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "book_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          locale: string
          marketing_opt: boolean
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          locale?: string
          marketing_opt?: boolean
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          locale?: string
          marketing_opt?: boolean
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      prompt_scores: {
        Row: {
          created_at: string
          dimensions: Json
          flagged_reason: string | null
          id: string
          passed: boolean
          project_id: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          score: number
          session_id: string | null
          status: Database["public"]["Enums"]["score_status"]
        }
        Insert: {
          created_at?: string
          dimensions?: Json
          flagged_reason?: string | null
          id?: string
          passed?: boolean
          project_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          score: number
          session_id?: string | null
          status?: Database["public"]["Enums"]["score_status"]
        }
        Update: {
          created_at?: string
          dimensions?: Json
          flagged_reason?: string | null
          id?: string
          passed?: boolean
          project_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          score?: number
          session_id?: string | null
          status?: Database["public"]["Enums"]["score_status"]
        }
        Relationships: [
          {
            foreignKeyName: "prompt_scores_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "book_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prompt_scores_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prompt_scores_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "prompt_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      prompt_sessions: {
        Row: {
          created_at: string
          error: string | null
          id: string
          latency_ms: number | null
          model: string | null
          project_id: string | null
          resolved_prompt: string
          response: string | null
          tokens_used: number | null
          use_case: string
          version_id: string | null
        }
        Insert: {
          created_at?: string
          error?: string | null
          id?: string
          latency_ms?: number | null
          model?: string | null
          project_id?: string | null
          resolved_prompt: string
          response?: string | null
          tokens_used?: number | null
          use_case: string
          version_id?: string | null
        }
        Update: {
          created_at?: string
          error?: string | null
          id?: string
          latency_ms?: number | null
          model?: string | null
          project_id?: string | null
          resolved_prompt?: string
          response?: string | null
          tokens_used?: number | null
          use_case?: string
          version_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prompt_sessions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "book_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prompt_sessions_version_id_fkey"
            columns: ["version_id"]
            isOneToOne: false
            referencedRelation: "prompt_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      prompt_versions: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          max_tokens: number
          model: string
          name: string
          temperature: number
          template: string
          use_case: string
          variables: string[]
          version: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          max_tokens?: number
          model?: string
          name: string
          temperature?: number
          template: string
          use_case: string
          variables?: string[]
          version?: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          max_tokens?: number
          model?: string
          name?: string
          temperature?: number
          template?: string
          use_case?: string
          variables?: string[]
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "prompt_versions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          created_at: string
          field_type: string
          id: string
          is_active: boolean
          is_required: boolean
          key: string
          label: string
          options: Json | null
          placeholder: string | null
          sort_order: number
        }
        Insert: {
          created_at?: string
          field_type?: string
          id?: string
          is_active?: boolean
          is_required?: boolean
          key: string
          label: string
          options?: Json | null
          placeholder?: string | null
          sort_order?: number
        }
        Update: {
          created_at?: string
          field_type?: string
          id?: string
          is_active?: boolean
          is_required?: boolean
          key?: string
          label?: string
          options?: Json | null
          placeholder?: string | null
          sort_order?: number
        }
        Relationships: []
      }
      support_messages: {
        Row: {
          author_id: string | null
          body: string
          created_at: string
          id: string
          is_internal: boolean
          ticket_id: string
        }
        Insert: {
          author_id?: string | null
          body: string
          created_at?: string
          id?: string
          is_internal?: boolean
          ticket_id: string
        }
        Update: {
          author_id?: string | null
          body?: string
          created_at?: string
          id?: string
          is_internal?: boolean
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_messages_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          created_at: string
          id: string
          order_id: string | null
          priority: Database["public"]["Enums"]["ticket_priority"]
          project_id: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: Database["public"]["Enums"]["ticket_status"]
          subject: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          order_id?: string | null
          priority?: Database["public"]["Enums"]["ticket_priority"]
          project_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          subject: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string | null
          priority?: Database["public"]["Enums"]["ticket_priority"]
          project_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          subject?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "book_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_order_number: { Args: never; Returns: string }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      book_format: "softcover" | "hardcover"
      book_theme: "space" | "ocean" | "forest" | "castle" | "jungle" | "desert"
      generation_status:
        | "idle"
        | "queued"
        | "generating_text"
        | "generating_images"
        | "assembling"
        | "completed"
        | "failed"
      order_status:
        | "draft"
        | "pending_payment"
        | "paid"
        | "processing"
        | "completed"
        | "cancelled"
        | "refunded"
      page_type:
        | "cover"
        | "dedication"
        | "chapter"
        | "illustration"
        | "back_cover"
      payment_status:
        | "pending"
        | "authorized"
        | "captured"
        | "failed"
        | "refunded"
      product_type: "digital" | "print" | "bundle"
      score_status: "pending" | "scored" | "flagged" | "archived"
      ticket_priority: "low" | "normal" | "high" | "urgent"
      ticket_status: "open" | "in_progress" | "resolved" | "closed"
      user_role: "user" | "admin"
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
      book_format: ["softcover", "hardcover"],
      book_theme: ["space", "ocean", "forest", "castle", "jungle", "desert"],
      generation_status: [
        "idle",
        "queued",
        "generating_text",
        "generating_images",
        "assembling",
        "completed",
        "failed",
      ],
      order_status: [
        "draft",
        "pending_payment",
        "paid",
        "processing",
        "completed",
        "cancelled",
        "refunded",
      ],
      page_type: [
        "cover",
        "dedication",
        "chapter",
        "illustration",
        "back_cover",
      ],
      payment_status: [
        "pending",
        "authorized",
        "captured",
        "failed",
        "refunded",
      ],
      product_type: ["digital", "print", "bundle"],
      score_status: ["pending", "scored", "flagged", "archived"],
      ticket_priority: ["low", "normal", "high", "urgent"],
      ticket_status: ["open", "in_progress", "resolved", "closed"],
      user_role: ["user", "admin"],
    },
  },
} as const
