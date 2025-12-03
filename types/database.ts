/**
 * Database Types
 * 
 * Generated types for Supabase database
 * Update this when you run Supabase type generation
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
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      cvs: {
        Row: {
          id: string;
          user_id: string;
          company_name: string | null;
          job_title: string | null;
          job_description: string | null;
          pdf_path: string;
          image_path: string;
          feedback: Json | null;
          analysis_status: string | null;
          analysis_error: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          company_name?: string | null;
          job_title?: string | null;
          job_description?: string | null;
          pdf_path: string;
          image_path: string;
          feedback?: Json | null;
          analysis_status?: string | null;
          analysis_error?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          company_name?: string | null;
          job_title?: string | null;
          job_description?: string | null;
          pdf_path?: string;
          image_path?: string;
          feedback?: Json | null;
          analysis_status?: string | null;
          analysis_error?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      usage_tracking: {
        Row: {
          id: string;
          user_id: string;
          scans_this_month: number;
          total_scans: number;
          last_reset_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          scans_this_month?: number;
          total_scans?: number;
          last_reset_date?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          scans_this_month?: number;
          total_scans?: number;
          last_reset_date?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          tier: string;
          status: string;
          current_period_end: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          tier?: string;
          status?: string;
          current_period_end?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          tier?: string;
          status?: string;
          current_period_end?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

