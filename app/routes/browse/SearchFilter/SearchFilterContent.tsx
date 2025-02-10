import Select from '~/ui-components/Select/Select';
import type { BrowseUtilities } from './useBrowseParams';
import TextInput from '~/ui-components/TextInput/TextInput';
import { useCallback, useEffect, useMemo, useState } from 'react';
import SearchableSelect from '~/ui-components/SearchableSelect/SearchableSelect';
import type { Category, CategoryWithAll, SortType, Tag } from '~/types/types';
import { allCategories, allSortTypes } from '~/types/types';
import { IoCaretUp } from 'react-icons/io5';
import MultiSelectDropdown from '~/ui-components/MultiSelectDropdown/MultiSelectDropdown';
import useDebounce from '~/utils/useDebounce';
import { useUIPreferences } from '~/utils/theme-provider';
import { useGoodFetcher } from '~/utils/useGoodFetcher';
import { RiCloseLine } from 'react-icons/ri';
import useResizeObserver from 'use-resize-observer';
import { areArraysEqual } from '~/utils/general';
import posthog from 'posthog-js';
import SwitchToggle from '~/ui-components/Buttons/SwitchToggle';

type SearchFilterContentProps = {
  browseParams: BrowseUtilities;
  openWidth: number;
  onClose: () => void;
  allTags: Tag[];
  setAllTags: (tags: Tag[]) => void;
  isVisible: boolean;
  onHeightChange: (height: number) => void;
  isLoggedIn: boolean;
};

export default function SearchFilterContent({
  browseParams,
  openWidth,
  onClose,
  allTags,
  setAllTags,
  isVisible,
  onHeightChange,
  isLoggedIn,
}: SearchFilterContentProps) {
  const {
    search,
    setSearch,
    setPage,
    categories,
    setCategories,
    sort,
    setSort,
    tagIDs,
    addTagID,
    removeTagID,
    bookmarkedOnly,
    setBookmarkedOnly,
  } = browseParams;

  const { comicCardTags, setComicCardTags } = useUIPreferences();

  const { ref, height } = useResizeObserver<HTMLDivElement>();
  useEffect(() => {
    if (height) onHeightChange(height);
  }, [height, onHeightChange]);

  // Fetch all tags on first open, if not already fetched
  const { data: allTagsFromAPI, submit: fetchAllTags } = useGoodFetcher<Tag[]>({
    url: '/api/tags',
    method: 'get',
    onFinish: setAllTagsFromAPI,
  });
  function setAllTagsFromAPI() {
    setAllTags(allTagsFromAPI ?? []);
  }
  useEffect(() => {
    if (isVisible && allTags.length === 0) {
      fetchAllTags();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible, allTags]);

  // Don't set internal on every search (param) update; might lead to weird behavior.
  // Assume it's synced after first render - it should be.
  const [internalSearch, setInternalSearch] = useState(search);

  const debouncedSearch = useDebounce(() => {
    setPage(1, { scrollTop: false });
    setSearch(internalSearch);
    posthog.capture('Filter > Search changed');
  });

  function onSearchChange(newVal: string) {
    setInternalSearch(newVal);
    debouncedSearch();
  }

  // Reset search input when search param changes
  useEffect(() => {
    setInternalSearch(search);
  }, [search]);

  const mapTagIDsToTags = useCallback(
    (tagIDs: number[]) => {
      return (allTags ?? []).filter(tag => tagIDs.includes(tag.id));
    },
    [allTags]
  );

  const filteredTagOptions = useMemo(() => {
    return (allTags ?? []).filter(tag => !tagIDs.includes(tag.id));
  }, [allTags, tagIDs]);

  // Local vars for a more snappy feel
  const [_tags, _setTags] = useState<Tag[]>([]);
  useEffect(() => {
    _setTags(mapTagIDsToTags(tagIDs));
  }, [mapTagIDsToTags, tagIDs]);

  function onTagSelected(tag: Tag) {
    _setTags([..._tags, tag]);
    addTagID(tag.id);
    setPage(1, { scrollTop: false });
    posthog.capture('Filter > Tag selected');
  }

  function onTagDeselected(tag: Tag) {
    _setTags(_tags.filter(t => t.id !== tag.id));
    removeTagID(tag.id);
    setPage(1, { scrollTop: false });
  }

  // Local vars updated while dropdown open; set to params when it's closed
  const [_categories, _setCategories] = useState<CategoryWithAll[]>(categories);
  useEffect(() => {
    _setCategories(categories);
  }, [categories]);
  function onCategoriesClose() {
    if (areArraysEqual(_categories, categories)) return;
    setCategories(_categories);
    setPage(1, { scrollTop: false });
    if (!(_categories.length === 1 && _categories[0] === 'All')) {
      posthog.capture('Filter > Category changed', {
        categories: _categories,
      });
    }
  }

  // Local vars for a more snappy feel
  const [_sort, _setSort] = useState<SortType>(sort);
  useEffect(() => {
    _setSort(sort);
  }, [sort]);
  const onSortChange = (newSort: SortType) => {
    _setSort(newSort);
    setSort(newSort);
    setPage(1, { scrollTop: false });
    posthog.capture('Filter > Sort changed', { sort: newSort });
  };

  // Local vars for a more snappy feel
  // const [_bookmarkedOnly, _setBookmarkedOnly] = useState(bookmarkedOnly);
  const [_bookmarkedOnly, _setBookmarkedOnly] = useState(false);
  useEffect(() => {
    _setBookmarkedOnly(bookmarkedOnly);
  }, [bookmarkedOnly]);
  const onBookmarkedOnlyChange = (newVal: boolean) => {
    _setBookmarkedOnly(newVal);
    setBookmarkedOnly(newVal);
    setPage(1, { scrollTop: false });
    if (newVal) posthog.capture('Filter > Bookmarked only changed', { shown: newVal });
  };

  const availableSortTypes = isLoggedIn
    ? allSortTypes
    : allSortTypes.filter(x => x !== 'Your score');

  return (
    <div className={`flex flex-col gap-6 mt-2 ${isVisible ? '' : 'hidden'}`} ref={ref}>
      <div className="flex flex-col md:flex-row w-full justify-between gap-5 md:gap-0">
        <MultiSelectDropdown
          values={_categories}
          name="Category"
          title="Category"
          options={allCategories.map(x => ({ text: x, value: x }))}
          allOption={{ text: 'All', value: 'All' as CategoryWithAll }}
          onClose={onCategoriesClose}
          className="w-full md:w-[49%]"
          onValueAdded={category => {
            const newCategories = [..._categories, category];
            if (category !== 'All' && newCategories.includes('All')) {
              newCategories.splice(newCategories.indexOf('All'), 1);
            }
            _setCategories(newCategories);
          }}
          onValueRemoved={category => {
            if (_categories.length === 1) {
              if (category === 'All' && _categories[0] === ('All' as Category)) return;
              _setCategories(['All']);
              return;
            }
            _setCategories(_categories.filter(x => x !== category));
          }}
          onAllOptionSelected={() => _setCategories(['All'])}
        />

        <Select
          name="sort"
          title="Sorting"
          value={_sort}
          // style={{ width: '100%' }}
          className="w-full md:w-[49%]"
          onChange={onSortChange}
          options={availableSortTypes.map(x => ({
            text: x,
            value: x,
          }))}
        />
      </div>

      <div className="flex flex-col md:flex-row justify-between gap-5 md:gap-0">
        <TextInput
          name="Search"
          value={internalSearch}
          onChange={e => onSearchChange(e)}
          label="Search"
          placeholder="Title or artist"
          className="w-full md:w-[49%]"
        />

        {/* Not normal use of SearchableSelect; we don't care about selected value, since we */}
        {/* instead use our own array to keep track of multiple selected items. */}
        <SearchableSelect
          name="Tags"
          title="Tags"
          placeholder="Search for tag"
          clearOnSelect
          className="w-full md:w-[49%]"
          onChange={(newVal: Tag) => onTagSelected(newVal)}
          onValueCleared={() => null}
          options={filteredTagOptions.map(tag => ({
            text: tag.name,
            value: tag,
          }))}
        />
      </div>

      {_tags.length > 0 && (
        <div className="flex flex-wrap gap-2 -mt-2 w-full justify-end">
          {_tags.map(tag => (
            <div
              key={tag.id}
              className={`bg-blue-weak-200 rounded-full pl-2 pr-1 py-[1px] flex flex-row shadow-sm 
                items-center gap-1 hover:bg-blue-weak-100 hover:cursor-pointer
                dark:bg-blue-strong-200 dark:hover:bg-blue-strong-100`}
              onClick={() => onTagDeselected(tag)}
              style={{ textDecorationColor: 'white' }}
            >
              <p className="text-sm text-text-white font-normal">
                {tag.name}
                <RiCloseLine className="ml-0.5" />
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <SwitchToggle
          label={comicCardTags ? 'Tags shown' : 'Tags hidden'}
          checked={comicCardTags}
          onChange={() => {
            setComicCardTags(!comicCardTags);
            posthog.capture('Filter > Tags shown changed', { shown: comicCardTags });
          }}
          className="w-[130px]"
        />

        {isLoggedIn && (
          <SwitchToggle
            label="Bookmarked only"
            checked={_bookmarkedOnly}
            onChange={onBookmarkedOnlyChange}
            className="ml-4"
          />
        )}
      </div>

      <div
        className="w-full flex justify-center cursor-pointer -mb-2 -mt-2 pb-2 pt-2 relative"
        onClick={e => {
          onClose();
          e.stopPropagation();
        }}
      >
        <IoCaretUp />
      </div>
    </div>
  );
}
