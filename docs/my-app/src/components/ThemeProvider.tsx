'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

export type AppTheme = 'silver' | 'dark' | 'system';
export type ResolvedTheme = 'silver' | 'dark';

interface ThemeContextType {
  theme: AppTheme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: AppTheme) => void;
  isLoaded: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'silver',
  resolvedTheme: 'silver',
  setTheme: () => {},
  isLoaded: false,
});

export const useTheme = () => useContext(ThemeContext);

const STORAGE_KEY = 'quillhawk-theme';

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'silver';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'silver';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<AppTheme>('silver');
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('silver');
  const [isLoaded, setIsLoaded] = useState(false);

  // Apply theme to DOM
  const applyThemeToDOM = useCallback((currentTheme: AppTheme) => {
    if (typeof window === 'undefined') return;

    const resolved = currentTheme === 'system' ? getSystemTheme() : currentTheme;
    setResolvedTheme(resolved);

    const root = document.documentElement;
    root.setAttribute('data-theme', resolved);
    
    if (resolved === 'dark') {
      root.classList.add('dark');
      root.classList.remove('silver');
    } else {
      root.classList.remove('dark');
      root.classList.add('silver');
    }

    // Broadcast for components listening outside React context
    window.dispatchEvent(
      new CustomEvent('quillhawk-theme-change', {
        detail: { theme: currentTheme, resolvedTheme: resolved },
      })
    );
  }, []);

  // Initialize theme on client mount
  useEffect(() => {
    try {
      const savedTheme = (localStorage.getItem(STORAGE_KEY) || localStorage.getItem('theme')) as AppTheme | null;
      if (savedTheme && ['silver', 'dark', 'system'].includes(savedTheme)) {
        setThemeState(savedTheme);
        applyThemeToDOM(savedTheme);
      } else {
        // Default to silver
        setThemeState('silver');
        applyThemeToDOM('silver');
      }
    } catch (e) {
      applyThemeToDOM('silver');
    } finally {
      setIsLoaded(true);
    }
  }, [applyThemeToDOM]);

  // Listen for System color-scheme changes if 'system' is active
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = () => {
      if (theme === 'system') {
        applyThemeToDOM('system');
      }
    };

    mediaQuery.addEventListener('change', handleSystemChange);
    return () => mediaQuery.removeEventListener('change', handleSystemChange);
  }, [theme, applyThemeToDOM]);

  // Set Theme Handler
  const setTheme = useCallback(
    (newTheme: AppTheme) => {
      setThemeState(newTheme);
      try {
        localStorage.setItem(STORAGE_KEY, newTheme);
      } catch (e) {}
      applyThemeToDOM(newTheme);
    },
    [applyThemeToDOM]
  );

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, isLoaded }}>
      {children}
    </ThemeContext.Provider>
  );
}

export default ThemeProvider;
