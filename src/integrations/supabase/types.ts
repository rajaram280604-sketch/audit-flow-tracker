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
      audit_events: {
        Row: {
          actor_id: string
          created_at: string
          engagement_id: string
          entity_id: string | null
          entity_type: string
          event_type: Database["public"]["Enums"]["audit_event_type"]
          id: string
          message: string
          metadata: Json
        }
        Insert: {
          actor_id: string
          created_at?: string
          engagement_id: string
          entity_id?: string | null
          entity_type: string
          event_type: Database["public"]["Enums"]["audit_event_type"]
          id?: string
          message: string
          metadata?: Json
        }
        Update: {
          actor_id?: string
          created_at?: string
          engagement_id?: string
          entity_id?: string | null
          entity_type?: string
          event_type?: Database["public"]["Enums"]["audit_event_type"]
          id?: string
          message?: string
          metadata?: Json
        }
        Relationships: [
          {
            foreignKeyName: "audit_events_engagement_id_fkey"
            columns: ["engagement_id"]
            isOneToOne: false
            referencedRelation: "engagements"
            referencedColumns: ["id"]
          },
        ]
      }
      engagement_members: {
        Row: {
          created_at: string
          display_name: string
          engagement_id: string
          id: string
          role_title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name: string
          engagement_id: string
          id?: string
          role_title: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string
          engagement_id?: string
          id?: string
          role_title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "engagement_members_engagement_id_fkey"
            columns: ["engagement_id"]
            isOneToOne: false
            referencedRelation: "engagements"
            referencedColumns: ["id"]
          },
        ]
      }
      engagements: {
        Row: {
          client_name: string
          created_at: string
          engagement_code: string
          financial_year: string
          freeze_target: string | null
          id: string
          owner_id: string
          partner_name: string | null
          reporting_framework: string
          status: Database["public"]["Enums"]["engagement_status"]
          updated_at: string
        }
        Insert: {
          client_name: string
          created_at?: string
          engagement_code: string
          financial_year: string
          freeze_target?: string | null
          id?: string
          owner_id: string
          partner_name?: string | null
          reporting_framework?: string
          status?: Database["public"]["Enums"]["engagement_status"]
          updated_at?: string
        }
        Update: {
          client_name?: string
          created_at?: string
          engagement_code?: string
          financial_year?: string
          freeze_target?: string | null
          id?: string
          owner_id?: string
          partner_name?: string | null
          reporting_framework?: string
          status?: Database["public"]["Enums"]["engagement_status"]
          updated_at?: string
        }
        Relationships: []
      }
      materiality_assessments: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          benchmark_amount: number
          benchmark_name: string
          benchmark_percentage: number
          benchmark_rationale: string
          clearly_trivial_threshold: number
          control_risk: Database["public"]["Enums"]["risk_level"]
          created_at: string
          current_version: number
          detection_risk: Database["public"]["Enums"]["risk_level"]
          engagement_id: string
          id: string
          inherent_risk: Database["public"]["Enums"]["risk_level"]
          judgement_rationale: string
          overall_materiality: number
          performance_materiality: number
          prepared_by: string
          reviewed_by: string | null
          status: Database["public"]["Enums"]["materiality_status"]
          submitted_at: string | null
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          benchmark_amount?: number
          benchmark_name: string
          benchmark_percentage?: number
          benchmark_rationale?: string
          clearly_trivial_threshold?: number
          control_risk?: Database["public"]["Enums"]["risk_level"]
          created_at?: string
          current_version?: number
          detection_risk?: Database["public"]["Enums"]["risk_level"]
          engagement_id: string
          id?: string
          inherent_risk?: Database["public"]["Enums"]["risk_level"]
          judgement_rationale?: string
          overall_materiality?: number
          performance_materiality?: number
          prepared_by: string
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["materiality_status"]
          submitted_at?: string | null
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          benchmark_amount?: number
          benchmark_name?: string
          benchmark_percentage?: number
          benchmark_rationale?: string
          clearly_trivial_threshold?: number
          control_risk?: Database["public"]["Enums"]["risk_level"]
          created_at?: string
          current_version?: number
          detection_risk?: Database["public"]["Enums"]["risk_level"]
          engagement_id?: string
          id?: string
          inherent_risk?: Database["public"]["Enums"]["risk_level"]
          judgement_rationale?: string
          overall_materiality?: number
          performance_materiality?: number
          prepared_by?: string
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["materiality_status"]
          submitted_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "materiality_assessments_engagement_id_fkey"
            columns: ["engagement_id"]
            isOneToOne: true
            referencedRelation: "engagements"
            referencedColumns: ["id"]
          },
        ]
      }
      materiality_versions: {
        Row: {
          actor_id: string
          assessment_id: string
          created_at: string
          id: string
          rationale: string
          snapshot: Json
          status: Database["public"]["Enums"]["materiality_status"]
          version_number: number
        }
        Insert: {
          actor_id: string
          assessment_id: string
          created_at?: string
          id?: string
          rationale?: string
          snapshot: Json
          status: Database["public"]["Enums"]["materiality_status"]
          version_number: number
        }
        Update: {
          actor_id?: string
          assessment_id?: string
          created_at?: string
          id?: string
          rationale?: string
          snapshot?: Json
          status?: Database["public"]["Enums"]["materiality_status"]
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "materiality_versions_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "materiality_assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      misstatements: {
        Row: {
          assessment_id: string | null
          audit_area: string
          conclusion: string | null
          corrected_amount: number
          created_at: string
          description: string
          engagement_id: string
          gross_amount: number
          id: string
          identified_by: string
          management_response: string | null
          misstatement_type: Database["public"]["Enums"]["misstatement_type"]
          net_amount: number
          reference_code: string
          resolved_at: string | null
          status: Database["public"]["Enums"]["misstatement_status"]
          tax_effect: number
          updated_at: string
        }
        Insert: {
          assessment_id?: string | null
          audit_area: string
          conclusion?: string | null
          corrected_amount?: number
          created_at?: string
          description: string
          engagement_id: string
          gross_amount?: number
          id?: string
          identified_by: string
          management_response?: string | null
          misstatement_type?: Database["public"]["Enums"]["misstatement_type"]
          net_amount?: number
          reference_code: string
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["misstatement_status"]
          tax_effect?: number
          updated_at?: string
        }
        Update: {
          assessment_id?: string | null
          audit_area?: string
          conclusion?: string | null
          corrected_amount?: number
          created_at?: string
          description?: string
          engagement_id?: string
          gross_amount?: number
          id?: string
          identified_by?: string
          management_response?: string | null
          misstatement_type?: Database["public"]["Enums"]["misstatement_type"]
          net_amount?: number
          reference_code?: string
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["misstatement_status"]
          tax_effect?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "misstatements_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "materiality_assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "misstatements_engagement_id_fkey"
            columns: ["engagement_id"]
            isOneToOne: false
            referencedRelation: "engagements"
            referencedColumns: ["id"]
          },
        ]
      }
      time_entries: {
        Row: {
          audit_area: string
          billable: boolean
          created_at: string
          description: string
          engagement_id: string
          hours: number
          id: string
          status: string
          updated_at: string
          user_id: string
          work_date: string
        }
        Insert: {
          audit_area: string
          billable?: boolean
          created_at?: string
          description: string
          engagement_id: string
          hours?: number
          id?: string
          status?: string
          updated_at?: string
          user_id: string
          work_date?: string
        }
        Update: {
          audit_area?: string
          billable?: boolean
          created_at?: string
          description?: string
          engagement_id?: string
          hours?: number
          id?: string
          status?: string
          updated_at?: string
          user_id?: string
          work_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_entries_engagement_id_fkey"
            columns: ["engagement_id"]
            isOneToOne: false
            referencedRelation: "engagements"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      record_audit_event: {
        Args: {
          _engagement_id: string
          _entity_id: string
          _entity_type: string
          _event_type: Database["public"]["Enums"]["audit_event_type"]
          _message: string
          _metadata?: Json
        }
        Returns: {
          actor_id: string
          created_at: string
          engagement_id: string
          entity_id: string | null
          entity_type: string
          event_type: Database["public"]["Enums"]["audit_event_type"]
          id: string
          message: string
          metadata: Json
        }
        SetofOptions: {
          from: "*"
          to: "audit_events"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      audit_event_type:
        | "created"
        | "updated"
        | "submitted_for_review"
        | "returned"
        | "approved"
        | "rejected"
        | "frozen"
      engagement_status:
        | "planning"
        | "fieldwork"
        | "review"
        | "completed"
        | "frozen"
      materiality_status:
        | "draft"
        | "senior_review"
        | "partner_review"
        | "approved"
        | "rejected"
      misstatement_status: "open" | "corrected" | "uncorrected" | "waived"
      misstatement_type: "known" | "likely" | "projected"
      risk_level: "low" | "medium" | "high"
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
      audit_event_type: [
        "created",
        "updated",
        "submitted_for_review",
        "returned",
        "approved",
        "rejected",
        "frozen",
      ],
      engagement_status: [
        "planning",
        "fieldwork",
        "review",
        "completed",
        "frozen",
      ],
      materiality_status: [
        "draft",
        "senior_review",
        "partner_review",
        "approved",
        "rejected",
      ],
      misstatement_status: ["open", "corrected", "uncorrected", "waived"],
      misstatement_type: ["known", "likely", "projected"],
      risk_level: ["low", "medium", "high"],
    },
  },
} as const
