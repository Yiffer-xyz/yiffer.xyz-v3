import { useFetcher } from '@remix-run/react';
import { createContext, useContext, useState, useRef, useEffect } from 'react';

const themes = {
  light: 'light',
  dark: 'dark',
};

const prefersDarkMQ = '(prefers-color-scheme: dark)';

function getPreferredTheme() {
  return window.matchMedia(prefersDarkMQ).matches ? themes.dark : themes.light;
}

const ThemeContext = createContext(undefined);

function ThemeProvider({ specifiedTheme, children }) {
  const [theme, setTheme] = useState(() => {
    if (specifiedTheme) {
      if (isTheme(specifiedTheme)) {
        return specifiedTheme;
      }
      return null;
    }
    if (typeof window !== 'object') {
      return null;
    }
    return getPreferredTheme();
  });

  const persistTheme = useFetcher();
  // TODO: remove this when persistTheme is memoized properly
  const persistThemeRef = useRef(persistTheme);
  useEffect(() => {
    persistThemeRef.current = persistTheme;
  }, [persistTheme]);

  const mountRun = useRef(false);

  useEffect(() => {
    console.log('effect run', theme);

    if (!mountRun.current) {
      mountRun.current = true;
      return;
    }
    if (!theme) {
      return;
    }

    persistThemeRef.current.submit({ theme }, { action: 'action/set-theme', method: 'post' });
  }, [theme]);

  return <ThemeContext.Provider value={[theme, setTheme]}>{children}</ThemeContext.Provider>;
}

function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
}

function isTheme(themeStr) {
  return true;
  // return Object.values(themes).includes(themeStr);
}

export { ThemeProvider, useTheme, isTheme };
