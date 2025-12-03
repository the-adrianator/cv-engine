'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  initTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      
      setTheme: (theme: Theme) => {
        set({ theme });
        // Apply theme to document root immediately
        if (typeof document !== 'undefined') {
          const html = document.documentElement;
          
          // CRITICAL: Remove dark class FIRST before doing anything else
          // This ensures Tailwind's dark: classes stop applying
          if (html.classList.contains('dark')) {
            html.classList.remove('dark');
            // Force a reflow to ensure removal takes effect
            void html.offsetHeight;
          }
          
          // Remove all theme classes
          html.classList.remove('light', 'dark');
          
          // Add the theme class
          html.classList.add(theme);
          
          // For Tailwind dark mode, add 'dark' class ONLY when theme is dark
          if (theme === 'dark') {
            html.classList.add('dark');
          }
          
          html.setAttribute('data-theme', theme);
          
          // Force reflow to ensure styles apply
          void html.offsetHeight;
        }
      },
      
      toggleTheme: () => {
        const currentTheme = get().theme;
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        get().setTheme(newTheme);
      },
      
      initTheme: () => {
        if (typeof window === 'undefined') return;
        
        const { theme } = get();
        
        // Check for system preference if no stored theme
        const stored = localStorage.getItem('theme-storage');
        if (!stored) {
          const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          const initialTheme = systemPrefersDark ? 'dark' : 'light';
          get().setTheme(initialTheme);
          return;
        }
        
        // Apply stored theme immediately
        get().setTheme(theme);
      },
    }),
    {
      name: 'theme-storage',
    }
  )
);
