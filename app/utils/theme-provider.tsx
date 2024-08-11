import { useFetcher } from '@remix-run/react';
import type { Dispatch, SetStateAction } from 'react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import type { PageDisplay, UIPreferences, ViewType } from '~/types/types';
import { isViewType } from '~/types/types';

const defaultUiPref: UIPreferences = {
  theme: 'light',
  viewMode: 'Standard',
  comicCardTags: false,
  comicPageDisplay: 'Fit width',
  comicPageReverseOrder: false,
};

interface UIPrefContextType {
  uiPref: UIPreferences;
  setUiPref: Dispatch<SetStateAction<UIPreferences>>;
}

const UIPrefContext = createContext<UIPrefContextType>({
  uiPref: defaultUiPref,
  setUiPref: () => undefined,
});

type UIPrefProviderProps = {
  specifiedUIPref: UIPreferences;
  children: React.ReactNode;
};

export function UIPrefProvider({ specifiedUIPref, children }: UIPrefProviderProps) {
  const [uiPref, setUiPref] = useState<UIPreferences>(() => {
    return specifiedUIPref;
  });

  const persistUIPref = useFetcher();
  // TODO: remove this when persistTheme is memoized properly (??)
  const persistUIPrefRef = useRef(persistUIPref);
  useEffect(() => {
    persistUIPrefRef.current = persistUIPref;
  }, [persistUIPref]);

  const mountRun = useRef(false);

  useEffect(() => {
    if (!mountRun.current) {
      mountRun.current = true;
      return;
    }
    if (!uiPref) {
      return;
    }

    persistUIPrefRef.current.submit(
      { uiPref: JSON.stringify(uiPref) },
      { action: 'api/set-theme', method: 'post' }
    );
  }, [uiPref]);

  return (
    <UIPrefContext.Provider value={{ uiPref, setUiPref }}>
      {children}
    </UIPrefContext.Provider>
  );
}

export function useUIPreferences() {
  const context = useContext(UIPrefContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  const setTheme = useCallback((newTheme: 'light' | 'dark') => {
    context.setUiPref(prev => ({ ...prev, theme: newTheme }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setViewMode = useCallback((newViewMode: ViewType) => {
    context.setUiPref(prev => ({ ...prev, viewMode: newViewMode }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setComicCardTags = useCallback((newComicCardTags: boolean) => {
    context.setUiPref(prev => ({ ...prev, comicCardTags: newComicCardTags }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setPageDisplayAndReverseOrder = useCallback(
    ({ newDisplay, isReversed }: { newDisplay?: PageDisplay; isReversed?: boolean }) => {
      context.setUiPref(prev => ({
        ...prev,
        comicPageDisplay: newDisplay ?? prev.comicPageDisplay,
        comicPageReverseOrder: isReversed ?? prev.comicPageReverseOrder,
      }));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return {
    theme: context.uiPref.theme,
    setTheme,
    viewMode: context.uiPref.viewMode,
    setViewMode,
    comicCardTags: context.uiPref.comicCardTags,
    setComicCardTags,
    comicPageDisplay: context.uiPref.comicPageDisplay,
    comicPageReverseOrder: context.uiPref.comicPageReverseOrder,
    setPageDisplayAndReverseOrder,
  };
}

export function parseUIPreferences(rawUIPref: string | null | undefined): UIPreferences {
  if (!rawUIPref) return defaultUiPref;

  const newUIPref = { ...defaultUiPref };
  try {
    const parsed = JSON.parse(rawUIPref);
    if (parsed.theme && (parsed.theme === 'light' || parsed.theme === 'dark')) {
      newUIPref.theme = parsed.theme;
    }
    if (parsed.viewMode && isViewType(parsed.viewMode)) {
      newUIPref.viewMode = parsed.viewMode;
    }
    if (parsed.comicCardTags !== undefined) {
      newUIPref.comicCardTags = parsed.comicCardTags;
    }
    if (
      parsed.comicPageDisplay &&
      ['Fit height', 'Fit width', 'Full size', 'Tiny'].includes(parsed.comicPageDisplay)
    ) {
      newUIPref.comicPageDisplay = parsed.comicPageDisplay;
    }
    if (parsed.comicPageReverseOrder !== undefined) {
      newUIPref.comicPageReverseOrder = parsed.comicPageReverseOrder;
    }

    return newUIPref;
  } catch (e) {
    return defaultUiPref;
  }
}
