import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getCV } from "@/lib/supabase/db";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getCV } from "@/lib/supabase/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const { cv, error } = await getCV(id, userId);

    if (error || !cv) {
      return NextResponse.json(
        { error: error?.message || "CV not found" },
        { status: 404 }
      );
    }

    // Get signed URLs for files (bucket is private)
    const { getSignedUrl } = await import("@/lib/supabase/storage");
    
    // Parse image paths (can be a single string or JSON array for multi-page)
    let imagePaths: string[] = [];
    try {
      const parsed = JSON.parse(cv.image_path);
      imagePaths = Array.isArray(parsed) ? parsed : [cv.image_path];
    } catch {
      // If not JSON, treat as single image path
      imagePaths = [cv.image_path];
    }
    
    // Generate signed URLs for all images
    const imageUrls: string[] = [];
    for (const path of imagePaths) {
      const { url, error } = await getSignedUrl(path, 3600);
      if (error) {
        console.error(`Error generating signed URL for ${path}:`, error);
      }
      imageUrls.push(url || "");
    }
    
    // Generate signed URL for PDF
    const { url: pdfUrl, error: pdfError } = await getSignedUrl(cv.pdf_path, 3600);
    if (pdfError) {
      console.error("Error generating signed URL for PDF:", pdfError);
    }

    return NextResponse.json({
      cv: {
        ...cv,
        imageUrl: imageUrls[0] || "",
        imagePaths: imageUrls,
        pdfUrl: pdfUrl || "",
      },
    });
  } catch (error) {
    console.error("Error fetching CV:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

