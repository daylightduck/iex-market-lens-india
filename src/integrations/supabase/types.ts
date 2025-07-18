export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      dam_snapshot: {
        Row: {
          Date: string | null
          "Final Scheduled Volume (MW)": number | null
          Hour: string | null
          "MCP (Rs/MWh)": number | null
          "MCV (MW)": number | null
          "Purchase Bid (MW)": number | null
          "Sell Bid (MW)": number | null
          "Time Block": string | null
        }
        Insert: {
          Date?: string | null
          "Final Scheduled Volume (MW)"?: number | null
          Hour?: string | null
          "MCP (Rs/MWh)"?: number | null
          "MCV (MW)"?: number | null
          "Purchase Bid (MW)"?: number | null
          "Sell Bid (MW)"?: number | null
          "Time Block"?: string | null
        }
        Update: {
          Date?: string | null
          "Final Scheduled Volume (MW)"?: number | null
          Hour?: string | null
          "MCP (Rs/MWh)"?: number | null
          "MCV (MW)"?: number | null
          "Purchase Bid (MW)"?: number | null
          "Sell Bid (MW)"?: number | null
          "Time Block"?: string | null
        }
        Relationships: []
      }
      kyc_documents: {
        Row: {
          document_type: string
          document_url: string
          id: string
          rejection_reason: string | null
          status: Database["public"]["Enums"]["kyc_status"] | null
          uploaded_at: string | null
          user_id: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          document_type: string
          document_url: string
          id?: string
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["kyc_status"] | null
          uploaded_at?: string | null
          user_id?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          document_type?: string
          document_url?: string
          id?: string
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["kyc_status"] | null
          uploaded_at?: string | null
          user_id?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kyc_documents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kyc_documents_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          city: string | null
          company_name: string
          company_registration_number: string | null
          created_at: string | null
          email: string
          energy_license_number: string | null
          full_name: string
          id: string
          kyc_status: Database["public"]["Enums"]["kyc_status"] | null
          phone: string | null
          pincode: string | null
          state: string | null
          updated_at: string | null
          user_role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          address?: string | null
          city?: string | null
          company_name: string
          company_registration_number?: string | null
          created_at?: string | null
          email: string
          energy_license_number?: string | null
          full_name: string
          id: string
          kyc_status?: Database["public"]["Enums"]["kyc_status"] | null
          phone?: string | null
          pincode?: string | null
          state?: string | null
          updated_at?: string | null
          user_role: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          address?: string | null
          city?: string | null
          company_name?: string
          company_registration_number?: string | null
          created_at?: string | null
          email?: string
          energy_license_number?: string | null
          full_name?: string
          id?: string
          kyc_status?: Database["public"]["Enums"]["kyc_status"] | null
          phone?: string | null
          pincode?: string | null
          state?: string | null
          updated_at?: string | null
          user_role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      kyc_status: "pending" | "verified" | "rejected"
      user_role: "buyer" | "seller" | "regulator"
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
      kyc_status: ["pending", "verified", "rejected"],
      user_role: ["buyer", "seller", "regulator"],
    },
  },
} as const
