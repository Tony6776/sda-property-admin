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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      admin_2fa_settings: {
        Row: {
          admin_identifier: string
          backup_codes: string[] | null
          backup_codes_encrypted: string | null
          created_at: string
          id: string
          is_2fa_enabled: boolean
          last_backup_code_used: string | null
          recovery_email: string | null
          totp_secret: string | null
          totp_secret_encrypted: string | null
          updated_at: string
        }
        Insert: {
          admin_identifier?: string
          backup_codes?: string[] | null
          backup_codes_encrypted?: string | null
          created_at?: string
          id?: string
          is_2fa_enabled?: boolean
          last_backup_code_used?: string | null
          recovery_email?: string | null
          totp_secret?: string | null
          totp_secret_encrypted?: string | null
          updated_at?: string
        }
        Update: {
          admin_identifier?: string
          backup_codes?: string[] | null
          backup_codes_encrypted?: string | null
          created_at?: string
          id?: string
          is_2fa_enabled?: boolean
          last_backup_code_used?: string | null
          recovery_email?: string | null
          totp_secret?: string | null
          totp_secret_encrypted?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      admin_session_security: {
        Row: {
          blocked_until: string | null
          created_at: string | null
          device_fingerprint: string | null
          id: string
          ip_address: string | null
          is_suspicious: boolean | null
          last_activity: string | null
          login_attempts: number | null
          session_token: string
          user_agent: string | null
        }
        Insert: {
          blocked_until?: string | null
          created_at?: string | null
          device_fingerprint?: string | null
          id?: string
          ip_address?: string | null
          is_suspicious?: boolean | null
          last_activity?: string | null
          login_attempts?: number | null
          session_token: string
          user_agent?: string | null
        }
        Update: {
          blocked_until?: string | null
          created_at?: string | null
          device_fingerprint?: string | null
          id?: string
          ip_address?: string | null
          is_suspicious?: boolean | null
          last_activity?: string | null
          login_attempts?: number | null
          session_token?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      admin_session_tokens: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          is_active: boolean | null
          last_rotation: string | null
          parent_token: string | null
          rotation_count: number | null
          session_token: string
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          is_active?: boolean | null
          last_rotation?: string | null
          parent_token?: string | null
          rotation_count?: number | null
          session_token: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          is_active?: boolean | null
          last_rotation?: string | null
          parent_token?: string | null
          rotation_count?: number | null
          session_token?: string
        }
        Relationships: []
      }
      admin_sessions: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          ip_address: string | null
          is_active: boolean | null
          session_token: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          ip_address?: string | null
          is_active?: boolean | null
          session_token: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          ip_address?: string | null
          is_active?: boolean | null
          session_token?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      ai_conversations: {
        Row: {
          created_at: string
          id: string
          message: string | null
          metadata: Json
          response: string | null
          role: string | null
          session_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string | null
          metadata?: Json
          response?: string | null
          role?: string | null
          session_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string | null
          metadata?: Json
          response?: string | null
          role?: string | null
          session_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      auth_monitoring: {
        Row: {
          created_at: string
          email: string | null
          event_type: string
          id: string
          ip_address: string | null
          metadata: Json | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          event_type: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
        }
        Update: {
          created_at?: string
          email?: string | null
          event_type?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
        }
        Relationships: []
      }
      auth_rate_limits: {
        Row: {
          attempt_type: string
          attempts: number
          blocked_until: string | null
          created_at: string
          id: string
          identifier: string
          updated_at: string
        }
        Insert: {
          attempt_type: string
          attempts?: number
          blocked_until?: string | null
          created_at?: string
          id?: string
          identifier: string
          updated_at?: string
        }
        Update: {
          attempt_type?: string
          attempts?: number
          blocked_until?: string | null
          created_at?: string
          id?: string
          identifier?: string
          updated_at?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string | null
          executed_at: string | null
          execution_status: string | null
          id: string
          metadata: Json | null
          role: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          executed_at?: string | null
          execution_status?: string | null
          id?: string
          metadata?: Json | null
          role: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          executed_at?: string | null
          execution_status?: string | null
          id?: string
          metadata?: Json | null
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      chat_sessions: {
        Row: {
          ai_response: string | null
          created_at: string
          id: string
          session_id: string
          updated_at: string
          user_id: string | null
          user_query: string
        }
        Insert: {
          ai_response?: string | null
          created_at?: string
          id?: string
          session_id: string
          updated_at?: string
          user_id?: string | null
          user_query: string
        }
        Update: {
          ai_response?: string | null
          created_at?: string
          id?: string
          session_id?: string
          updated_at?: string
          user_id?: string | null
          user_query?: string
        }
        Relationships: []
      }
      compliance_frameworks: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          last_assessment: string | null
          max_score: number | null
          name: string
          next_assessment: string | null
          score: number | null
          status: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          last_assessment?: string | null
          max_score?: number | null
          name: string
          next_assessment?: string | null
          score?: number | null
          status?: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          last_assessment?: string | null
          max_score?: number | null
          name?: string
          next_assessment?: string | null
          score?: number | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      compliance_requirements: {
        Row: {
          created_at: string
          description: string | null
          due_date: string | null
          evidence: string | null
          framework_id: string
          id: string
          requirement_code: string
          responsible_party: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          evidence?: string | null
          framework_id: string
          id?: string
          requirement_code: string
          responsible_party?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          evidence?: string | null
          framework_id?: string
          id?: string
          requirement_code?: string
          responsible_party?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_compliance_requirements_framework"
            columns: ["framework_id"]
            isOneToOne: false
            referencedRelation: "compliance_frameworks"
            referencedColumns: ["id"]
          },
        ]
      }
      device_security_logs: {
        Row: {
          access_count: number | null
          browser_info: Json | null
          created_at: string
          device_fingerprint: string
          device_name: string | null
          first_seen: string
          id: string
          is_trusted_device: boolean | null
          language: string | null
          last_seen: string
          screen_resolution: string | null
          session_token: string
          suspicious_flags: string[] | null
          timezone_offset: number | null
        }
        Insert: {
          access_count?: number | null
          browser_info?: Json | null
          created_at?: string
          device_fingerprint: string
          device_name?: string | null
          first_seen?: string
          id?: string
          is_trusted_device?: boolean | null
          language?: string | null
          last_seen?: string
          screen_resolution?: string | null
          session_token: string
          suspicious_flags?: string[] | null
          timezone_offset?: number | null
        }
        Update: {
          access_count?: number | null
          browser_info?: Json | null
          created_at?: string
          device_fingerprint?: string
          device_name?: string | null
          first_seen?: string
          id?: string
          is_trusted_device?: boolean | null
          language?: string | null
          last_seen?: string
          screen_resolution?: string | null
          session_token?: string
          suspicious_flags?: string[] | null
          timezone_offset?: number | null
        }
        Relationships: []
      }
      ip_geolocation_logs: {
        Row: {
          city: string | null
          country: string | null
          created_at: string
          event_type: string
          id: string
          ip_address: string
          is_proxy: boolean | null
          is_vpn: boolean | null
          isp: string | null
          latitude: number | null
          longitude: number | null
          region: string | null
          risk_score: number | null
          session_token: string | null
          timezone: string | null
          user_agent: string | null
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string
          event_type: string
          id?: string
          ip_address: string
          is_proxy?: boolean | null
          is_vpn?: boolean | null
          isp?: string | null
          latitude?: number | null
          longitude?: number | null
          region?: string | null
          risk_score?: number | null
          session_token?: string | null
          timezone?: string | null
          user_agent?: string | null
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string
          event_type?: string
          id?: string
          ip_address?: string
          is_proxy?: boolean | null
          is_vpn?: boolean | null
          isp?: string | null
          latitude?: number | null
          longitude?: number | null
          region?: string | null
          risk_score?: number | null
          session_token?: string | null
          timezone?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          dashboard_permissions: Json | null
          email: string
          full_name: string | null
          id: string
          is_active: boolean | null
          role: string
          security_clearance: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dashboard_permissions?: Json | null
          email: string
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          role?: string
          security_clearance?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          dashboard_permissions?: Json | null
          email?: string
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          role?: string
          security_clearance?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          accessibility: Json | null
          address: string
          bathrooms: number | null
          bedrooms: number | null
          created_at: string
          features: string[] | null
          id: string
          last_inspection: string | null
          matches: Json | null
          matching_status: string | null
          max_occupancy: number | null
          name: string
          next_inspection: string | null
          occupancy: number | null
          parking: number | null
          price: number | null
          property_manager: string | null
          property_type: string
          rating: number | null
          sda_category: string | null
          status: string
          updated_at: string
          weekly_rent: number | null
        }
        Insert: {
          accessibility?: Json | null
          address: string
          bathrooms?: number | null
          bedrooms?: number | null
          created_at?: string
          features?: string[] | null
          id?: string
          last_inspection?: string | null
          matches?: Json | null
          matching_status?: string | null
          max_occupancy?: number | null
          name: string
          next_inspection?: string | null
          occupancy?: number | null
          parking?: number | null
          price?: number | null
          property_manager?: string | null
          property_type: string
          rating?: number | null
          sda_category?: string | null
          status?: string
          updated_at?: string
          weekly_rent?: number | null
        }
        Update: {
          accessibility?: Json | null
          address?: string
          bathrooms?: number | null
          bedrooms?: number | null
          created_at?: string
          features?: string[] | null
          id?: string
          last_inspection?: string | null
          matches?: Json | null
          matching_status?: string | null
          max_occupancy?: number | null
          name?: string
          next_inspection?: string | null
          occupancy?: number | null
          parking?: number | null
          price?: number | null
          property_manager?: string | null
          property_type?: string
          rating?: number | null
          sda_category?: string | null
          status?: string
          updated_at?: string
          weekly_rent?: number | null
        }
        Relationships: []
      }
      property_access_logs: {
        Row: {
          access_duration: number | null
          access_type: string
          created_at: string
          device_fingerprint: string | null
          id: string
          ip_address: string | null
          property_id: string | null
          session_id: string | null
          suspicious_flags: string[] | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          access_duration?: number | null
          access_type: string
          created_at?: string
          device_fingerprint?: string | null
          id?: string
          ip_address?: string | null
          property_id?: string | null
          session_id?: string | null
          suspicious_flags?: string[] | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          access_duration?: number | null
          access_type?: string
          created_at?: string
          device_fingerprint?: string | null
          id?: string
          ip_address?: string | null
          property_id?: string | null
          session_id?: string | null
          suspicious_flags?: string[] | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_access_logs_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_access_logs_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties_public"
            referencedColumns: ["id"]
          },
        ]
      }
      property_rate_limits: {
        Row: {
          created_at: string
          id: string
          ip_address: string
          request_count: number
          window_start: string
        }
        Insert: {
          created_at?: string
          id?: string
          ip_address: string
          request_count?: number
          window_start?: string
        }
        Update: {
          created_at?: string
          id?: string
          ip_address?: string
          request_count?: number
          window_start?: string
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          action: string
          created_at: string
          id: string
          identifier: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          identifier: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          identifier?: string
        }
        Relationships: []
      }
      security_audit_logs: {
        Row: {
          created_at: string
          details: Json | null
          event_type: string
          id: string
          ip_address: string | null
          severity: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          details?: Json | null
          event_type: string
          id?: string
          ip_address?: string | null
          severity?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          details?: Json | null
          event_type?: string
          id?: string
          ip_address?: string | null
          severity?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      security_events: {
        Row: {
          created_at: string
          details: Json | null
          event_type: string
          id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          details?: Json | null
          event_type: string
          id?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          details?: Json | null
          event_type?: string
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      security_events_enhanced: {
        Row: {
          created_at: string | null
          details: Json | null
          event_type: string
          id: string
          ip_address: string | null
          resolved: boolean | null
          session_id: string | null
          severity: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          event_type: string
          id?: string
          ip_address?: string | null
          resolved?: boolean | null
          session_id?: string | null
          severity?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          event_type?: string
          id?: string
          ip_address?: string | null
          resolved?: boolean | null
          session_id?: string | null
          severity?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      susie_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          request: Json | null
          response: Json | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          request?: Json | null
          response?: Json | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          request?: Json | null
          response?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      system_health: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          response_time: number | null
          service_name: string
          status: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          response_time?: number | null
          service_name: string
          status: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          response_time?: number | null
          service_name?: string
          status?: string
        }
        Relationships: []
      }
      system_metrics: {
        Row: {
          created_at: string
          created_by: string | null
          details: Json | null
          environment: string
          id: string
          key: string
          labels: Json
          value: number | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          details?: Json | null
          environment?: string
          id?: string
          key: string
          labels?: Json
          value?: number | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          details?: Json | null
          environment?: string
          id?: string
          key?: string
          labels?: Json
          value?: number | null
        }
        Relationships: []
      }
      task_executions: {
        Row: {
          chat_message_id: string | null
          created_at: string | null
          id: string
          result: Json | null
          status: string | null
          task_type: string | null
        }
        Insert: {
          chat_message_id?: string | null
          created_at?: string | null
          id?: string
          result?: Json | null
          status?: string | null
          task_type?: string | null
        }
        Update: {
          chat_message_id?: string | null
          created_at?: string | null
          id?: string
          result?: Json | null
          status?: string | null
          task_type?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      properties_public: {
        Row: {
          accessibility: Json | null
          address: string | null
          bathrooms: number | null
          bedrooms: number | null
          created_at: string | null
          features: string[] | null
          id: string | null
          name: string | null
          property_type: string | null
          status: string | null
          weekly_rent: number | null
        }
        Insert: {
          accessibility?: Json | null
          address?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          created_at?: string | null
          features?: string[] | null
          id?: string | null
          name?: string | null
          property_type?: string | null
          status?: string | null
          weekly_rent?: number | null
        }
        Update: {
          accessibility?: Json | null
          address?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          created_at?: string | null
          features?: string[] | null
          id?: string | null
          name?: string | null
          property_type?: string | null
          status?: string | null
          weekly_rent?: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_property_access_rate_limit: {
        Args: { client_ip: string }
        Returns: boolean
      }
      cleanup_all_security_data: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_expired_admin_sessions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_expired_sessions_secure: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_rate_limits: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_security_audit_logs: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      decrypt_sensitive_data: {
        Args: { encrypted_data: string; key_text?: string }
        Returns: string
      }
      encrypt_sensitive_data: {
        Args: { data_text: string; key_text?: string }
        Returns: string
      }
      generate_secure_backup_codes: {
        Args: { p_admin_identifier?: string; p_count?: number }
        Returns: string[]
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_property_details_secure: {
        Args: { property_id: string }
        Returns: {
          accessibility: Json
          address: string
          bathrooms: number
          bedrooms: number
          features: string[]
          id: string
          name: string
          property_manager: string
          property_type: string
          status: string
          weekly_rent: number
        }[]
      }
      get_public_properties: {
        Args: Record<PropertyKey, never>
        Returns: {
          accessibility: Json
          address: string
          bathrooms: number
          bedrooms: number
          created_at: string
          features: string[]
          id: string
          name: string
          property_type: string
          status: string
          weekly_rent: number
        }[]
      }
      invalidate_suspicious_admin_sessions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      log_property_access_secure: {
        Args: {
          p_access_type: string
          p_device_fingerprint?: string
          p_property_id: string
          p_session_id?: string
        }
        Returns: undefined
      }
      search_properties_secure: {
        Args: {
          max_weekly_rent?: number
          min_bedrooms?: number
          property_type_filter?: string
          search_term?: string
        }
        Returns: {
          accessibility: Json
          address: string
          bathrooms: number
          bedrooms: number
          features: string[]
          id: string
          name: string
          property_manager: string
          property_type: string
          weekly_rent: number
        }[]
      }
      validate_admin_session_enhanced: {
        Args: {
          p_device_fingerprint?: string
          p_rotate_token?: boolean
          p_session_token: string
        }
        Returns: Json
      }
      validate_public_properties_access: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
