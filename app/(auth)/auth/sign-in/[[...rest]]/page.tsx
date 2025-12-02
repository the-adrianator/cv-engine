import { SignIn } from "@clerk/nextjs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In - CV Engine",
  description: "Sign in to your CV Engine account",
};

export default function SignInPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome to CV Engine
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Sign in to continue your employment journey
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
          <SignIn
            path="/auth/sign-in"
            routing="path"
            signUpUrl="/auth/sign-up"
            afterSignInUrl="/"
            appearance={{
              elements: {
                rootBox: "mx-auto",
                card: "shadow-none",
              },
            }}
          />
        </div>
      </div>
    </main>
  );
}

