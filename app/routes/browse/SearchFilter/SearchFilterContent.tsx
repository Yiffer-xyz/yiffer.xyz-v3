import Select from '~/ui-components/Select/Select';
import type { BrowseUtilities } from './useBrowseParams';
import TextInput from '~/ui-components/TextInput/TextInput';
import { useEffect, useState } from 'react';
import SearchableSelect from '~/ui-components/SearchableSelect/SearchableSelect';
import type { Category, CategoryWithAll, SortType, ViewType } from '~/types/types';
import { allCategories, allSortTypes, allViewTypes } from '~/types/types';
import { IoCaretUp } from 'react-icons/io5';
import MultiSelectDropdown from '~/ui-components/MultiSelectDropdown/MultiSelectDropdown';
import useDebounce from '~/utils/useDebounce';
import { useUIPreferences } from '~/utils/theme-provider';
import { SEARCHFILTER_PADDING_HORIZ } from './SearchFilterContainer';
import useWindowSize from '~/utils/useWindowSize';

type SearchFilterContentProps = {
  browseParams: BrowseUtilities;
  openWidth: number;
  onClose: () => void;
};

export default function SearchFilterContent({
  browseParams,
  openWidth,
  onClose,
}: SearchFilterContentProps) {
  const { search, setSearch, setPage, categories, setCategories, sort, setSort } =
    browseParams;
  const { viewMode, setViewMode } = useUIPreferences();
  const { isMobile } = useWindowSize();

  const [internalSearch, setInternalSearch] = useState(search);

  const debouncedRequest = useDebounce(() => {
    setPage(1);
    setSearch(internalSearch);
  });

  function onSearchChange(newVal: string) {
    setInternalSearch(newVal);
    debouncedRequest();
  }

  const [tagsSearch, setTagsSearch] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  function onTagSelected(tag: string) {
    setTags([...tags, tag]);
    setTagsSearch('');
  }

  const [_categories, _setCategories] = useState<CategoryWithAll[]>(categories);
  useEffect(() => {
    _setCategories(categories);
  }, [categories]);
  function onCategoriesClose() {
    setCategories(_categories);
  }

  // Local vars to make the site feel more snappy
  const [_sort, _setSort] = useState<SortType>(sort);
  useEffect(() => {
    _setSort(sort);
  }, [sort]);
  const onSortChange = (newSort: SortType) => {
    _setSort(newSort);
    setSort(newSort);
  };

  const categoryMinWidth = isMobile
    ? undefined
    : (openWidth - 2 * SEARCHFILTER_PADDING_HORIZ) * 0.49;

  return (
    <div className="flex flex-col gap-6 mt-2">
      <MultiSelectDropdown
        values={_categories}
        name="Category"
        title="Category"
        options={allCategories.map(x => ({ text: x, value: x }))}
        allOption={{ text: 'All', value: 'All' as CategoryWithAll }}
        onClose={onCategoriesClose}
        minWidth={categoryMinWidth}
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

      <div className="flex justify-between">
        <TextInput
          name="Search"
          value={internalSearch}
          onChange={e => onSearchChange(e)}
          label="Search"
          placeholder="Title or artist"
          style={{ width: '49%' }}
        />

        <SearchableSelect
          name="Tags"
          title="Tags"
          placeholder="Search for tag"
          style={{ width: '49%' }}
          value={tagsSearch}
          onChange={(newVal: string) => onTagSelected(newVal)}
          onValueCleared={() => setTagsSearch('')}
          options={['adan', 'adab', 'asdaasdasdas', 'asdfg3 d', 'adgt2sdf'].map(x => ({
            text: x,
            value: x,
          }))}
        />
      </div>

      <div className="flex justify-between">
        <Select
          name="sort"
          title="Sorting"
          value={_sort}
          style={{ width: '49%' }}
          onChange={onSortChange}
          options={allSortTypes.map(x => ({
            text: x,
            value: x,
          }))}
        />

        <Select
          name="view"
          title="View"
          value={viewMode}
          style={{ width: '49%' }}
          onChange={newView => setViewMode(newView)}
          options={allViewTypes.map(x => ({
            text: x,
            value: x,
          }))}
        />
      </div>

      <div
        className="w-full flex justify-center cursor-pointer -mb-2 -mt-2 pb-2 pt-2"
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
