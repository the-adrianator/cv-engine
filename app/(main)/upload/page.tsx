"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import FileUploader from "@/components/cv/FileUploader";
import { convertPdfToImage, convertPdfToImages } from "@/lib/pdf2img";

export default function UploadPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (selectedFile: File | null) => {
    setFile(selectedFile);
    setError(null);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!isLoaded || !user) {
      setError("Please sign in to upload a CV");
      return;
    }

    const form = e.currentTarget;
    const formData = new FormData(form);

    const companyName = formData.get("company-name") as string;
    const jobTitle = formData.get("job-title") as string;
    const jobDescription = formData.get("job-description") as string;

    // Validate inputs
    if (!companyName || !jobTitle || !jobDescription || !file) {
      setError("Please fill in all fields and upload a CV");
      return;
    }

    setIsProcessing(true);
    setStatusText("Converting your CV to images...");

    try {
      // Convert PDF to images (all pages)
      const conversionResult = await convertPdfToImages(file);

      if (!conversionResult.images.length || conversionResult.error) {
        setError(conversionResult.error || "Failed to convert PDF to images");
        setIsProcessing(false);
        return;
      }

      setStatusText("Uploading your CV...");

      // Prepare form data for API
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);
      // Append all image blobs
      conversionResult.images.forEach((img, index) => {
        uploadFormData.append(`imageBlob-${index}`, img.file);
      });
      uploadFormData.append(
        "totalPages",
        conversionResult.totalPages.toString()
      );
      uploadFormData.append("companyName", companyName);
      uploadFormData.append("jobTitle", jobTitle);
      uploadFormData.append("jobDescription", jobDescription);

      // Upload to API
      const response = await fetch("/api/cvs/upload", {
        method: "POST",
        body: uploadFormData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMsg = errorData.error || "Failed to upload CV";
        const details = errorData.details || errorData.message;
        setError(details ? `${errorMsg}: ${details}` : errorMsg);
        console.error("Upload error:", errorData);
        setIsProcessing(false);
        return;
      }

      const data = await response.json();

      setStatusText("CV uploaded successfully! Redirecting...");

      // Redirect to CV detail page (will be created in next task)
      // For now, redirect to home
      setTimeout(() => {
        router.push(`/cv/${data.cv.id}`);
      }, 1000);
    } catch (err) {
      console.error("Upload error:", err);
      setError(
        err instanceof Error ? err.message : "An error occurred during upload"
      );
      setIsProcessing(false);
    }
  };

  if (!isLoaded) {
    return (
      <main className="min-h-screen p-8 bg-gradient-to-b from-blue-50 to-pink-50 dark:from-gray-900 dark:to-purple-900">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">Loading...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8 bg-gradient-to-b from-blue-50 to-pink-50 dark:from-gray-900 dark:to-purple-900">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Smart Feedback for Your CV
          </h1>
          {isProcessing ? (
            <>
              <h2 className="text-xl text-gray-600 dark:text-gray-400 mb-4">
                {statusText}
              </h2>
              <div className="flex justify-center">
                <img
                  src="/images/resume-scan.gif"
                  alt="Processing"
                  className="w-full max-w-md"
                />
              </div>
            </>
          ) : (
            <h2 className="text-xl text-gray-600 dark:text-gray-400">
              Upload your CV for an ATS score and improvement tips
            </h2>
          )}
        </div>

        {!isProcessing && (
          <form
            onSubmit={handleSubmit}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700 space-y-6 w-full"
          >
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}

            <div className="space-y-2 w-full">
              <label
                htmlFor="company-name"
                className="block text-sm font-medium text-gray-900 dark:text-white"
              >
                Company name
              </label>
              <input
                type="text"
                id="company-name"
                name="company-name"
                placeholder="Enter company name"
                required
                className="w-full p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600"
              />
            </div>

            <div className="space-y-2 w-full">
              <label
                htmlFor="job-title"
                className="block text-sm font-medium text-gray-900 dark:text-white"
              >
                Job title
              </label>
              <input
                type="text"
                id="job-title"
                name="job-title"
                placeholder="Enter job title"
                required
                className="w-full p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600"
              />
            </div>

            <div className="space-y-2 w-full">
              <label
                htmlFor="job-description"
                className="block text-sm font-medium text-gray-900 dark:text-white"
              >
                Job description
              </label>
              <textarea
                rows={5}
                id="job-description"
                name="job-description"
                placeholder="Enter job description"
                required
                className="w-full p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 resize-none"
              />
            </div>

            <div className="space-y-2 w-full">
              <label
                htmlFor="uploader"
                className="block text-sm font-medium text-gray-900 dark:text-white"
              >
                Upload your CV
              </label>
              <FileUploader onFileSelect={handleFileSelect} />
            </div>

            <button
              type="submit"
              disabled={!file || isProcessing}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg transition-colors"
            >
              {isProcessing ? "Processing..." : "Upload CV"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
