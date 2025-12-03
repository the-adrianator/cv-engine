/**
 * Supabase Client (Client-side)
 * 
 * Use this for client components and browser-side operations
 * 
 * Uses lazy initialization to avoid crashing the app if environment
 * variables are missing at module load time.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let supabaseClient: SupabaseClient | null = null;

/**
 * Get or create the Supabase client instance
 * 
 * Checks environment variables at call-time and throws a helpful error
 * only when the client is actually requested, not at module load.
 * 
 * @returns Supabase client instance
 * @throws Error if required environment variables are missing
 */
export function getSupabaseClient(): SupabaseClient {
  if (supabaseClient) {
    return supabaseClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    const missingVars: string[] = [];
    if (!supabaseUrl) missingVars.push("NEXT_PUBLIC_SUPABASE_URL");
    if (!supabaseAnonKey) missingVars.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");

    throw new Error(
      `Missing required Supabase environment variables: ${missingVars.join(", ")}\n` +
      `Please add these to your .env.local file:\n` +
      `  NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co\n` +
      `  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key\n` +
      `See SUPABASE_SETUP.md for setup instructions.`
    );
  }

  supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false, // Clerk handles auth, not Supabase
      autoRefreshToken: false,
    },
  });

  return supabaseClient;
}

/**
 * Legacy export for backward compatibility
 * @deprecated Use getSupabaseClient() instead for better error handling
 */
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return getSupabaseClient()[prop as keyof SupabaseClient];
  },
});

