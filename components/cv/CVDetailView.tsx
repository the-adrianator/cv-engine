"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Summary from "@/components/cv/Summary";
import ATS from "@/components/cv/ATS";
import Details from "@/components/cv/Details";

// Define types locally to avoid import issues
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

interface Resume {
  id: string;
  companyName?: string;
  jobTitle?: string;
  imagePath: string;
  imagePaths?: string[]; // For multi-page support
  resumePath: string;
  feedback: Feedback;
}

interface CVDetailViewProps {
  resume: Resume;
}

export default function CVDetailView({
  resume: initialResume,
}: CVDetailViewProps) {
  const router = useRouter();
  const [resume, setResume] = useState(initialResume);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  
  // Get all image paths (use imagePaths if available, otherwise fallback to single imagePath)
  const imagePaths = resume.imagePaths && resume.imagePaths.length > 0
    ? resume.imagePaths
    : resume.imagePath
    ? [resume.imagePath]
    : [];
  
  const totalPages = imagePaths.length;
  const currentImagePath = imagePaths[currentPage] || "";

  // Auto-refresh if analysis is not complete
  useEffect(() => {
    if (resume.feedback.overallScore === 0) {
      const interval = setInterval(async () => {
        try {
          const response = await fetch(`/api/cvs/${resume.id}`);
          if (response.ok) {
            const data = await response.json();
            if (
              data.cv &&
              data.cv.feedback &&
              data.cv.feedback.overallScore > 0
            ) {
              setResume((prev) => ({
                ...prev,
                feedback: data.cv.feedback,
                imagePaths: data.cv.imagePaths || prev.imagePaths,
              }));
              clearInterval(interval);
            }
          }
        } catch (error) {
          console.error("Error checking CV status:", error);
        }
      }, 5000); // Check every 5 seconds

      return () => clearInterval(interval);
    }
  }, [resume.id, resume.feedback.overallScore]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    router.refresh();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <main className="min-h-screen p-8 bg-gradient-to-b from-blue-50 to-pink-50 dark:from-gray-900 dark:to-purple-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mb-4"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to CVs
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            CV Analysis
          </h1>
          {resume.companyName && resume.jobTitle && (
            <p className="text-xl text-gray-600 dark:text-gray-400">
              {resume.jobTitle} at {resume.companyName}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* CV Image */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 mb-8 h-fit">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Your CV {totalPages > 1 && `(Page ${currentPage + 1} of ${totalPages})`}
            </h2>
            <div className="relative">
              {/* Navigation arrows */}
              {totalPages > 1 && (
                <>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
                    disabled={currentPage === 0}
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-700 rounded-full p-2 shadow-lg hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Previous page"
                  >
                    <svg
                      className="w-6 h-6 text-gray-700 dark:text-gray-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))}
                    disabled={currentPage === totalPages - 1}
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-700 rounded-full p-2 shadow-lg hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Next page"
                  >
                    <svg
                      className="w-6 h-6 text-gray-700 dark:text-gray-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </>
              )}
              
              <div className="flex justify-center">
                {currentImagePath ? (
                  <img
                    src={currentImagePath}
                    alt={`CV Preview - Page ${currentPage + 1}`}
                    className="max-w-full h-auto rounded-lg shadow-md"
                    onError={(e) => {
                      console.error("Image failed to load:", currentImagePath);
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = `
                        <div class="text-center p-8 text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                          <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p class="mb-2 font-medium">Image failed to load</p>
                          <p class="text-sm">Check console for details</p>
                        </div>
                      `;
                      }
                    }}
                  />
                ) : (
                  <div className="text-center p-8 text-gray-500 dark:text-gray-400">
                    <p>No image available</p>
                  </div>
                )}
              </div>
              
              {/* Page indicators */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  {imagePaths.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentPage(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentPage
                          ? "bg-blue-600 dark:bg-blue-400"
                          : "bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500"
                      }`}
                      aria-label={`Go to page ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
            {resume.resumePath && (
              <div className="mt-4 text-center">
                <a
                  href={resume.resumePath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Download PDF
                </a>
              </div>
            )}
          </div>

          {/* Analysis Results */}
          {resume.feedback.overallScore > 0 ? (
            <div className="space-y-8">
              <Summary feedback={resume.feedback} />
              <ATS
                score={resume.feedback.ATS.score}
                suggestions={resume.feedback.ATS.tips}
              />
              <Details feedback={resume.feedback} />
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
              <div className="text-center py-12">
                <div className="inline-block p-4 bg-blue-100 dark:bg-blue-900/20 rounded-full mb-4">
                  <svg
                    className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Analyzing Your CV
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Your CV is being analyzed by our AI. This usually takes 10-30
                  seconds.
                  <br />
                  The page will automatically refresh when analysis is complete.
                </p>
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="inline-block bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-lg transition-colors"
                >
                  {isRefreshing ? "Refreshing..." : "Refresh Page"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
