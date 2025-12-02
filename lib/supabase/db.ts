/**
 * Database Helper Functions
 * 
 * Type-safe database operations for CV Engine
 */

import { createServerClient } from "./server";
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

    // Try to get existing usage
    const { data: existingUsage, error: fetchError } = await supabase
      .from("usage_tracking")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (existingUsage) {
      return { usage: existingUsage, error: null };
    }

    // Create new usage tracking if doesn't exist
    const { data: newUsage, error: insertError } = await supabase
      .from("usage_tracking")
      .insert({
        user_id: userId,
        scans_this_month: 0,
        total_scans: 0,
        last_reset_date: new Date().toISOString().split("T")[0],
      })
      .select()
      .single();

    if (insertError) {
      return { usage: null, error: insertError };
    }

    return { usage: newUsage, error: null };
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
 * Increment scan count for a user
 */
export async function incrementScanCount(
  userId: string
): Promise<{ usage: UsageTracking | null; error: Error | null }> {
  try {
    const supabase = createServerClient();

    // Get current usage
    const { usage, error: fetchError } = await getOrCreateUsageTracking(userId);
    if (fetchError || !usage) {
      return { usage: null, error: fetchError || new Error("Usage not found") };
    }

    // Check if we need to reset monthly count
    const today = new Date();
    const lastReset = new Date(usage.last_reset_date);
    const needsReset =
      today.getMonth() !== lastReset.getMonth() ||
      today.getFullYear() !== lastReset.getFullYear();

    const updates: UsageTrackingUpdate = {
      scans_this_month: needsReset ? 1 : usage.scans_this_month + 1,
      total_scans: usage.total_scans + 1,
      last_reset_date: needsReset
        ? today.toISOString().split("T")[0]
        : usage.last_reset_date,
    };

    const { data, error } = await supabase
      .from("usage_tracking")
      .update(updates)
      .eq("user_id", userId)
      .select()
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
          : new Error("Failed to increment scan count"),
    };
  }
}

