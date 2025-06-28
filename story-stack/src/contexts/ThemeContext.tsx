import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  actualTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
}

export function ThemeProvider({ children, defaultTheme = 'system' }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    // Get theme from localStorage or use default
    const stored = localStorage.getItem('theme') as Theme;
    return stored || defaultTheme;
  });

  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const root = window.document.documentElement;

    // Prevent transitions on initial load
    if (!isInitialized) {
      root.classList.add('preload');
    }

    let resolvedTheme: 'light' | 'dark';

    if (theme === 'system') {
      // Check system preference
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      resolvedTheme = systemTheme;
    } else {
      resolvedTheme = theme;
    }

    // Batch DOM updates for better performance
    requestAnimationFrame(() => {
      // Remove existing theme classes and apply new one in a single operation
      root.className = root.className.replace(/\b(light|dark)\b/g, '');
      root.classList.add(resolvedTheme);

      setActualTheme(resolvedTheme);

      // Store in localStorage
      localStorage.setItem('theme', theme);

      // Enable transitions after initial load
      if (!isInitialized) {
        // Double RAF to ensure theme is fully applied
        requestAnimationFrame(() => {
          root.classList.remove('preload');
          setIsInitialized(true);
        });
      }
    });
  }, [theme, isInitialized]);

  // Listen for system theme changes when using system theme
  useEffect(() => {
    if (theme !== 'system' || !isInitialized) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = () => {
      const root = window.document.documentElement;
      const systemTheme = mediaQuery.matches ? 'dark' : 'light';

      // Batch DOM updates for smoother transitions
      requestAnimationFrame(() => {
        root.className = root.className.replace(/\b(light|dark)\b/g, '');
        root.classList.add(systemTheme);
        setActualTheme(systemTheme);
      });
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, isInitialized]);

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  const value: ThemeContextType = {
    theme,
    actualTheme,
    setTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
