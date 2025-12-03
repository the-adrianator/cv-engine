'use client';

import { useThemeStore } from "@/lib/stores/theme";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync theme changes to DOM
  useEffect(() => {
    if (mounted && typeof document !== 'undefined') {
      const html = document.documentElement;
      
      // CRITICAL: Remove dark class FIRST
      if (html.classList.contains('dark')) {
        html.classList.remove('dark');
        void html.offsetHeight; // Force reflow
      }
      
      html.classList.remove('light', 'dark');
      html.classList.add(theme);
      
      if (theme === 'dark') {
        html.classList.add('dark');
      }
      
      html.setAttribute('data-theme', theme);
      void html.offsetHeight; // Force reflow
    }
  }, [theme, mounted]);

  if (!mounted) {
    return (
      <div className="w-14 h-8 bg-gray-200 dark:bg-gray-700 rounded-full opacity-50">
        <div className="w-6 h-6 bg-white rounded-full mt-1 ml-1"></div>
      </div>
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative inline-flex items-center w-14 h-8 rounded-full transition-all duration-300 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        focus:ring-offset-white dark:focus:ring-offset-gray-900
        ${
          isDark
            ? "bg-blue-600 hover:bg-blue-700"
            : "bg-gray-300 hover:bg-gray-400"
        }
      `}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      aria-pressed={isDark}
      role="switch"
    >
      <span className="sr-only">
        {isDark ? "Switch to light mode" : "Switch to dark mode"}
      </span>

      {/* Toggle circle */}
      <span
        className={`
          inline-flex items-center justify-center w-6 h-6 rounded-full bg-white shadow-lg
          transform transition-all duration-300 ease-in-out
          ${isDark ? "translate-x-7" : "translate-x-1"}
        `}
      >
        {/* Sun icon for light mode */}
        <svg
          className={`w-3 h-3 text-yellow-500 transition-all duration-300 ${
            isDark ? "opacity-0 scale-0" : "opacity-100 scale-100"
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
            clipRule="evenodd"
          />
        </svg>

        {/* Moon icon for dark mode */}
        <svg
          className={`w-3 h-3 text-blue-900 absolute transition-all duration-300 ${
            isDark ? "opacity-100 scale-100" : "opacity-0 scale-0"
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      </span>
    </button>
  );
}

export function ThemeToggleCompact() {
  const { theme, toggleTheme } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync theme changes to DOM
  useEffect(() => {
    if (mounted && typeof document !== 'undefined') {
      const html = document.documentElement;
      
      // CRITICAL: Remove dark class FIRST
      if (html.classList.contains('dark')) {
        html.classList.remove('dark');
        void html.offsetHeight; // Force reflow
      }
      
      html.classList.remove('light', 'dark');
      html.classList.add(theme);
      
      if (theme === 'dark') {
        html.classList.add('dark');
      }
      
      html.setAttribute('data-theme', theme);
      void html.offsetHeight; // Force reflow
    }
  }, [theme, mounted]);

  if (!mounted) {
    return (
      <button className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 opacity-50">
        <div className="w-5 h-5"></div>
      </button>
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      className={`
        p-2 rounded-lg transition-all duration-300 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer
        focus:ring-offset-white dark:focus:ring-offset-gray-900
        ${
          isDark
            ? "bg-gray-800 hover:bg-gray-700 text-yellow-400"
            : "bg-gray-100 hover:bg-gray-200 text-gray-600"
        }
      `}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      {isDark ? (
        <svg
          className="w-5 h-5 transition-transform duration-300 hover:scale-110"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ) : (
        <svg
          className="w-5 h-5 transition-transform duration-300 hover:scale-110"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      )}
    </button>
  );
}

