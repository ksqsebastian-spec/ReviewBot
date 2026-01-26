'use client';

import { useState, useEffect, useCallback } from 'react';

/*
  useTheme Hook

  Manages dark/light theme with:
  - System preference detection (prefers-color-scheme)
  - User preference persistence (localStorage)
  - SSR-safe implementation (no hydration mismatch)

  PRIORITY ORDER:
  1. User's saved preference (localStorage)
  2. System preference (prefers-color-scheme)
  3. Default to light mode

  USAGE:
  const { theme, toggleTheme, setTheme } = useTheme();
*/

const STORAGE_KEY = 'theme-preference';

export default function useTheme() {
  // Start with null to prevent hydration mismatch
  const [theme, setThemeState] = useState(null);
  const [mounted, setMounted] = useState(false);

  // Initialize theme on mount (client-side only)
  useEffect(() => {
    setMounted(true);

    // Check localStorage first
    const savedTheme = localStorage.getItem(STORAGE_KEY);
    if (savedTheme === 'dark' || savedTheme === 'light') {
      setThemeState(savedTheme);
      return;
    }

    // Fall back to system preference
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setThemeState(systemPrefersDark ? 'dark' : 'light');
  }, []);

  // Apply theme class to document
  useEffect(() => {
    if (!mounted || !theme) return;

    const root = document.documentElement;

    // Add transition class for smooth theme change
    root.classList.add('theme-transition');

    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Remove transition class after animation completes
    const timeout = setTimeout(() => {
      root.classList.remove('theme-transition');
    }, 200);

    return () => clearTimeout(timeout);
  }, [theme, mounted]);

  // Listen for system preference changes
  useEffect(() => {
    if (!mounted) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e) => {
      // Only update if user hasn't set a preference
      const savedTheme = localStorage.getItem(STORAGE_KEY);
      if (!savedTheme) {
        setThemeState(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [mounted]);

  // Set theme and persist to localStorage
  const setTheme = useCallback((newTheme) => {
    if (newTheme !== 'dark' && newTheme !== 'light') return;
    setThemeState(newTheme);
    localStorage.setItem(STORAGE_KEY, newTheme);
  }, []);

  // Toggle between dark and light
  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  }, [theme, setTheme]);

  // Clear user preference and use system setting
  const useSystemTheme = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setThemeState(systemPrefersDark ? 'dark' : 'light');
  }, []);

  return {
    theme,
    mounted,
    isDark: theme === 'dark',
    isLight: theme === 'light',
    setTheme,
    toggleTheme,
    useSystemTheme,
  };
}
