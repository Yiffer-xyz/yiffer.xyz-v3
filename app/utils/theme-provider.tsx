import { useFetcher } from '@remix-run/react';
import {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  Dispatch,
  SetStateAction,
} from 'react';

const themes = {
  light: 'light',
  dark: 'dark',
};

const prefersDarkMQ = '(prefers-color-scheme: dark)';

function getPreferredTheme() {
  return window.matchMedia(prefersDarkMQ).matches ? themes.dark : themes.light;
}

interface IThemeContext {
  theme: string | null;
  setTheme: Dispatch<SetStateAction<string | null>>;
}

const ThemeContext = createContext<IThemeContext>({
  theme: null,
  setTheme: () => {},
});

type ThemeProviderProps = {
  specifiedTheme?: string;
  children: React.ReactNode;
};

function ThemeProvider({ specifiedTheme, children }: ThemeProviderProps) {
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
    if (!mountRun.current) {
      mountRun.current = true;
      return;
    }
    if (!theme) {
      return;
    }

    persistThemeRef.current.submit({ theme }, { action: 'action/set-theme', method: 'post' });
  }, [theme]);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

function useTheme(): [string | null, Dispatch<SetStateAction<string | null>>] {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return [context.theme, context.setTheme];
}

function isTheme(theme: string | null) {
  return theme !== null && Object.values(themes).includes(theme);
}

const clientThemeCode = `
  ;(() => {
    const theme = window.matchMedia(${JSON.stringify(prefersDarkMQ)}).matches
      ? 'dark'
      : 'light';
    const cl = document.documentElement.classList;
    const themeAlreadyApplied = cl.contains('light') || cl.contains('dark');
    if (themeAlreadyApplied) {
      // this script shouldn't exist if the theme is already applied!
      console.warn(
        "Theme bug",
      );
    } else {
      cl.add(theme);
    }
  })();
`;

function NonFlashOfWrongThemeEls({ ssrTheme }: { ssrTheme: boolean }) {
  return <>{ssrTheme ? null : <script dangerouslySetInnerHTML={{ __html: clientThemeCode }} />}</>;
}

export { ThemeProvider, useTheme, isTheme, NonFlashOfWrongThemeEls };
