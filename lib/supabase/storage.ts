/**
 * Supabase Storage Utilities
 * 
 * Helper functions for file uploads and storage operations
 */

import { createServerClient } from "./server";
import { supabase } from "./client";

const BUCKET_NAME = "cvs";

/**
 * Upload a file to Supabase Storage (client-side)
 */
export async function uploadFile(
  file: File | Blob,
  path: string,
  userId: string
): Promise<{ path: string; error: Error | null }> {
  try {
    const filePath = `${userId}/${path}`;

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      return { path: "", error };
    }

    return { path: filePath, error: null };
  } catch (error) {
    return {
      path: "",
      error: error instanceof Error ? error : new Error("Upload failed"),
    };
  }
}

/**
 * Get a public URL for a file (client-side)
 */
export function getPublicUrl(path: string): string {
  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Get a signed URL for a file (server-side)
 * Use this for private files that need temporary access
 * Requires service role key for private buckets
 */
export async function getSignedUrl(
  path: string,
  expiresIn: number = 3600
): Promise<{ url: string | null; error: Error | null }> {
  try {
    // Use admin client to generate signed URLs for private buckets
    const { createAdminClient } = await import("./server");
    const supabase = createAdminClient();

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(path, expiresIn);

    if (error) {
      return { url: null, error };
    }

    return { url: data.signedUrl, error: null };
  } catch (error) {
    return {
      url: null,
      error: error instanceof Error ? error : new Error("Failed to create signed URL"),
    };
  }
}

/**
 * Delete a file from storage (server-side)
 */
export async function deleteFile(
  path: string
): Promise<{ success: boolean; error: Error | null }> {
  try {
    const supabase = createServerClient();

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([path]);

    if (error) {
      return { success: false, error };
    }

    return { success: true, error: null };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error("Failed to delete file"),
    };
  }
}

