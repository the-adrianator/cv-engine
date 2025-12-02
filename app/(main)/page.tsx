import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import CVCard from "@/components/cv/CVCard";
import { getUserCVs, getOrCreateUser } from "@/lib/supabase/db";
import { createServerClient } from "@/lib/supabase/server";

// Mock data for testing components
const mockResumes: Resume[] = [
  {
    id: "1",
    companyName: "Google",
    jobTitle: "Frontend Developer",
    imagePath: "/images/resume_01.png",
    resumePath: "/resumes/resume-1.pdf",
    feedback: {
      overallScore: 85,
      ATS: {
        score: 90,
        tips: [
          { type: "good", tip: "Well-structured format" },
          { type: "good", tip: "Keywords optimized" },
        ],
      },
      toneAndStyle: {
        score: 90,
        tips: [
          {
            type: "good",
            tip: "Professional tone",
            explanation:
              "Your CV maintains a professional and confident tone throughout.",
          },
        ],
      },
      content: {
        score: 90,
        tips: [
          {
            type: "good",
            tip: "Clear achievements",
            explanation: "Your achievements are well-quantified and impactful.",
          },
        ],
      },
      structure: {
        score: 90,
        tips: [
          {
            type: "good",
            tip: "Logical flow",
            explanation: "The structure follows a logical progression.",
          },
        ],
      },
      skills: {
        score: 90,
        tips: [
          {
            type: "good",
            tip: "Relevant skills",
            explanation: "Your skills are highly relevant to the role.",
          },
        ],
      },
    },
  },
  {
    id: "2",
    companyName: "Microsoft",
    jobTitle: "Cloud Engineer",
    imagePath: "/images/resume_02.png",
    resumePath: "/resumes/resume-2.pdf",
    feedback: {
      overallScore: 55,
      ATS: {
        score: 45,
        tips: [
          { type: "improve", tip: "Missing keywords" },
          { type: "improve", tip: "Format issues" },
        ],
      },
      toneAndStyle: {
        score: 60,
        tips: [
          {
            type: "improve",
            tip: "Inconsistent tone",
            explanation: "The tone varies throughout the document.",
          },
        ],
      },
      content: {
        score: 50,
        tips: [
          {
            type: "improve",
            tip: "Vague descriptions",
            explanation: "Some descriptions lack specific details.",
          },
        ],
      },
      structure: {
        score: 60,
        tips: [
          {
            type: "improve",
            tip: "Section ordering",
            explanation: "Consider reordering sections for better flow.",
          },
        ],
      },
      skills: {
        score: 55,
        tips: [
          {
            type: "improve",
            tip: "Skill gaps",
            explanation: "Some relevant skills are missing.",
          },
        ],
      },
    },
  },
];

export default async function HomePage() {
  const { userId } = await auth();

  // If not authenticated, redirect to sign-in
  if (!userId) {
    redirect("/auth/sign-in?redirect_url=/");
  }

  // Get or create user
  const user = await currentUser();
  if (!user) {
    redirect("/auth/sign-in?redirect_url=/");
  }

  const { user: dbUser, error: userError } = await getOrCreateUser(
    userId,
    user.emailAddresses[0]?.emailAddress || "",
    user.fullName || undefined
  );

  if (userError) {
    console.error("Error getting/creating user:", userError);
  }

  // Fetch CVs from Supabase
  const { cvs: dbCVs, error: cvsError } = await getUserCVs(userId);

  if (cvsError) {
    console.error("Error fetching CVs:", cvsError);
  }

  // Convert database CVs to Resume format
  // Note: For the home page, we'll use a placeholder or generate signed URLs
  // For better performance, we could cache thumbnails or use a different approach
  const { getSignedUrl } = await import("@/lib/supabase/storage");

  const cvs: Resume[] = await Promise.all(
    (dbCVs || []).map(async (cv) => {
      // Parse image paths (can be a single string or JSON array for multi-page)
      let imagePaths: string[] = [];
      try {
        const parsed = JSON.parse(cv.image_path);
        imagePaths = Array.isArray(parsed) ? parsed : [cv.image_path];
      } catch {
        // If not JSON, treat as single image path
        imagePaths = [cv.image_path];
      }
      
      // Get signed URL for first image (for thumbnail on home page)
      const { url: imageUrl, error: imageError } = await getSignedUrl(
        imagePaths[0],
        3600
      );

      if (imageError) {
        console.error(
          `Error generating signed URL for CV ${cv.id}:`,
          imageError
        );
      }

      // Default feedback structure if not available
      const defaultFeedback: Feedback = {
        overallScore: 0,
        ATS: { score: 0, tips: [] },
        toneAndStyle: { score: 0, tips: [] },
        content: { score: 0, tips: [] },
        structure: { score: 0, tips: [] },
        skills: { score: 0, tips: [] },
      };

      return {
        id: cv.id,
        companyName: cv.company_name || undefined,
        jobTitle: cv.job_title || undefined,
        imagePath: imageUrl || "", // Use signed URL
        resumePath: cv.pdf_path, // Will be converted to signed URL on detail page
        feedback: (cv.feedback as unknown as Feedback) || defaultFeedback,
      };
    })
  );

  return (
    <main className="min-h-screen p-8 bg-gradient-to-b from-blue-50 to-pink-50 dark:from-gray-900 dark:to-purple-900">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to CV Engine
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Track Your Applications & CV Ratings
          </p>
        </div>

        {cvs.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                No CVs found. Upload your first CV to get started.
              </p>
              <div className="flex gap-4 justify-center">
                <Link
                  href="/upload"
                  className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
                >
                  Upload CV
                </Link>
                <Link
                  href="/test-components"
                  className="inline-block bg-gray-600 hover:bg-gray-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
                >
                  Test Components
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-6 justify-center">
            {cvs.map((resume) => (
              <CVCard key={resume.id} resume={resume} />
            ))}
          </div>
        )}

        {/* Component Test Section - Remove after testing */}
        <div className="mt-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Component Test Area
          </h2>
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                CV Cards (Mock Data)
              </h3>
              <div className="flex flex-wrap gap-6 justify-center">
                {mockResumes.map((resume) => (
                  <CVCard key={resume.id} resume={resume} />
                ))}
              </div>
            </div>
            <div className="text-center pt-4">
              <Link
                href="/test-components"
                className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
              >
                View Full Component Test Page →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
