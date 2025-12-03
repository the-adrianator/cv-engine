/**
 * Theme initialization script
 * This prevents flash of wrong theme on page load
 * Must be inline in the head to run before React hydration
 */
export function ThemeScript() {
  const code = `
    (function() {
      try {
        const theme = localStorage.getItem('theme-storage');
        if (theme) {
          const parsed = JSON.parse(theme);
          const storedTheme = parsed?.state?.theme || 'light';
          const html = document.documentElement;
          html.classList.remove('light', 'dark');
          html.classList.add(storedTheme);
          if (storedTheme === 'dark') {
            html.classList.add('dark');
          }
        } else {
          // Check system preference
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          const html = document.documentElement;
          html.classList.remove('light', 'dark');
          if (prefersDark) {
            html.classList.add('dark');
            html.classList.add('dark');
          } else {
            html.classList.add('light');
          }
        }
      } catch (e) {
        // Fallback to light theme
        document.documentElement.classList.add('light');
      }
    })();
  `;
  
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}

