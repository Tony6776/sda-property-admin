Initialising login role...
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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
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
          device_fingerprint_encrypted: string | null
          id: string
          ip_address: string | null
          is_suspicious: boolean | null
          last_activity: string | null
          login_attempts: number | null
          security_metadata_encrypted: Json | null
          session_token: string
          session_token_hash: string | null
          user_agent: string | null
        }
        Insert: {
          blocked_until?: string | null
          created_at?: string | null
          device_fingerprint?: string | null
          device_fingerprint_encrypted?: string | null
          id?: string
          ip_address?: string | null
          is_suspicious?: boolean | null
          last_activity?: string | null
          login_attempts?: number | null
          security_metadata_encrypted?: Json | null
          session_token: string
          session_token_hash?: string | null
          user_agent?: string | null
        }
        Update: {
          blocked_until?: string | null
          created_at?: string | null
          device_fingerprint?: string | null
          device_fingerprint_encrypted?: string | null
          id?: string
          ip_address?: string | null
          is_suspicious?: boolean | null
          last_activity?: string | null
          login_attempts?: number | null
          security_metadata_encrypted?: Json | null
          session_token?: string
          session_token_hash?: string | null
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
          parent_token_hash: string | null
          rotation_count: number | null
          session_token: string
          session_token_hash: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          is_active?: boolean | null
          last_rotation?: string | null
          parent_token?: string | null
          parent_token_hash?: string | null
          rotation_count?: number | null
          session_token: string
          session_token_hash?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          is_active?: boolean | null
          last_rotation?: string | null
          parent_token?: string | null
          parent_token_hash?: string | null
          rotation_count?: number | null
          session_token?: string
          session_token_hash?: string | null
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
          session_token_hash: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          ip_address?: string | null
          is_active?: boolean | null
          session_token: string
          session_token_hash?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          ip_address?: string | null
          is_active?: boolean | null
          session_token?: string
          session_token_hash?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          created_at: string | null
          full_name: string | null
          id: string
          organization_id: string
          permissions: Json | null
          role: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          full_name?: string | null
          id?: string
          organization_id: string
          permissions?: Json | null
          role?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          full_name?: string | null
          id?: string
          organization_id?: string
          permissions?: Json | null
          role?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_users_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_logs: {
        Row: {
          agent_name: string
          agent_type: string
          created_at: string | null
          id: string
          query: string
          response: string | null
          timestamp: string | null
        }
        Insert: {
          agent_name: string
          agent_type: string
          created_at?: string | null
          id?: string
          query: string
          response?: string | null
          timestamp?: string | null
        }
        Update: {
          agent_name?: string
          agent_type?: string
          created_at?: string | null
          id?: string
          query?: string
          response?: string | null
          timestamp?: string | null
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
      analytics_cache: {
        Row: {
          cache_key: string
          cache_value: Json
          created_at: string | null
          expires_at: string | null
          id: number
        }
        Insert: {
          cache_key: string
          cache_value: Json
          created_at?: string | null
          expires_at?: string | null
          id?: number
        }
        Update: {
          cache_key?: string
          cache_value?: Json
          created_at?: string | null
          expires_at?: string | null
          id?: number
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          action: string
          changes: Json | null
          created_at: string | null
          entity_id: string
          entity_type: string
          id: string
          metadata: Json | null
          organization_id: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          changes?: Json | null
          created_at?: string | null
          entity_id: string
          entity_type: string
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          changes?: Json | null
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
      claude_relay: {
        Row: {
          completed_at: string | null
          created_at: string | null
          error_message: string | null
          id: string
          processed_at: string | null
          processed_by: string | null
          request_data: Json
          request_type: string
          requested_by: string | null
          response_data: Json | null
          status: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          processed_at?: string | null
          processed_by?: string | null
          request_data: Json
          request_type: string
          requested_by?: string | null
          response_data?: Json | null
          status?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          processed_at?: string | null
          processed_by?: string | null
          request_data?: Json
          request_type?: string
          requested_by?: string | null
          response_data?: Json | null
          status?: string | null
        }
        Relationships: []
      }
      clients: {
        Row: {
          age: number | null
          assigned_agent_id: string | null
          client_status: string | null
          created_at: string | null
          date_of_birth: string | null
          disability_type: string | null
          email: string | null
          id: string
          max_distance_km: number | null
          name: string
          ndis_number: string | null
          notes: string | null
          phone: string | null
          preferred_state: string | null
          preferred_suburbs: string[] | null
          priority_level: string | null
          support_coordinator_email: string | null
          support_coordinator_name: string | null
          support_coordinator_phone: string | null
          support_requirements: string[] | null
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          age?: number | null
          assigned_agent_id?: string | null
          client_status?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          disability_type?: string | null
          email?: string | null
          id?: string
          max_distance_km?: number | null
          name: string
          ndis_number?: string | null
          notes?: string | null
          phone?: string | null
          preferred_state?: string | null
          preferred_suburbs?: string[] | null
          priority_level?: string | null
          support_coordinator_email?: string | null
          support_coordinator_name?: string | null
          support_coordinator_phone?: string | null
          support_requirements?: string[] | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          age?: number | null
          assigned_agent_id?: string | null
          client_status?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          disability_type?: string | null
          email?: string | null
          id?: string
          max_distance_km?: number | null
          name?: string
          ndis_number?: string | null
          notes?: string | null
          phone?: string | null
          preferred_state?: string | null
          preferred_suburbs?: string[] | null
          priority_level?: string | null
          support_coordinator_email?: string | null
          support_coordinator_name?: string | null
          support_coordinator_phone?: string | null
          support_requirements?: string[] | null
          tags?: string[] | null
          updated_at?: string | null
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
      historical_data: {
        Row: {
          created_at: string | null
          data_type: string
          id: number
          ingested_at: string | null
          payload: Json
          processed: boolean | null
          source: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          data_type: string
          id?: number
          ingested_at?: string | null
          payload: Json
          processed?: boolean | null
          source?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          data_type?: string
          id?: number
          ingested_at?: string | null
          payload?: Json
          processed?: boolean | null
          source?: string | null
          updated_at?: string | null
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
      leads: {
        Row: {
          assigned_to: string | null
          budget_range: string | null
          campaign: string | null
          created_at: string | null
          email: string | null
          id: string
          interest_level: string | null
          last_contact_date: string | null
          lead_type: string | null
          name: string
          next_follow_up: string | null
          notes: string | null
          phone: string | null
          preferred_location: string | null
          referrer: string | null
          source: string | null
          stage: string | null
          status: string | null
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          budget_range?: string | null
          campaign?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          interest_level?: string | null
          last_contact_date?: string | null
          lead_type?: string | null
          name: string
          next_follow_up?: string | null
          notes?: string | null
          phone?: string | null
          preferred_location?: string | null
          referrer?: string | null
          source?: string | null
          stage?: string | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          budget_range?: string | null
          campaign?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          interest_level?: string | null
          last_contact_date?: string | null
          lead_type?: string | null
          name?: string
          next_follow_up?: string | null
          notes?: string | null
          phone?: string | null
          preferred_location?: string | null
          referrer?: string | null
          source?: string | null
          stage?: string | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      living_well_properties: {
        Row: {
          accessible_bathroom: boolean | null
          accessible_kitchen: boolean | null
          address: string
          bathrooms: number | null
          bedrooms: number | null
          building_size: number | null
          ceiling_hoist: boolean | null
          created_at: string | null
          description: string | null
          elevator_access: boolean | null
          emergency_power: boolean | null
          estimated_rental_income: number | null
          features: string[] | null
          id: string
          image_urls: string[] | null
          investment_rating: string | null
          land_size: number | null
          listed_date: string | null
          listing_url: string | null
          maintenance_costs: number | null
          market_analysis: Json | null
          parking_spaces: number | null
          postcode: string | null
          price: number | null
          property_type: string | null
          rental_yield: number | null
          sda_building_type: string | null
          sda_category: string | null
          sda_compliant: boolean | null
          sda_design_category: string | null
          sda_enrollment_status: string | null
          sda_score: number | null
          sda_vacancy_status: string | null
          state: string | null
          suburb: string | null
          updated_at: string | null
          wheelchair_accessible: boolean | null
          wide_doorways: boolean | null
        }
        Insert: {
          accessible_bathroom?: boolean | null
          accessible_kitchen?: boolean | null
          address: string
          bathrooms?: number | null
          bedrooms?: number | null
          building_size?: number | null
          ceiling_hoist?: boolean | null
          created_at?: string | null
          description?: string | null
          elevator_access?: boolean | null
          emergency_power?: boolean | null
          estimated_rental_income?: number | null
          features?: string[] | null
          id?: string
          image_urls?: string[] | null
          investment_rating?: string | null
          land_size?: number | null
          listed_date?: string | null
          listing_url?: string | null
          maintenance_costs?: number | null
          market_analysis?: Json | null
          parking_spaces?: number | null
          postcode?: string | null
          price?: number | null
          property_type?: string | null
          rental_yield?: number | null
          sda_building_type?: string | null
          sda_category?: string | null
          sda_compliant?: boolean | null
          sda_design_category?: string | null
          sda_enrollment_status?: string | null
          sda_score?: number | null
          sda_vacancy_status?: string | null
          state?: string | null
          suburb?: string | null
          updated_at?: string | null
          wheelchair_accessible?: boolean | null
          wide_doorways?: boolean | null
        }
        Update: {
          accessible_bathroom?: boolean | null
          accessible_kitchen?: boolean | null
          address?: string
          bathrooms?: number | null
          bedrooms?: number | null
          building_size?: number | null
          ceiling_hoist?: boolean | null
          created_at?: string | null
          description?: string | null
          elevator_access?: boolean | null
          emergency_power?: boolean | null
          estimated_rental_income?: number | null
          features?: string[] | null
          id?: string
          image_urls?: string[] | null
          investment_rating?: string | null
          land_size?: number | null
          listed_date?: string | null
          listing_url?: string | null
          maintenance_costs?: number | null
          market_analysis?: Json | null
          parking_spaces?: number | null
          postcode?: string | null
          price?: number | null
          property_type?: string | null
          rental_yield?: number | null
          sda_building_type?: string | null
          sda_category?: string | null
          sda_compliant?: boolean | null
          sda_design_category?: string | null
          sda_enrollment_status?: string | null
          sda_score?: number | null
          sda_vacancy_status?: string | null
          state?: string | null
          suburb?: string | null
          updated_at?: string | null
          wheelchair_accessible?: boolean | null
          wide_doorways?: boolean | null
        }
        Relationships: []
      }
      organizations: {
        Row: {
          business_type: string
          created_at: string | null
          id: string
          name: string
          settings: Json | null
          updated_at: string | null
        }
        Insert: {
          business_type: string
          created_at?: string | null
          id: string
          name: string
          settings?: Json | null
          updated_at?: string | null
        }
        Update: {
          business_type?: string
          created_at?: string | null
          id?: string
          name?: string
          settings?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      participants: {
        Row: {
          age: number | null
          created_at: string | null
          current_housing_type: string | null
          date_of_birth: string | null
          disability_category: string | null
          funding_amount: number | null
          funding_utilization: number | null
          housing_preferences: Json | null
          housing_status: string | null
          id: string
          name: string
          ndis_number: string | null
          notes: string | null
          participant_status: string | null
          plan_end_date: string | null
          plan_review_date: string | null
          plan_start_date: string | null
          priority_level: string | null
          support_coordinator_email: string | null
          support_coordinator_name: string | null
          support_coordinator_org: string | null
          support_coordinator_phone: string | null
          support_level: string | null
          updated_at: string | null
        }
        Insert: {
          age?: number | null
          created_at?: string | null
          current_housing_type?: string | null
          date_of_birth?: string | null
          disability_category?: string | null
          funding_amount?: number | null
          funding_utilization?: number | null
          housing_preferences?: Json | null
          housing_status?: string | null
          id?: string
          name: string
          ndis_number?: string | null
          notes?: string | null
          participant_status?: string | null
          plan_end_date?: string | null
          plan_review_date?: string | null
          plan_start_date?: string | null
          priority_level?: string | null
          support_coordinator_email?: string | null
          support_coordinator_name?: string | null
          support_coordinator_org?: string | null
          support_coordinator_phone?: string | null
          support_level?: string | null
          updated_at?: string | null
        }
        Update: {
          age?: number | null
          created_at?: string | null
          current_housing_type?: string | null
          date_of_birth?: string | null
          disability_category?: string | null
          funding_amount?: number | null
          funding_utilization?: number | null
          housing_preferences?: Json | null
          housing_status?: string | null
          id?: string
          name?: string
          ndis_number?: string | null
          notes?: string | null
          participant_status?: string | null
          plan_end_date?: string | null
          plan_review_date?: string | null
          plan_start_date?: string | null
          priority_level?: string | null
          support_coordinator_email?: string | null
          support_coordinator_name?: string | null
          support_coordinator_org?: string | null
          support_coordinator_phone?: string | null
          support_level?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      portfolio_snapshots: {
        Row: {
          average_roi: number | null
          compliance_score: number | null
          created_at: string | null
          id: number
          monthly_revenue: number | null
          occupancy_rate: number | null
          property_count: number | null
          sda_compliant_count: number | null
          snapshot_date: string
          total_value: number | null
        }
        Insert: {
          average_roi?: number | null
          compliance_score?: number | null
          created_at?: string | null
          id?: number
          monthly_revenue?: number | null
          occupancy_rate?: number | null
          property_count?: number | null
          sda_compliant_count?: number | null
          snapshot_date: string
          total_value?: number | null
        }
        Update: {
          average_roi?: number | null
          compliance_score?: number | null
          created_at?: string | null
          id?: number
          monthly_revenue?: number | null
          occupancy_rate?: number | null
          property_count?: number | null
          sda_compliant_count?: number | null
          snapshot_date?: string
          total_value?: number | null
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
          audience: string | null
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
          organization_id: string | null
          parking: number | null
          price: number | null
          property_manager: string | null
          property_type: string
          rating: number | null
          sda_category: string | null
          status: string
          updated_at: string
          visible_on_investor_site: boolean | null
          visible_on_participant_site: boolean | null
          weekly_rent: number | null
        }
        Insert: {
          accessibility?: Json | null
          address: string
          audience?: string | null
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
          organization_id?: string | null
          parking?: number | null
          price?: number | null
          property_manager?: string | null
          property_type: string
          rating?: number | null
          sda_category?: string | null
          status?: string
          updated_at?: string
          visible_on_investor_site?: boolean | null
          visible_on_participant_site?: boolean | null
          weekly_rent?: number | null
        }
        Update: {
          accessibility?: Json | null
          address?: string
          audience?: string | null
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
          organization_id?: string | null
          parking?: number | null
          price?: number | null
          property_manager?: string | null
          property_type?: string
          rating?: number | null
          sda_category?: string | null
          status?: string
          updated_at?: string
          visible_on_investor_site?: boolean | null
          visible_on_participant_site?: boolean | null
          weekly_rent?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "properties_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
            referencedRelation: "investor_properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_access_logs_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "participant_properties"
            referencedColumns: ["id"]
          },
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
      property_matches: {
        Row: {
          client_id: string | null
          created_at: string | null
          id: string
          match_reasoning: string | null
          match_score: number | null
          match_status: string | null
          property_id: string | null
          updated_at: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          id?: string
          match_reasoning?: string | null
          match_score?: number | null
          match_status?: string | null
          property_id?: string | null
          updated_at?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          id?: string
          match_reasoning?: string | null
          match_score?: number | null
          match_status?: string | null
          property_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
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
      system_health_logs: {
        Row: {
          checked_at: string | null
          details: Json | null
          id: string
          service: string
          status: string
        }
        Insert: {
          checked_at?: string | null
          details?: Json | null
          id?: string
          service: string
          status: string
        }
        Update: {
          checked_at?: string | null
          details?: Json | null
          id?: string
          service?: string
          status?: string
        }
        Relationships: []
      }
      system_logs: {
        Row: {
          action: string
          context: Json | null
          created_at: string | null
          id: string
          input: string | null
          output: string | null
          service: string
          timestamp: string | null
        }
        Insert: {
          action: string
          context?: Json | null
          created_at?: string | null
          id?: string
          input?: string | null
          output?: string | null
          service: string
          timestamp?: string | null
        }
        Update: {
          action?: string
          context?: Json | null
          created_at?: string | null
          id?: string
          input?: string | null
          output?: string | null
          service?: string
          timestamp?: string | null
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
      workflow_queue: {
        Row: {
          created_at: string | null
          data: Json | null
          error: string | null
          id: string
          processed_at: string | null
          status: string | null
          workflow_name: string
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          error?: string | null
          id?: string
          processed_at?: string | null
          status?: string | null
          workflow_name: string
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          error?: string | null
          id?: string
          processed_at?: string | null
          status?: string | null
          workflow_name?: string
        }
        Relationships: []
      }
    }
    Views: {
      investor_properties: {
        Row: {
          accessibility: Json | null
          address: string | null
          bathrooms: number | null
          bedrooms: number | null
          created_at: string | null
          id: string | null
          name: string | null
          organization_name: string | null
          price: number | null
          property_type: string | null
          sda_category: string | null
          status: string | null
          updated_at: string | null
          weekly_rent: number | null
        }
        Relationships: []
      }
      participant_properties: {
        Row: {
          accessibility: Json | null
          address: string | null
          bathrooms: number | null
          bedrooms: number | null
          created_at: string | null
          id: string | null
          name: string | null
          price: number | null
          property_type: string | null
          sda_category: string | null
          status: string | null
          updated_at: string | null
          weekly_rent: number | null
        }
        Insert: {
          accessibility?: Json | null
          address?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          created_at?: string | null
          id?: string | null
          name?: string | null
          price?: number | null
          property_type?: string | null
          sda_category?: string | null
          status?: string | null
          updated_at?: string | null
          weekly_rent?: number | null
        }
        Update: {
          accessibility?: Json | null
          address?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          created_at?: string | null
          id?: string | null
          name?: string | null
          price?: number | null
          property_type?: string | null
          sda_category?: string | null
          status?: string | null
          updated_at?: string | null
          weekly_rent?: number | null
        }
        Relationships: []
      }
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
          property_manager: string | null
          property_type: string | null
          status: string | null
          weekly_rent: number | null
        }
        Insert: {
          accessibility?: Json | null
          address?: never
          bathrooms?: number | null
          bedrooms?: number | null
          created_at?: string | null
          features?: string[] | null
          id?: string | null
          name?: string | null
          property_manager?: never
          property_type?: string | null
          status?: string | null
          weekly_rent?: never
        }
        Update: {
          accessibility?: Json | null
          address?: never
          bathrooms?: number | null
          bedrooms?: number | null
          created_at?: string | null
          features?: string[] | null
          id?: string | null
          name?: string | null
          property_manager?: never
          property_type?: string | null
          status?: string | null
          weekly_rent?: never
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
      generate_secure_session_token: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_properties_for_audience: {
        Args: { include_mixed?: boolean; target_audience: string }
        Returns: {
          accessibility: Json | null
          address: string
          audience: string | null
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
          organization_id: string | null
          parking: number | null
          price: number | null
          property_manager: string | null
          property_type: string
          rating: number | null
          sda_category: string | null
          status: string
          updated_at: string
          visible_on_investor_site: boolean | null
          visible_on_participant_site: boolean | null
          weekly_rent: number | null
        }[]
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
      hash_session_token: {
        Args: { token: string }
        Returns: string
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
      migrate_sessions_to_hashed: {
        Args: Record<PropertyKey, never>
        Returns: number
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
      set_organization_context: {
        Args: { org_id: string }
        Returns: undefined
      }
      validate_admin_session_enhanced: {
        Args: {
          p_device_fingerprint?: string
          p_rotate_token?: boolean
          p_session_token: string
        }
        Returns: Json
      }
      validate_admin_session_secure: {
        Args: { p_device_fingerprint?: string; p_session_token: string }
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
