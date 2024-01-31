import { useSearchParams } from '@remix-run/react';
import { useCallback, useMemo } from 'react';
import type { Category } from '~/types/types';
import { isCategory } from '~/types/types';

export type BrowseParams = {
  page: number;
  search: string;
  isAllCategories: boolean;
  categories: Category[];
};

export type BrowseUtilities = BrowseParams & {
  setPage: (newPage: number) => void;
  setSearch: (newSearch: string) => void;
  toggleCategory: (category: Category) => void;
};

export function parseBrowseParams(rawParams: URLSearchParams): BrowseParams {
  const page = parseInt(rawParams.get('page') ?? '1', 10);
  const search = rawParams.get('search') ?? undefined;
  const rawCategories = rawParams.getAll('category');
  const categories: Category[] = rawCategories.filter(isCategory);

  return {
    page: isNaN(page) ? 1 : page,
    search: search ?? '',
    categories,
    isAllCategories: rawCategories.length === 0,
  };
}

export function useBrowseParams(): BrowseUtilities {
  const [params, setParams] = useSearchParams();
  const parsedParams = useMemo(() => parseBrowseParams(params), [params]);

  const updateParams = useCallback(
    (paramName: string, newValue: string | number | undefined) => {
      if (newValue === undefined) {
        params.delete(paramName);
      } else {
        params.set(paramName, newValue.toString());
      }
      setParams(params);
    },
    [params, setParams]
  );

  const setPage = useCallback(
    (newPage: number) => updateParams('page', newPage),
    [updateParams]
  );

  const setSearch = useCallback(
    (newSearch: string) => updateParams('search', newSearch),
    [updateParams]
  );

  const toggleCategory = useCallback(
    (category: Category) => {
      const newCategories = parsedParams.categories.includes(category)
        ? parsedParams.categories.filter(c => c !== category)
        : [...parsedParams.categories, category];
      updateParams('category', newCategories.join(','));
    },
    [parsedParams.categories, updateParams]
  );

  return {
    page: parsedParams.page,
    setPage,
    search: parsedParams.search ?? '',
    setSearch,
    categories: parsedParams.categories,
    isAllCategories: parsedParams.isAllCategories,
    toggleCategory,
  };
}
