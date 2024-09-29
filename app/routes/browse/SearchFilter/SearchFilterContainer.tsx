import { useMemo, useState } from 'react';
import useWindowSize from '~/utils/useWindowSize';
import SearchFilterContent from './SearchFilterContent';
import type { BrowseUtilities } from './useBrowseParams';
import { LiaUndoAltSolid } from 'react-icons/lia';
import type { Tag } from '~/types/types';
import SearchFilterClosed from './SearchFilterClosed';
import { useUIPreferences } from '~/utils/theme-provider';

type SearchFilterProps = {
  browseUtilities: BrowseUtilities;
  isLoggedIn: boolean;
};

export const CLOSED_SEARCHFILTER_WIDTH = 300;
export const OPEN_SEARCHFILTER_MAXWIDTH = 500;
export const SEARCHFILTER_PADDING_HORIZ = 12;
export const SEARCHFILTER_PADDING_VERT = 8;

export default function SearchFilter({ browseUtilities, isLoggedIn }: SearchFilterProps) {
  const { width: windowWidth } = useWindowSize();
  const { theme } = useUIPreferences();
  const [isOpen, setIsOpenInner] = useState(false);
  const [width, setWidth] = useState(CLOSED_SEARCHFILTER_WIDTH);
  const [height, setHeight] = useState(180);
  const [allTags, setAllTags] = useState<Tag[]>([]);

  // Overflow should be hidden when animating expand, but not when it's
  // done, so dropdowns can overflow the container
  const [isOverflowHidden, setIsOverflowHidden] = useState(true);

  function onHeightChange(h: number) {
    setHeight(h + 28 + SEARCHFILTER_PADDING_VERT * 2);
  }

  const isAnySearchSortActive = useMemo(() => {
    return (
      !!browseUtilities.search ||
      browseUtilities.tagIDs.length > 0 ||
      !browseUtilities.categories.includes('All') ||
      browseUtilities.sort !== 'Updated' ||
      browseUtilities.bookmarkedOnly
    );
  }, [browseUtilities]);

  const openWidth = useMemo(() => {
    if (!windowWidth) return OPEN_SEARCHFILTER_MAXWIDTH;
    return Math.min(OPEN_SEARCHFILTER_MAXWIDTH, windowWidth * 0.95);
  }, [windowWidth]);

  function onOpenchange(isOpen: boolean) {
    setIsOpenInner(isOpen);
    if (!isOpen || !windowWidth) {
      setIsOverflowHidden(true);
      setWidth(CLOSED_SEARCHFILTER_WIDTH);
      return;
    }

    setTimeout(() => setIsOverflowHidden(false), 250);
    setWidth(openWidth);
  }

  function resetFilters() {
    browseUtilities.setSearch('');
    browseUtilities.setCategories(['All']);
    browseUtilities.setPage(1, { scrollTop: false });
    browseUtilities.setSort('Updated');
    browseUtilities.setBookmarkedOnly(false);
    browseUtilities.clearTagIDs();
  }

  const openClassNames = isOpen ? '' : 'cursor-pointer';
  const bgClassName = isAnySearchSortActive
    ? 'bg-theme2-primary dark:bg-theme1-primaryTrans dark:border-theme2-dark dark:border-4'
    : 'bg-theme1-primaryTrans';

  const removePadding = isAnySearchSortActive && theme === 'dark' ? 4 : 0;
  const paddingHoriz = SEARCHFILTER_PADDING_HORIZ - removePadding;
  const paddingVert = SEARCHFILTER_PADDING_VERT - removePadding;

  return (
    <div
      className={`rounded shadow mt-4 dark:text-text-white
        ${bgClassName} ${isOverflowHidden ? 'overflow-hidden' : ''} 
        mx-auto font ${openClassNames}`}
      onClick={() => {
        onOpenchange(true);
      }}
      style={{
        width,
        maxWidth: '95vw',
        maxHeight: height,
        transition:
          'width 0.2s ease-out, height 0.2s ease-out, background-color 0.2s ease-out',
        paddingLeft: paddingHoriz,
        paddingRight: paddingHoriz,
        paddingTop: paddingVert,
        paddingBottom: paddingVert,
      }}
    >
      <div
        className="flex flex-row justify-between items-center cursor-pointer"
        onClick={(e: any) => {
          onOpenchange(false);
          isOpen && e.stopPropagation();
        }}
      >
        <p className="font-semibold">Filters and display</p>

        {isAnySearchSortActive && (
          <div
            color="primary"
            className=""
            onClick={e => {
              e.stopPropagation();
              resetFilters();
            }}
          >
            <LiaUndoAltSolid />
          </div>
        )}
      </div>

      <SearchFilterContent
        browseParams={browseUtilities}
        openWidth={openWidth}
        allTags={allTags}
        setAllTags={setAllTags}
        onClose={() => {
          onOpenchange(false);
        }}
        isVisible={isOpen}
        onHeightChange={onHeightChange}
        isLoggedIn={isLoggedIn}
      />
      <SearchFilterClosed
        browseParams={browseUtilities}
        allTags={allTags}
        setAllTags={setAllTags}
        isVisible={!isOpen}
        onHeightChange={onHeightChange}
      />
    </div>
  );
}
