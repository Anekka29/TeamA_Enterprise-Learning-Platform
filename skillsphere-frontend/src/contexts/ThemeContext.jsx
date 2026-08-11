import { createContext, useState, useEffect, useCallback } from 'react';

export const ThemeContext = createContext(null);

const STORAGE_KEY = 'skillsphere-theme-mode';

export function ThemeProvider({ children }) {
  const [themeMode, setThemeModeState] = useState(() => {
    const savedMode = localStorage.getItem(STORAGE_KEY);
    if (savedMode === 'light' || savedMode === 'dark') {
      return savedMode;
    }
    return 'light';
  });

  const [resolvedTheme, setResolvedTheme] = useState(themeMode);

  // Keep resolvedTheme synced with themeMode
  useEffect(() => {
    const activeTheme = themeMode === 'dark' ? 'dark' : 'light';
    setResolvedTheme(activeTheme);
  }, [themeMode]);

  // Apply data-theme and dark-mode class to html & body
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', resolvedTheme);
    root.setAttribute('data-bs-theme', resolvedTheme);

    if (resolvedTheme === 'dark') {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [resolvedTheme]);

  const setThemeMode = useCallback((newMode) => {
    const validMode = newMode === 'dark' ? 'dark' : 'light';
    setThemeModeState(validMode);
    localStorage.setItem(STORAGE_KEY, validMode);
  }, []);

  // Strict toggle between Light & Dark modes
  const toggleTheme = useCallback(() => {
    setThemeModeState((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  const isDark = resolvedTheme === 'dark';

  return (
    <ThemeContext.Provider
      value={{
        theme: resolvedTheme,
        themeMode,
        isDark,
        toggleTheme,
        setThemeMode,
        setTheme: setThemeMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
