/**
 * Clerk Authentication Utilities
 * 
 * Provides helper functions and hooks for authentication
 * with proper error handling and type safety.
 */

import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

/**
 * Get the current authenticated user (server-side)
 * Returns null if not authenticated
 */
export async function getAuthUser() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return null;
    }

    const user = await currentUser();
    return user;
  } catch (error) {
    console.error("Error getting auth user:", error);
    return null;
  }
}

/**
 * Require authentication (server-side)
 * Redirects to sign-in if not authenticated
 * Returns the user if authenticated
 */
export async function requireAuth() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      redirect("/auth/sign-in");
    }

    const user = await currentUser();
    
    if (!user) {
      redirect("/auth/sign-in");
    }

    return user;
  } catch (error) {
    console.error("Error in requireAuth:", error);
    redirect("/auth/sign-in");
  }
}

/**
 * Get user ID (server-side)
 * Returns null if not authenticated
 */
export async function getUserId() {
  try {
    const { userId } = await auth();
    return userId;
  } catch (error) {
    console.error("Error getting user ID:", error);
    return null;
  }
}

/**
 * Check if user is authenticated (server-side)
 */
export async function isAuthenticated() {
  try {
    const { userId } = await auth();
    return !!userId;
  } catch (error) {
    console.error("Error checking authentication:", error);
    return false;
  }
}

