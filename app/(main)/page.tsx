import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import CVCard from "@/components/cv/CVCard";

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
          { type: "good", tip: "Professional tone", explanation: "Your CV maintains a professional and confident tone throughout." },
        ],
      },
      content: {
        score: 90,
        tips: [
          { type: "good", tip: "Clear achievements", explanation: "Your achievements are well-quantified and impactful." },
        ],
      },
      structure: {
        score: 90,
        tips: [
          { type: "good", tip: "Logical flow", explanation: "The structure follows a logical progression." },
        ],
      },
      skills: {
        score: 90,
        tips: [
          { type: "good", tip: "Relevant skills", explanation: "Your skills are highly relevant to the role." },
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
          { type: "improve", tip: "Inconsistent tone", explanation: "The tone varies throughout the document." },
        ],
      },
      content: {
        score: 50,
        tips: [
          { type: "improve", tip: "Vague descriptions", explanation: "Some descriptions lack specific details." },
        ],
      },
      structure: {
        score: 60,
        tips: [
          { type: "improve", tip: "Section ordering", explanation: "Consider reordering sections for better flow." },
        ],
      },
      skills: {
        score: 55,
        tips: [
          { type: "improve", tip: "Skill gaps", explanation: "Some relevant skills are missing." },
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

  // TODO: Fetch CVs from Supabase
  // For now, using mock data for testing
  const cvs: Resume[] = [];

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
