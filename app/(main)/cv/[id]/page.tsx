import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getCV } from "@/lib/supabase/db";
import { createServerClient } from "@/lib/supabase/server";
import CVDetailView from "@/components/cv/CVDetailView";

// Define Feedback type locally
interface Feedback {
  overallScore: number;
  ATS: {
    score: number;
    tips: { type: "good" | "improve"; tip: string }[];
  };
  toneAndStyle: {
    score: number;
    tips: { type: "good" | "improve"; tip: string; explanation: string }[];
  };
  content: {
    score: number;
    tips: { type: "good" | "improve"; tip: string; explanation: string }[];
  };
  structure: {
    score: number;
    tips: { type: "good" | "improve"; tip: string; explanation: string }[];
  };
  skills: {
    score: number;
    tips: { type: "good" | "improve"; tip: string; explanation: string }[];
  };
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CVDetailPage({ params }: PageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/auth/sign-in?redirect_url=/");
  }

  const { id } = await params;
  const { cv, error } = await getCV(id, userId);

  if (error || !cv) {
    return (
      <main className="min-h-screen p-8 bg-gradient-to-b from-blue-50 to-pink-50 dark:from-gray-900 dark:to-purple-900">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              CV Not Found
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {error?.message ||
                "The CV you're looking for doesn't exist or you don't have permission to view it."}
            </p>
            <a
              href="/"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Back to Home
            </a>
          </div>
        </div>
      </main>
    );
  }

  // Get signed URLs for files (bucket is private, so we need signed URLs)
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
  
  // Generate signed URLs for all images (valid for 1 hour)
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

  // Convert database CV to Resume format
  const resume = {
    id: cv.id,
    companyName: cv.company_name || undefined,
    jobTitle: cv.job_title || undefined,
    imagePath: imageUrls[0] || "", // First image for backward compatibility
    imagePaths: imageUrls, // All images for multi-page support
    resumePath: pdfUrl || "", // Use signed URL
    feedback: (cv.feedback as unknown as Feedback) || {
      overallScore: 0,
      ATS: { score: 0, tips: [] },
      toneAndStyle: { score: 0, tips: [] },
      content: { score: 0, tips: [] },
      structure: { score: 0, tips: [] },
      skills: { score: 0, tips: [] },
    },
  };

  return <CVDetailView resume={resume} />;
}
