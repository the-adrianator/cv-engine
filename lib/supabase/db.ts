/**
 * Database Helper Functions
 * 
 * Type-safe database operations for CV Engine
 */

import { createServerClient, createAdminClient } from "./server";
import type { Database } from "@/types/database";

type CV = Database["public"]["Tables"]["cvs"]["Row"];
type CVInsert = Database["public"]["Tables"]["cvs"]["Insert"];
type CVUpdate = Database["public"]["Tables"]["cvs"]["Update"];

type User = Database["public"]["Tables"]["users"]["Row"];
type UserInsert = Database["public"]["Tables"]["users"]["Insert"];

type UsageTracking = Database["public"]["Tables"]["usage_tracking"]["Row"];
type UsageTrackingInsert =
  Database["public"]["Tables"]["usage_tracking"]["Insert"];
type UsageTrackingUpdate =
  Database["public"]["Tables"]["usage_tracking"]["Update"];

/**
 * Get or create a user record
 */
export async function getOrCreateUser(
  userId: string,
  email: string,
  fullName?: string
): Promise<{ user: User | null; error: Error | null }> {
  try {
    const supabase = createServerClient();

    // Try to get existing user
    const { data: existingUser, error: fetchError } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (existingUser) {
      return { user: existingUser, error: null };
    }

    // Create new user if doesn't exist
    const { data: newUser, error: insertError } = await supabase
      .from("users")
      .insert({
        id: userId,
        email,
        full_name: fullName,
      })
      .select()
      .single();

    if (insertError) {
      return { user: null, error: insertError };
    }

    return { user: newUser, error: null };
  } catch (error) {
    return {
      user: null,
      error: error instanceof Error ? error : new Error("Failed to get or create user"),
    };
  }
}

/**
 * Get all CVs for a user
 */
export async function getUserCVs(
  userId: string
): Promise<{ cvs: CV[] | null; error: Error | null }> {
  try {
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from("cvs")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      return { cvs: null, error };
    }

    return { cvs: data, error: null };
  } catch (error) {
    return {
      cvs: null,
      error: error instanceof Error ? error : new Error("Failed to fetch CVs"),
    };
  }
}

/**
 * Get a single CV by ID
 */
export async function getCV(
  cvId: string,
  userId: string
): Promise<{ cv: CV | null; error: Error | null }> {
  try {
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from("cvs")
      .select("*")
      .eq("id", cvId)
      .eq("user_id", userId)
      .single();

    if (error) {
      return { cv: null, error };
    }

    return { cv: data, error: null };
  } catch (error) {
    return {
      cv: null,
      error: error instanceof Error ? error : new Error("Failed to fetch CV"),
    };
  }
}

/**
 * Create a new CV
 */
export async function createCV(
  cvData: CVInsert
): Promise<{ cv: CV | null; error: Error | null }> {
  try {
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from("cvs")
      .insert(cvData)
      .select()
      .single();

    if (error) {
      return { cv: null, error };
    }

    return { cv: data, error: null };
  } catch (error) {
    return {
      cv: null,
      error: error instanceof Error ? error : new Error("Failed to create CV"),
    };
  }
}

/**
 * Update a CV
 */
export async function updateCV(
  cvId: string,
  userId: string,
  updates: CVUpdate
): Promise<{ cv: CV | null; error: Error | null }> {
  try {
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from("cvs")
      .update(updates)
      .eq("id", cvId)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      return { cv: null, error };
    }

    return { cv: data, error: null };
  } catch (error) {
    return {
      cv: null,
      error: error instanceof Error ? error : new Error("Failed to update CV"),
    };
  }
}

/**
 * Delete a CV
 */
export async function deleteCV(
  cvId: string,
  userId: string
): Promise<{ success: boolean; error: Error | null }> {
  try {
    const supabase = createServerClient();

    const { error } = await supabase
      .from("cvs")
      .delete()
      .eq("id", cvId)
      .eq("user_id", userId);

    if (error) {
      return { success: false, error };
    }

    return { success: true, error: null };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error("Failed to delete CV"),
    };
  }
}

/**
 * Get or create usage tracking for a user
 */
export async function getOrCreateUsageTracking(
  userId: string
): Promise<{ usage: UsageTracking | null; error: Error | null }> {
  try {
    const supabase = createServerClient();

    // Atomically ensure a row exists for this user using an upsert.
    // We only upsert the user_id so existing counters are not reset.
    const { error: upsertError } = await supabase
      .from("usage_tracking")
      .upsert(
        { user_id: userId },
        {
          onConflict: "user_id",
        }
      );

    if (upsertError) {
      return { usage: null, error: upsertError };
    }

    // Now safely read the row
    const { data, error } = await supabase
      .from("usage_tracking")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      return { usage: null, error };
    }

    return { usage: data, error: null };
  } catch (error) {
    return {
      usage: null,
      error:
        error instanceof Error
          ? error
          : new Error("Failed to get or create usage tracking"),
    };
  }
}

/**
 * Increment scan count for a user (atomic operation)
 * 
 * Uses a database RPC function to perform atomic increment, preventing
 * race conditions when multiple requests increment simultaneously.
 * The function also handles monthly reset logic and creates the row
 * if it doesn't exist.
 */
export async function incrementScanCount(
  userId: string
): Promise<{ usage: UsageTracking | null; error: Error | null }> {
  try {
    // Use admin client for RPC mutation to ensure proper permissions
    const supabase = createAdminClient();

    // Call the atomic RPC function
    // This performs: INSERT ON CONFLICT + atomic UPDATE in a single transaction
    const { data, error } = await supabase.rpc("increment_scan_count", {
      p_user_id: userId,
    });

    if (error) {
      return { usage: null, error };
    }

    if (!data) {
      return {
        usage: null,
        error: new Error("Failed to increment scan count: no data returned"),
      };
    }

    return { usage: data, error: null };
  } catch (error) {
    return {
      usage: null,
      error:
        error instanceof Error
          ? error
          : new Error("Failed to increment scan count"),
    };
  }
}

