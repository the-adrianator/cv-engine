/**
 * API Route: CV Analysis
 * 
 * Analyzes a CV using OpenAI Vision API
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { updateCV } from "@/lib/supabase/db";
import {
  analyzeCV,
  prepareInstructions,
  sanitizeJobInputs,
} from "@/lib/openai/analyze";
import type { Json } from "@/types/database";

export const maxDuration = 60; // 60 seconds max
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    console.log('CV Analysis API called');
    
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      console.error('Analysis failed: Unauthorized');
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { cvId, imageUrl, imagePath, jobTitle, jobDescription } = body;

    console.log('Analysis request:', {
      cvId,
      hasImageUrl: !!imageUrl,
      hasImagePath: !!imagePath,
      jobTitle,
      jobDescriptionLength: jobDescription?.length,
    });

    // Validate inputs - imageUrl or imagePath required
    if (!cvId || (!imageUrl && !imagePath) || !jobTitle || !jobDescription) {
      console.error('Analysis failed: Missing required fields', {
        cvId: !!cvId,
        imageUrl: !!imageUrl,
        imagePath: !!imagePath,
        jobTitle: !!jobTitle,
        jobDescription: !!jobDescription,
      });
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // If imageUrl not provided, generate signed URL from imagePath
    let finalImageUrl = imageUrl;
    if (!finalImageUrl && imagePath) {
      console.log('Generating signed URL from imagePath:', imagePath);
      const { getSignedUrl } = await import("@/lib/supabase/storage");
      const { url, error: urlError } = await getSignedUrl(imagePath, 3600);
      if (urlError || !url) {
        console.error("Error generating signed URL for analysis:", urlError);
        return NextResponse.json(
          { error: "Failed to generate image URL for analysis" },
          { status: 500 }
        );
      }
      finalImageUrl = url;
      console.log('Generated signed URL successfully');
    }
    
    if (!finalImageUrl) {
      console.error('Analysis failed: No image URL available');
      return NextResponse.json(
        { error: "No image URL available for analysis" },
        { status: 400 }
      );
    }

    // Sanitize user-provided job context before including in prompts
    const { jobTitle: safeJobTitle, jobDescription: safeJobDescription } =
      sanitizeJobInputs({ jobTitle, jobDescription });

    // Prepare analysis instructions with sanitized inputs
    const instructions = prepareInstructions({
      jobTitle: safeJobTitle,
      jobDescription: safeJobDescription,
    });
    
    console.log('Calling OpenAI with image URL:', finalImageUrl.substring(0, 100) + '...');

    // Analyze CV with OpenAI (using image URL)
    const { feedback, error: analysisError } = await analyzeCV(finalImageUrl, instructions);

    if (analysisError || !feedback) {
      console.error("OpenAI analysis error:", analysisError);
      return NextResponse.json(
        { error: analysisError || "Failed to analyze CV" },
        { status: 500 }
      );
    }
    
    console.log('OpenAI analysis successful, feedback received:', {
      overallScore: feedback.overallScore,
      hasATS: !!feedback.ATS,
    });

    // Update CV record with feedback
    // Convert Feedback to Json type for database storage
    const supabase = createServerClient();
    const feedbackJson: Json = JSON.parse(JSON.stringify(feedback));
    
    console.log('Updating CV record with feedback:', cvId);
    const { error: updateError } = await updateCV(cvId, userId, {
      feedback: feedbackJson,
    });

    if (updateError) {
      console.error("Database update error:", updateError);
      return NextResponse.json(
        { error: "Failed to save feedback" },
        { status: 500 }
      );
    }
    
    console.log('CV analysis complete and saved successfully:', cvId);

    return NextResponse.json(
      {
        success: true,
        feedback,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Analysis route error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

