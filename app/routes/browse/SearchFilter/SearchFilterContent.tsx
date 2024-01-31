import Select from '~/ui-components/Select/Select';
import type { BrowseUtilities } from './useBrowseParams';
import TextInput from '~/ui-components/TextInput/TextInput';
import { useState } from 'react';
import SearchableSelect from '~/ui-components/SearchableSelect/SearchableSelect';
import type { Category, CategoryWithAll, SortType, ViewType } from '~/types/types';
import { allCategories, allSortTypes, allViewTypes } from '~/types/types';
import { IoCaretUp } from 'react-icons/io5';
import MultiSelectDropdown from '~/ui-components/MultiSelectDropdown/MultiSelectDropdown';

type SearchFilterContentProps = {
  browseParams: BrowseUtilities;
  onClose: () => void;
};

export default function SearchFilterContent({
  browseParams,
  onClose,
}: SearchFilterContentProps) {
  const { search, setSearch } = browseParams;

  const [tagsSearch, setTagsSearch] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  function onTagSelected(tag: string) {
    setTags([...tags, tag]);
    setTagsSearch('');
  }

  const [categories2, setCategories2] = useState<CategoryWithAll[]>(['All']);

  const [sort, setSort] = useState<SortType>('Recently updated');
  const onSortChange = (newSort: SortType) => {
    setSort(newSort);
  };

  const [view, setView] = useState<ViewType>('Simple card');
  const onViewChange = (newView: ViewType) => {
    setView(newView);
  };

  return (
    <div className="flex flex-col gap-6 mt-2">
      <MultiSelectDropdown
        values={categories2}
        name="Category"
        title="Category"
        options={allCategories.map(x => ({ text: x, value: x }))}
        allOption={{ text: 'All', value: 'All' as CategoryWithAll }}
        onValueAdded={category => {
          const newCategories = [...categories2, category];
          if (category !== 'All' && newCategories.includes('All')) {
            newCategories.splice(newCategories.indexOf('All'), 1);
          }
          setCategories2(newCategories);
        }}
        onValueRemoved={category => {
          if (categories2.length === 1) {
            if (category === 'All' && categories2[0] === ('All' as Category)) return;
            setCategories2(['All']);
            return;
          }
          setCategories2(categories2.filter(x => x !== category));
        }}
        onAllOptionSelected={() => setCategories2(['All'])}
      />

      <div className="flex justify-between">
        <TextInput
          name="Search"
          value={search}
          onChange={e => setSearch(e)}
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
          value={sort}
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
          value={view}
          style={{ width: '49%' }}
          onChange={onViewChange}
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
