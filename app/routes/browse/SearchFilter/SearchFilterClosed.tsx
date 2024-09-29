import type { BrowseUtilities } from './useBrowseParams';
import { useCallback, useEffect, useMemo } from 'react';
import type { Tag } from '~/types/types';
import { useUIPreferences } from '~/utils/theme-provider';
import { useGoodFetcher } from '~/utils/useGoodFetcher';
import { GoSearch, GoSortDesc } from 'react-icons/go';
import { BsGenderTrans, BsTags } from 'react-icons/bs';
import useResizeObserver from 'use-resize-observer';
import { FaRegBookmark } from 'react-icons/fa';

type SearchFilterContentProps = {
  browseParams: BrowseUtilities;
  allTags: Tag[];
  setAllTags: (tags: Tag[]) => void;
  isVisible: boolean;
  onHeightChange: (height: number) => void;
};

export default function SearchFilterClosed({
  browseParams,
  allTags,
  setAllTags,
  isVisible,
  onHeightChange,
}: SearchFilterContentProps) {
  const { comicCardTags } = useUIPreferences();
  const { search, categories, sort, tagIDs, bookmarkedOnly } = browseParams;

  const { ref, height } = useResizeObserver<HTMLDivElement>();
  useEffect(() => {
    if (height) onHeightChange(height);
  }, [height, onHeightChange]);

  const { data: allTagsFromAPI } = useGoodFetcher<Tag[]>({
    url: '/api/tags',
    fetchGetOnLoad: tagIDs.length > 0 && allTags.length === 0,
    method: 'get',
    onFinish: setAllTagsFromAPI,
  });
  // Save the first time, avoid fetching each time we open this component
  function setAllTagsFromAPI() {
    setAllTags(allTagsFromAPI ?? []);
  }

  const mapTagIDsToTags = useCallback(
    (tagIDs: number[]) => {
      return (allTags ?? []).filter(tag => tagIDs.includes(tag.id));
    },
    [allTags]
  );

  const categoryText = useMemo(() => {
    if (categories.length === 1 && categories[0] === 'All') {
      return undefined;
    }
    return categories.join(', ');
  }, [categories]);

  const tagsText = useMemo(() => {
    if (tagIDs.length === 0 || allTags.length === 0) {
      return undefined;
    }
    return mapTagIDsToTags(tagIDs)
      .map(tag => tag.name)
      .join(', ');
  }, [tagIDs, allTags.length, mapTagIDsToTags]);

  return (
    <div
      className={`text-sm flex flex-col gap-1 mt-1 ${isVisible ? '' : 'hidden'}`}
      ref={ref}
    >
      {categoryText && (
        <p className="font-bold">
          <BsGenderTrans /> {categoryText}
        </p>
      )}
      {search && (
        <p>
          <GoSearch /> <span className="font-bold">{search}</span>
        </p>
      )}
      {tagsText && (
        <p className="font-semibold">
          <BsTags className="mr-[2px]" />
          {tagIDs.length}: <span>{tagsText}</span>
        </p>
      )}
      {bookmarkedOnly && (
        <p className="font-semibold">
          <FaRegBookmark size={13} /> Bookmarked only
        </p>
      )}
      <div className="flex flex-row gap-6">
        <div className={`${sort === 'Updated' ? '' : 'font-semibold'}`}>
          <GoSortDesc /> Order: {sort}
        </div>
        <div>
          <BsTags /> {comicCardTags ? 'Tags shown' : 'Tags hidden'}
        </div>
      </div>
    </div>
  );
}
