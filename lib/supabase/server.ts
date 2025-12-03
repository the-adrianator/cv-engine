/**
 * Supabase Client (Server-side)
 * 
 * Use this for server components, API routes, and server actions
 * 
 * Note: Since we're using Clerk for auth (not Supabase Auth),
 * we don't need cookie handling for authentication.
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Please check your .env.local file."
  );
}

// Type assertions after validation
const SUPABASE_URL = supabaseUrl as string;
const SUPABASE_ANON_KEY = supabaseAnonKey as string;

/**
 * Get Supabase client for server-side operations
 * Uses anon key for regular operations
 * 
 * Since we use Clerk for auth, we don't need cookie handling
 */
export function createServerClient() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Get Supabase admin client for privileged operations
 * Uses service role key - only use in server-side code!
 */
export function createAdminClient() {
  if (!supabaseServiceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is required for admin operations"
    );
  }

  return createClient(SUPABASE_URL, supabaseServiceRoleKey as string, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

