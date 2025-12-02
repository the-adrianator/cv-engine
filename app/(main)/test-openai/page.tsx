"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";

export default function TestOpenAIPage() {
  const { user, isLoaded } = useUser();
  const [isTesting, setIsTesting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState("");

  const testAnalysis = async () => {
    if (!isLoaded || !user) {
      setError("Please sign in to test OpenAI integration");
      return;
    }

    setIsTesting(true);
    setError(null);
    setResult(null);

    try {
      // Note: OpenAI Vision API requires a publicly accessible URL
      // The image URL must be from Supabase Storage or another public source
      if (!imageUrl) {
        setError(
          "Please enter a publicly accessible image URL (e.g., from Supabase Storage after uploading a CV)"
        );
        setIsTesting(false);
        return;
      }

      const response = await fetch("/api/cvs/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cvId: "test-cv-id", // This won't actually update a CV, just test the analysis
          imageUrl: imageUrl,
          jobTitle: "Software Engineer",
          jobDescription:
            "We are looking for a skilled software engineer with experience in React, TypeScript, and Node.js. The ideal candidate should have strong problem-solving skills and experience with modern web development practices.",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to analyze CV");
        return;
      }

      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An error occurred during testing"
      );
    } finally {
      setIsTesting(false);
    }
  };

  if (!isLoaded) {
    return (
      <main className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">Loading...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8 bg-linear-to-b from-blue-50 to-pink-50 dark:from-gray-900 dark:to-purple-900">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            OpenAI Integration Test
          </h1>

          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Test Configuration
              </h2>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Status:</strong>{" "}
                  {process.env.NEXT_PUBLIC_OPENAI_API_KEY
                    ? "✅ API Key configured (client-side check)"
                    : "⚠️ API Key check unavailable (server-side only)"}
                </p>
                <div>
                  <label
                    htmlFor="image-url"
                    className="block text-sm font-medium text-gray-900 dark:text-white mb-2"
                  >
                    Image URL (Publicly Accessible)
                  </label>
                  <input
                    type="text"
                    id="image-url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://your-supabase-url.supabase.co/storage/v1/object/public/cvs/..."
                    className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Upload a CV first, then copy its image URL from Supabase
                    Storage
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={testAnalysis}
              disabled={isTesting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg transition-colors"
            >
              {isTesting ? "Testing..." : "Test OpenAI Analysis"}
            </button>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
                  Error
                </h3>
                <p className="text-red-700 dark:text-red-300">{error}</p>
              </div>
            )}

            {result && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-4">
                  ✅ Analysis Successful!
                </h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Overall Score: {result.feedback?.overallScore || "N/A"}
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          ATS Score
                        </p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          {result.feedback?.ATS?.score || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Tone & Style
                        </p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          {result.feedback?.toneAndStyle?.score || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Content
                        </p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          {result.feedback?.content?.score || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Structure
                        </p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          {result.feedback?.structure?.score || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                      View Full Response (JSON)
                    </summary>
                    <pre className="mt-2 p-4 bg-gray-100 dark:bg-gray-900 rounded text-xs overflow-auto max-h-96">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </details>
                </div>
              </div>
            )}

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
                Testing Instructions
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-blue-700 dark:text-blue-300">
                <li>Ensure OPENAI_API_KEY is set in your .env.local file</li>
                <li>Make sure NEXT_PUBLIC_APP_URL is configured</li>
                <li>Click "Test OpenAI Analysis" button above</li>
                <li>Check the results - you should see scores and feedback</li>
                <li>
                  For a real test, upload a CV through the upload page first
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
