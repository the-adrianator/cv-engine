/**
 * API Route: CV Upload
 * 
 * Handles CV file upload, PDF to image conversion, storage, and database record creation
 */

import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createAdminClient } from "@/lib/supabase/server";
import { createCV, updateCV } from "@/lib/supabase/db";
import { generateUUID } from "@/lib/utils";
import type { Json } from "@/types/database";

// Increase body size limit for file uploads (20MB)
export const maxDuration = 60; // 60 seconds max
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user info
    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const companyName = formData.get("companyName") as string;
    const jobTitle = formData.get("jobTitle") as string;
    const jobDescription = formData.get("jobDescription") as string;
    const totalPages = parseInt(formData.get("totalPages") as string) || 1;
    
    // Get all image blobs (for multi-page support)
    const imageBlobs: Blob[] = [];
    for (let i = 0; i < totalPages; i++) {
      const blob = formData.get(`imageBlob-${i}`) as Blob;
      if (blob) {
        imageBlobs.push(blob);
      }
    }
    
    // Fallback to single image if no multi-page images found
    if (imageBlobs.length === 0) {
      const singleBlob = formData.get("imageBlob") as Blob;
      if (singleBlob) {
        imageBlobs.push(singleBlob);
      }
    }

    // Validate inputs
    if (!file || !companyName || !jobTitle || !jobDescription || imageBlobs.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate file type (client-provided, can be spoofed)
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "File must be a PDF" },
        { status: 400 }
      );
    }

    // Server-side content validation: verify PDF magic bytes
    // This prevents malicious files with spoofed MIME types
    // PDF files start with "%PDF-" (5 bytes) or may have whitespace/BOM before it
    const fileBuffer = await file.arrayBuffer();
    // Read first 8 bytes to account for potential BOM or whitespace
    const headerBytes = new Uint8Array(fileBuffer.slice(0, 8));
    const headerString = new TextDecoder('ascii', { fatal: false }).decode(headerBytes);
    
    // Check if the header contains "%PDF" (standard PDF magic bytes)
    if (!headerString.includes("%PDF")) {
      return NextResponse.json(
        { error: "File must be a PDF" },
        { status: 400 }
      );
    }

    // Validate file size (20MB max)
    const maxSize = 20 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size exceeds 20MB limit" },
        { status: 400 }
      );
    }

    // Use admin client for storage uploads to bypass RLS
    // Storage buckets with RLS require service role key for uploads
    const supabase = createAdminClient();
    const cvId = generateUUID();

    // Upload PDF file to Supabase Storage
    const pdfPath = `${userId}/${cvId}.pdf`;
    const { error: pdfUploadError, data: pdfData } = await supabase.storage
      .from("cvs")
      .upload(pdfPath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: "application/pdf",
      });

    if (pdfUploadError) {
      console.error("PDF upload error:", pdfUploadError);
      console.error("PDF upload error details:", JSON.stringify(pdfUploadError, null, 2));
      return NextResponse.json(
        { 
          error: "Failed to upload PDF file",
          details: pdfUploadError.message || "Unknown error"
        },
        { status: 500 }
      );
    }

    // Upload all image files to Supabase Storage
    const imagePaths: string[] = [];
    for (let i = 0; i < imageBlobs.length; i++) {
      const imagePath = imageBlobs.length > 1 
        ? `${userId}/${cvId}-page-${i + 1}.png`
        : `${userId}/${cvId}.png`;
      
      const { error: imageUploadError } = await supabase.storage
        .from("cvs")
        .upload(imagePath, imageBlobs[i], {
          cacheControl: "3600",
          upsert: false,
          contentType: "image/png",
        });

      if (imageUploadError) {
        console.error(`Image upload error for page ${i + 1}:`, imageUploadError);
        // Clean up PDF and previously uploaded images
        await supabase.storage.from("cvs").remove([pdfPath, ...imagePaths]);
        return NextResponse.json(
          { 
            error: `Failed to upload image file (page ${i + 1})`,
            details: imageUploadError.message || "Unknown error"
          },
          { status: 500 }
        );
      }
      
      imagePaths.push(imagePath);
    }
    
    // Store the first image path for backward compatibility and analysis
    const imagePath = imagePaths[0];

    // Use regular client for database operations
    const dbClient = createServerClient();
    
    // Create database record with analysis_status set to 'pending'
    // Store image paths as JSON array for multi-page support
    const imagePathsJson = JSON.stringify(imagePaths);
    
    // Try to create CV with analysis_status (if migration has been run)
    // If it fails due to missing column, retry without it for backward compatibility
    let cvData: Parameters<typeof createCV>[0] = {
      id: cvId,
      user_id: userId,
      company_name: companyName,
      job_title: jobTitle,
      job_description: jobDescription,
      pdf_path: pdfPath,
      image_path: imagePathsJson, // Store as JSON array for multi-page support
      feedback: null, // Will be populated after AI analysis
      analysis_status: 'pending', // Set status to pending before queuing analysis
    };
    
    let { cv, error: dbError } = await createCV(cvData);
    
    // If error is due to missing column (migration not run), retry without analysis_status
    if (dbError && dbError.message?.includes('column') && dbError.message?.includes('analysis_status')) {
      console.warn("analysis_status column not found, creating CV without it (migration may not be run)");
      const { analysis_status, ...cvDataWithoutStatus } = cvData;
      const retryResult = await createCV(cvDataWithoutStatus);
      cv = retryResult.cv;
      dbError = retryResult.error;
    }

    if (dbError || !cv) {
      console.error("Database error:", dbError);
      console.error("Database error details:", JSON.stringify(dbError, null, 2));
      // Clean up uploaded files
      await supabase.storage.from("cvs").remove([pdfPath, ...imagePaths]);
      return NextResponse.json(
        { 
          error: "Failed to create CV record",
          details: dbError?.message || "Unknown database error"
        },
        { status: 500 }
      );
    }

    // Trigger CV analysis as a background task
    // 
    // ⚠️ IMPORTANT: This uses experimental/best-effort APIs that are NOT guaranteed
    // to complete in serverless environments. Both unstable_after and the IIFE fallback
    // can be terminated if the serverless runtime shuts down after the response is sent.
    //
    // Current implementation:
    // - Uses unstable_after (Next.js 15+ experimental API) if available
    // - Falls back to IIFE (fire-and-forget) if unstable_after is not available
    // - Both approaches are best-effort only and may not complete reliably
    //
    // TODO: For production reliability, consider implementing a durable job queue:
    // - Use a dedicated service (Inngest, Trigger.dev, BullMQ, etc.)
    // - Enqueue analysis jobs with retry/visibility guarantees
    // - Implement a worker process to consume and process jobs
    // - This ensures analysis completes even if the API route terminates early
    const runAnalysis = async () => {
      try {
        console.log('Starting background CV analysis:', cv.id);
        
        // Import analysis dependencies
        const {
          analyzeCV,
          prepareInstructions,
          sanitizeJobInputs,
        } = await import("@/lib/openai/analyze");
        const { updateCV } = await import("@/lib/supabase/db");
        const { getSignedUrl } = await import("@/lib/supabase/storage");
        
        // Helper to update CV with status (handles missing column gracefully)
        const updateCVWithStatus = async (updates: Parameters<typeof updateCV>[2]) => {
          const result = await updateCV(cv.id, userId, updates);
          // If error is due to missing analysis_status column, try without it
          if (result.error) {
            const errorMsg = result.error.message || String(result.error);
            if (errorMsg.includes('column') && errorMsg.includes('analysis_status')) {
              console.warn("analysis_status column not found, updating without status fields");
              const { analysis_status, analysis_error, ...updatesWithoutStatus } = updates;
              return await updateCV(cv.id, userId, updatesWithoutStatus);
            }
          }
          return result;
        };
        
        // Generate signed URL for the first image (for analysis)
        const firstImagePath = imagePaths[0];
        const { url: finalImageUrl, error: urlError } = await getSignedUrl(firstImagePath, 3600);
        if (urlError || !finalImageUrl) {
          console.error("Error generating signed URL for analysis:", urlError);
          const errorMessage = urlError?.message || "Failed to generate signed URL";
          await updateCVWithStatus({
            analysis_status: 'failed',
            analysis_error: errorMessage,
          });
          return;
        }
        
        // Sanitize user-provided job context before including in prompts
        const {
          jobTitle: safeJobTitle,
          jobDescription: safeJobDescription,
        } = sanitizeJobInputs({ jobTitle, jobDescription });

        // Prepare instructions with sanitized inputs
        const instructions = prepareInstructions({
          jobTitle: safeJobTitle,
          jobDescription: safeJobDescription,
        });
        
        // Analyze CV
        console.log('Calling OpenAI for CV analysis...');
        const { feedback, error: analysisError } = await analyzeCV(finalImageUrl, instructions);
        
        if (analysisError || !feedback) {
          const errorMessage = analysisError || "Analysis failed";
          console.error("OpenAI analysis failed:", errorMessage);
          await updateCVWithStatus({
            analysis_status: 'failed',
            analysis_error: errorMessage,
          });
          return;
        }
        
        // Update CV record with feedback and success status
        console.log('Saving feedback to database...');
        const feedbackJson = JSON.parse(JSON.stringify(feedback)) as Json;
        const { error: updateError } = await updateCVWithStatus({
          feedback: feedbackJson,
          analysis_status: 'succeeded',
          analysis_error: null, // Clear any previous errors
        });
        
        if (updateError) {
          console.error("Failed to save feedback:", updateError);
          await updateCVWithStatus({
            analysis_status: 'failed',
            analysis_error: updateError.message || "Failed to save feedback",
          });
        } else {
          console.log('CV analysis complete and saved:', cv.id);
        }
      } catch (error) {
        console.error('Background analysis error:', error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        try {
          const { updateCV } = await import("@/lib/supabase/db");
          // Try to update status, but don't fail if column doesn't exist
          const statusResult = await updateCV(cv.id, userId, {
            analysis_status: 'failed',
            analysis_error: errorMessage,
          });
          if (statusResult.error) {
            const errorMsg = statusResult.error.message || String(statusResult.error);
            if (errorMsg.includes('column') && errorMsg.includes('analysis_status')) {
              // Column doesn't exist, just log the error
              console.warn("analysis_status column not found, skipping status update");
            } else {
              console.error("Failed to update analysis status:", statusResult.error);
            }
          }
        } catch (updateErr) {
          console.error("Failed to update analysis status:", updateErr);
        }
      }
    };
    
    // Use unstable_after if available, otherwise use IIFE fallback
    try {
      // Try to use unstable_after (Next.js 15+)
      const { unstable_after } = await import("next/server");
      if (unstable_after) {
        (unstable_after as any)(runAnalysis);
      } else {
        throw new Error("unstable_after not available");
      }
    } catch {
      // Fallback: run as IIFE (fire-and-forget) if unstable_after not available
      // ⚠️ WARNING: This is best-effort only and may not complete in serverless environments
      // The function may be terminated when the response is sent, especially on platforms
      // with strict execution timeouts or cold starts.
      console.warn("unstable_after not available, using IIFE fallback (best-effort only)");
      runAnalysis().catch((err) => {
        console.error("Background analysis error (IIFE fallback):", err);
      });
    }

    // Return success without URLs (they'll be generated on the detail page)
    return NextResponse.json(
      {
        success: true,
        cv: {
          id: cv.id,
          companyName: cv.company_name,
          jobTitle: cv.job_title,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Upload error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    return NextResponse.json(
      {
        error: "Internal server error",
        message: errorMessage,
        ...(process.env.NODE_ENV === "development" && { stack: errorStack }),
      },
      { status: 500 }
    );
  }
}

