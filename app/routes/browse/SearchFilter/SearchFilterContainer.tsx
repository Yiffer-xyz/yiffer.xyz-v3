import { useMemo, useState } from 'react';
import useWindowSize from '~/utils/useWindowSize';
import SearchFilterContent from './SearchFilterContent';
import type { BrowseUtilities } from './useBrowseParams';

type SearchFilterProps = {
  browseUtilities: BrowseUtilities;
};

export const OPEN_SEARCHFILTER_MAXWIDTH = 500;
export const SEARCHFILTER_PADDING_HORIZ = 12;

export default function SearchFilter({ browseUtilities }: SearchFilterProps) {
  const [isOpen, setIsOpenInner] = useState(false);
  const [width, setWidth] = useState(300);
  const [height, setHeight] = useState(80);
  const { width: windowWidth } = useWindowSize();

  const openWidth = useMemo(() => {
    if (!windowWidth) return 300;
    return Math.min(OPEN_SEARCHFILTER_MAXWIDTH, windowWidth * 0.95);
  }, [windowWidth]);

  function onOpenchange(isOpen: boolean) {
    setIsOpenInner(isOpen);
    if (!isOpen || !windowWidth) {
      setWidth(300);
      setHeight(80);
      return;
    }

    setHeight(700);
    setWidth(openWidth);
  }

  const openClassNames = isOpen ? '' : 'cursor-pointer';

  return (
    <div
      className={`bg-theme1-primaryTrans rounded shadow mt-4 py-2 
        mx-auto font ${openClassNames}`}
      onClick={() => {
        onOpenchange(true);
      }}
      style={{
        width,
        maxWidth: '95vw',
        maxHeight: height,
        transition: 'all 0.2s ease-out',
        paddingLeft: SEARCHFILTER_PADDING_HORIZ,
        paddingRight: SEARCHFILTER_PADDING_HORIZ,
      }}
    >
      <p
        className="cursor-pointer font-semibold"
        onClick={(e: any) => {
          onOpenchange(false);
          isOpen && e.stopPropagation();
        }}
      >
        Filters and display - Extremely WIP
      </p>

      {isOpen ? (
        <SearchFilterContent
          browseParams={browseUtilities}
          openWidth={openWidth}
          onClose={() => {
            onOpenchange(false);
          }}
        />
      ) : (
        <>
          <p className="text-xs">All · recently updated · simple card</p>
        </>
      )}
    </div>
  );
}
