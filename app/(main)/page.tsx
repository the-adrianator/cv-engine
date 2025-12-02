import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function HomePage() {
  const { userId } = await auth();

  // If not authenticated, redirect to sign-in
  if (!userId) {
    redirect("/auth/sign-in?redirect_url=/");
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to CV Engine
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Track Your Applications & CV Ratings
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              No CVs found. Upload your first CV to get started.
            </p>
            <Link
              href="/upload"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Upload CV
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

