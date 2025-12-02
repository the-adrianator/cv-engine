'use client';

import { useEffect } from "react";
import { useThemeStore } from "@/lib/stores/theme";
import CVCard from "@/components/cv/CVCard";
import FileUploader from "@/components/cv/FileUploader";
import Summary from "@/components/cv/Summary";
import ATS from "@/components/cv/ATS";
import Details from "@/components/cv/Details";
import ScoreCircle from "@/components/cv/ScoreCircle";
import ScoreGauge from "@/components/cv/ScoreGauge";
import ScoreBadge from "@/components/cv/ScoreBadge";
import { ThemeToggle, ThemeToggleCompact } from "@/components/layout/ThemeToggle";

// Mock data for testing
const mockResume: Resume = {
  id: "test-1",
  companyName: "Test Company",
  jobTitle: "Software Engineer",
  imagePath: "/images/resume_01.png",
  resumePath: "/resumes/test.pdf",
  feedback: {
    overallScore: 75,
    ATS: {
      score: 80,
      tips: [
        { type: "good", tip: "Well-structured format" },
        { type: "good", tip: "Keywords optimized" },
        { type: "improve", tip: "Add more technical keywords" },
      ],
    },
    toneAndStyle: {
      score: 70,
      tips: [
        { type: "good", tip: "Professional tone", explanation: "Your CV maintains a professional and confident tone throughout." },
        { type: "improve", tip: "Vary sentence structure", explanation: "Consider using more varied sentence structures to improve readability." },
      ],
    },
    content: {
      score: 75,
      tips: [
        { type: "good", tip: "Clear achievements", explanation: "Your achievements are well-quantified and impactful." },
        { type: "improve", tip: "Add more metrics", explanation: "Include more specific numbers and metrics to quantify your impact." },
      ],
    },
    structure: {
      score: 80,
      tips: [
        { type: "good", tip: "Logical flow", explanation: "The structure follows a logical progression." },
        { type: "improve", tip: "Section spacing", explanation: "Consider adjusting spacing between sections for better readability." },
      ],
    },
    skills: {
      score: 70,
      tips: [
        { type: "good", tip: "Relevant skills", explanation: "Your skills are relevant to the role." },
        { type: "improve", tip: "Add certifications", explanation: "Consider adding relevant certifications to strengthen your profile." },
      ],
    },
  },
};

export default function TestComponentsPage() {
  const { initTheme } = useThemeStore();

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  return (
    <main className="min-h-screen p-8 bg-gradient-to-b from-blue-50 to-pink-50 dark:from-gray-900 dark:to-purple-900">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Component Test Page
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Testing all migrated components
          </p>
        </div>

        {/* Theme Toggle */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Theme Toggle
          </h2>
          <div className="flex gap-8 justify-center">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Full Toggle</p>
              <ThemeToggle />
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Compact Toggle</p>
              <ThemeToggleCompact />
            </div>
          </div>
        </div>

        {/* Score Components */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Score Components
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Score Circle</p>
              <ScoreCircle score={85} />
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Score Gauge</p>
              <ScoreGauge score={75} />
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Score Badge</p>
              <div className="flex flex-col gap-4 items-center">
                <ScoreBadge score={85} />
                <ScoreBadge score={65} />
                <ScoreBadge score={45} />
              </div>
            </div>
          </div>
        </div>

        {/* File Uploader */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            File Uploader
          </h2>
          <FileUploader onFileSelect={(file) => console.log('Selected file:', file?.name)} />
        </div>

        {/* CV Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            CV Card
          </h2>
          <div className="flex justify-center">
            <CVCard resume={mockResume} />
          </div>
        </div>

        {/* Summary Component */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Summary Component
          </h2>
          <Summary feedback={mockResume.feedback} />
        </div>

        {/* ATS Component */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            ATS Component
          </h2>
          <ATS
            score={mockResume.feedback.ATS.score}
            suggestions={mockResume.feedback.ATS.tips}
          />
        </div>

        {/* Details Component */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Details Component (Accordion)
          </h2>
          <Details feedback={mockResume.feedback} />
        </div>
      </div>
    </main>
  );
}

