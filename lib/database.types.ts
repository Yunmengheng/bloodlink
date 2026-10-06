/**
 * Database types for the schema in supabase/migrations/0001_init.sql.
 *
 * Hand-written to match Supabase's generated shape. If you later connect the
 * Supabase CLI, regenerate with:
 *   npx supabase gen types typescript --project-id <ref> > lib/database.types.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type BloodTypeEnum =
  | "O-"
  | "O+"
  | "A-"
  | "A+"
  | "B-"
  | "B+"
  | "AB-"
  | "AB+";
export type UrgencyEnum = "critical" | "urgent" | "standard";
export type RequestStatusEnum = "open" | "fulfilled" | "cancelled";

export type Database = {
  public: {
    Tables: {
      donors: {
        Row: {
          id: string;
          full_name: string;
          blood_type: BloodTypeEnum;
          district: string;
          phone: string | null;
          telegram_username: string | null;
          last_donation_date: string | null;
          is_available: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          blood_type: BloodTypeEnum;
          district: string;
          phone?: string | null;
          telegram_username?: string | null;
          last_donation_date?: string | null;
          is_available?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          blood_type?: BloodTypeEnum;
          district?: string;
          phone?: string | null;
          telegram_username?: string | null;
          last_donation_date?: string | null;
          is_available?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };

      blood_requests: {
        Row: {
          id: string;
          requester_id: string;
          patient_blood_type: BloodTypeEnum;
          units_needed: number;
          hospital: string;
          district: string;
          urgency: UrgencyEnum;
          needed_by: string | null;
          note: string | null;
          status: RequestStatusEnum;
          responses_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          requester_id: string;
          patient_blood_type: BloodTypeEnum;
          units_needed: number;
          hospital: string;
          district: string;
          urgency?: UrgencyEnum;
          needed_by?: string | null;
          note?: string | null;
          status?: RequestStatusEnum;
          responses_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          patient_blood_type?: BloodTypeEnum;
          units_needed?: number;
          hospital?: string;
          district?: string;
          urgency?: UrgencyEnum;
          needed_by?: string | null;
          note?: string | null;
          status?: RequestStatusEnum;
          updated_at?: string;
        };
        Relationships: [];
      };

      request_contacts: {
        Row: {
          request_id: string;
          contact_name: string;
          phone: string | null;
          telegram_username: string | null;
        };
        Insert: {
          request_id: string;
          contact_name: string;
          phone?: string | null;
          telegram_username?: string | null;
        };
        Update: {
          contact_name?: string;
          phone?: string | null;
          telegram_username?: string | null;
        };
        Relationships: [];
      };

      responses: {
        Row: {
          id: string;
          request_id: string;
          donor_id: string;
          donor_name: string;
          donor_phone: string | null;
          donor_telegram: string | null;
          donor_blood_type: BloodTypeEnum;
          message: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          request_id: string;
          donor_id: string;
          donor_name: string;
          donor_phone?: string | null;
          donor_telegram?: string | null;
          donor_blood_type: BloodTypeEnum;
          message?: string | null;
          created_at?: string;
        };
        Update: {
          message?: string | null;
        };
        Relationships: [];
      };
    };

    Views: Record<never, never>;

    Functions: {
      get_public_stats: {
        Args: Record<PropertyKey, never>;
        Returns: {
          open_requests: number;
          registered_donors: number;
          fulfilled_requests: number;
        }[];
      };
      get_needed_blood_types: {
        Args: Record<PropertyKey, never>;
        Returns: { blood_type: BloodTypeEnum; request_count: number }[];
      };
    };

    Enums: {
      blood_type: BloodTypeEnum;
      urgency: UrgencyEnum;
      request_status: RequestStatusEnum;
    };

    CompositeTypes: Record<never, never>;
  };
};

/** Convenience row aliases used across the app. */
export type Donor = Database["public"]["Tables"]["donors"]["Row"];
export type BloodRequest =
  Database["public"]["Tables"]["blood_requests"]["Row"];
export type RequestContact =
  Database["public"]["Tables"]["request_contacts"]["Row"];
export type DonorResponse = Database["public"]["Tables"]["responses"]["Row"];
export type PublicStats =
  Database["public"]["Functions"]["get_public_stats"]["Returns"][number];
