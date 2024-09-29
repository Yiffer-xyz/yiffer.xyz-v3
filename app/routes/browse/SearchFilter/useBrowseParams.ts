import { useSearchParams } from '@remix-run/react';
import { useCallback, useMemo } from 'react';
import type { CategoryWithAll, SortType } from '~/types/types';
import { allSortTypes, isCategory } from '~/types/types';

const CATEGORY_URL_KEY = 'c';

export type BrowseParams = {
  page: number;
  search: string;
  isAllCategories: boolean;
  categories: CategoryWithAll[];
  sort: SortType;
  tagIDs: number[];
  showTags: boolean;
  bookmarkedOnly: boolean;
};

export type BrowseUtilities = BrowseParams & {
  setPage: (newPage: number, { scrollTop }: { scrollTop: boolean }) => void;
  setSearch: (newSearch: string) => void;
  setCategories: (newCategories: CategoryWithAll[]) => void;
  setSort: (newSort: SortType) => void;
  addTagID: (tag: number) => void;
  removeTagID: (tag: number) => void;
  clearTagIDs: () => void;
  setShowTags: (showTags: boolean) => void;
  setBookmarkedOnly: (bookmarkedOnly: boolean) => void;
};

export function parseBrowseParams(rawParams: URLSearchParams): BrowseParams {
  const page = parseInt(rawParams.get('page') ?? '1', 10);
  const search = rawParams.get('search') ?? undefined;
  const rawParamCategories = rawParams.getAll(CATEGORY_URL_KEY);
  const rawCategories: CategoryWithAll[] = rawParamCategories.filter(isCategory);
  const rawSort = rawParams.get('sort') as SortType | null;
  const rawTags = rawParams.getAll('tag') ?? [];
  const tags = rawTags.map(tag => parseInt(tag, 10)).filter(tag => !isNaN(tag));
  const showTags = rawParams.get('showTags') === 'true';
  const bookmarkedOnly = rawParams.get('bookmarkedOnly') === 'true';

  let categories: CategoryWithAll[];
  if (rawCategories.length === 0) {
    categories = ['All'];
  } else {
    categories = rawCategories;
  }

  return {
    page: isNaN(page) ? 1 : page,
    search: search ?? '',
    categories,
    isAllCategories: rawCategories.length === 0,
    sort: rawUrlSortToSort(rawSort),
    tagIDs: tags,
    showTags,
    bookmarkedOnly,
  };
}

export function useBrowseParams(): BrowseUtilities {
  const [params, setParams] = useSearchParams();
  const parsedParams = useMemo(() => parseBrowseParams(params), [params]);

  const updateParams = useCallback(
    (
      paramName: string,
      newValue: string | number | undefined,
      preventScrollReset = true
    ) => {
      if (newValue === undefined || newValue.toString().trim() === '') {
        params.delete(paramName);
      } else {
        params.set(paramName, newValue.toString());
      }
      setParams(params, { preventScrollReset });
    },
    [params, setParams]
  );

  const setPage = useCallback(
    (newPage: number, { scrollTop }: { scrollTop: boolean }) => {
      if (newPage <= 1) {
        updateParams('page', undefined, !scrollTop);
      } else {
        updateParams('page', newPage, !scrollTop);
      }
    },
    [updateParams]
  );

  const setSearch = useCallback(
    (newSearch: string) => updateParams('search', newSearch),
    [updateParams]
  );

  const setCategories = useCallback(
    (newCategories: CategoryWithAll[]) => {
      params.delete(CATEGORY_URL_KEY);

      if (
        newCategories.length > 0 &&
        !(newCategories.length === 1 && newCategories[0] === 'All')
      ) {
        params.set(CATEGORY_URL_KEY, '');
        newCategories.forEach(category => {
          params.append(CATEGORY_URL_KEY, category);
        });
      }

      setParams(params, { preventScrollReset: true });
    },
    [params, setParams]
  );

  const setSort = useCallback(
    (newSort: SortType) => {
      const newUrlSort = sortToUrlSort(newSort);
      updateParams('sort', newUrlSort);
    },
    [updateParams]
  );

  const setBookmarkedOnly = useCallback(
    (newBookmarkedOnly: boolean) => {
      updateParams('bookmarkedOnly', newBookmarkedOnly === true ? 'true' : undefined);
    },
    [updateParams]
  );

  return {
    page: parsedParams.page,
    setPage,
    search: parsedParams.search ?? '',
    setSearch,
    categories: parsedParams.categories,
    isAllCategories: parsedParams.isAllCategories,
    setCategories,
    sort: parsedParams.sort,
    setSort,
    tagIDs: parsedParams.tagIDs,
    addTagID: (tag: number) => {
      if (parsedParams.tagIDs.includes(tag)) return;
      params.append('tag', tag.toString());
      setParams(params, { preventScrollReset: true });
    },
    removeTagID: (tag: number) => {
      if (!parsedParams.tagIDs.includes(tag)) return;
      params.delete('tag');
      parsedParams.tagIDs.forEach(id => {
        if (id !== tag) {
          params.append('tag', id.toString());
        }
      });
      setParams(params, { preventScrollReset: true });
    },
    clearTagIDs: () => {
      params.delete('tag');
      setParams(params, { preventScrollReset: true });
    },
    showTags: parsedParams.showTags,
    setShowTags: (showTags: boolean) => {
      updateParams('showTags', showTags === true ? 'true' : undefined);
    },
    bookmarkedOnly: parsedParams.bookmarkedOnly,
    setBookmarkedOnly,
  };
}

function rawUrlSortToSort(rawSort: string | null): SortType {
  if (rawSort === null) return 'Updated';
  for (const sort of allSortTypes) {
    if (sort.toLowerCase().replace(' ', '-') === rawSort) {
      return sort;
    }
  }
  return 'Updated';
}

function sortToUrlSort(sort: SortType): string {
  if (sort === 'Updated') return '';
  return sort.toLowerCase().replace(' ', '-');
}

export function sortToApiSort(
  sort: SortType
): 'updated' | 'userRating' | 'yourRating' | 'random' {
  switch (sort) {
    case 'Updated':
      return 'updated';
    case 'User score':
      return 'userRating';
    case 'Your score':
      return 'yourRating';
    case 'Random':
      return 'random';
  }
}
