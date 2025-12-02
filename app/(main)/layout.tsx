'use client';

import { ReactNode, useEffect } from "react";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { ThemeToggleCompact } from "@/components/layout/ThemeToggle";
import { useThemeStore } from "@/lib/stores/theme";

export default function MainLayout({ children }: { children: ReactNode }) {
  const { initTheme, theme } = useThemeStore();

  useEffect(() => {
    // Initialize theme on mount
    initTheme();
  }, []); // Only run once on mount

  // Sync theme changes to document
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const html = document.documentElement;
      
      // CRITICAL: Remove dark class FIRST to stop Tailwind dark: classes
      if (html.classList.contains('dark')) {
        html.classList.remove('dark');
        void html.offsetHeight; // Force reflow
      }
      
      // Remove all theme classes
      html.classList.remove('light', 'dark');
      // Add the current theme
      html.classList.add(theme);
      // Only add 'dark' class if theme is dark
      if (theme === 'dark') {
        html.classList.add('dark');
      }
      html.setAttribute('data-theme', theme);
      
      // Force a reflow to ensure CSS updates
      void html.offsetHeight;
    }
  }, [theme]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navbar */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                CV Engine
              </span>
            </Link>
            
            <div className="flex items-center gap-4">
              <ThemeToggleCompact />
              <Link
                href="/upload"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
              >
                Upload CV
              </Link>
              <UserButton 
                afterSignOutUrl="/auth/sign-in"
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10",
                  },
                }}
              />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
}
