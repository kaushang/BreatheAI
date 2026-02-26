/**
 * Supabase Database Types
 *
 * TypeScript type definitions matching the database schema defined in
 * supabase/migrations/001_initial_schema.sql
 *
 * These types are used to provide full type-safety when querying
 * Supabase tables via the client or server Supabase clients.
 *
 * In production, these would be auto-generated using:
 *   npx supabase gen types typescript --project-id <your-project-id> > src/types/database.ts
 *
 * For now, they are manually defined to match the migration schema.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          city: string;
          area: string;
          lat: number;
          lng: number;
          health_conditions: string[];
          aqi_alert_threshold: number;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          email: string;
          city: string;
          area?: string;
          lat?: number;
          lng?: number;
          health_conditions?: string[];
          aqi_alert_threshold?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          email?: string;
          city?: string;
          area?: string;
          lat?: number;
          lng?: number;
          health_conditions?: string[];
          aqi_alert_threshold?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      aqi_history: {
        Row: {
          id: string;
          city: string;
          area: string;
          station_name: string;
          aqi: number;
          dominant_pollutant: string;
          pm25: number | null;
          pm10: number | null;
          no2: number | null;
          so2: number | null;
          co: number | null;
          o3: number | null;
          fetched_at: string;
        };
        Insert: {
          id?: string;
          city: string;
          area?: string;
          station_name: string;
          aqi: number;
          dominant_pollutant?: string;
          pm25?: number | null;
          pm10?: number | null;
          no2?: number | null;
          so2?: number | null;
          co?: number | null;
          o3?: number | null;
          fetched_at?: string;
        };
        Update: {
          id?: string;
          city?: string;
          area?: string;
          station_name?: string;
          aqi?: number;
          dominant_pollutant?: string;
          pm25?: number | null;
          pm10?: number | null;
          no2?: number | null;
          so2?: number | null;
          co?: number | null;
          o3?: number | null;
          fetched_at?: string;
        };
        Relationships: [];
      };
      alerts_log: {
        Row: {
          id: string;
          user_id: string;
          aqi_at_alert: number;
          city: string;
          area: string;
          sent_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          aqi_at_alert: number;
          city: string;
          area?: string;
          sent_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          aqi_at_alert?: number;
          city?: string;
          area?: string;
          sent_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
