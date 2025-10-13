import type React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { MdArrowDownward, MdClear } from 'react-icons/md';
import type { Comic, PageDisplay } from '~/types/types';
import Button from '~/ui-components/Buttons/Button';
import IconButton from '~/ui-components/Buttons/IconButton';
import SwitchToggle from '~/ui-components/Buttons/SwitchToggle';
import { useUIPreferences } from '~/utils/theme-provider';
import posthog from 'posthog-js';
import DropdownButton from '~/ui-components/Buttons/DropdownButton';
import ComicManageTags from './ComicManageTags';
import ComicReportProblem from './ComicReportProblem';

const pageDisplays: PageDisplay[] = [
  'Fit',
  'Fit height',
  'Fit width',
  'Full size',
  'Tiny',
];

type PageStyle = {
  width: string;
  maxHeight: string;
  maxWidth: string;
};

type ComicDisplayOptionsProps = {
  comic: Comic;
  pagesPath: string;
  isLoggedIn: boolean;
  isMod: boolean;
  children?: React.ReactNode;
};

export default function DisplayOptionsAndPages({
  comic,
  pagesPath,
  isLoggedIn,
  isMod,
  children, // Advertisement
}: ComicDisplayOptionsProps) {
  const { comicDisplayOptions, setComicDisplayOptions } = useUIPreferences();
  const {
    display: displaySaved,
    reverseOrder: reverseOrderSaved,
    clickToToggleDisplay: clickToToggleDisplaySaved,
  } = comicDisplayOptions;

  // @ts-ignore
  const labelUpdateTimeoutRef = useRef<{ timer: NodeJS.Timeout; pageNum: number } | null>(
    null
  );

  const [isManagingTags, setIsManagingTags] = useState(false);
  const [isReportingProblem, setIsReportingProblem] = useState(false);
  const [isSetDefaultHidden, setIsSetDefaultHidden] = useState(false);
  const [isReverseOrderLocal, setIsReverseOrderLocal] = useState<boolean | null>(null);
  const [displayLocal, setDisplayLocal] = useState<PageDisplay | null>(null);
  const [clickPageToToggleLocal, setClickPageToToggleLocal] = useState<boolean | null>(
    null
  );

  const hasLinks = !!comic?.previousComic || !!comic?.nextComic;
  const currentIsReverseOrder = isReverseOrderLocal ?? reverseOrderSaved;
  const currentDisplay = displayLocal ?? displaySaved;
  const currentClickToToggleDisplay = clickPageToToggleLocal ?? clickToToggleDisplaySaved;

  const infoBoxesExtraMarginClass = useMemo(() => {
    if (hasLinks || !comic) return 'md:mt-6';
    if (comic.tags.length > 12) return 'md:mt-12';
    if (comic.tags.length > 0) return 'md:mt-14';
    return 'md:mt-[88px]';
  }, [comic, hasLinks]);

  const hasChanged = useMemo(() => {
    return (
      currentDisplay !== displaySaved ||
      currentIsReverseOrder !== reverseOrderSaved ||
      currentClickToToggleDisplay !== clickToToggleDisplaySaved
    );
  }, [
    currentDisplay,
    displaySaved,
    currentIsReverseOrder,
    reverseOrderSaved,
    currentClickToToggleDisplay,
    clickToToggleDisplaySaved,
  ]);

  function setDefault() {
    setComicDisplayOptions({
      isReversed: currentIsReverseOrder,
      display: currentDisplay,
      clickToToggleDisplay: currentClickToToggleDisplay,
    });
  }

  function onChangeReverseOrder() {
    setIsSetDefaultHidden(false);
    const newIsReverseOrder = !currentIsReverseOrder;
    setIsReverseOrderLocal(newIsReverseOrder);
    posthog.capture('Page order reverse toggled', { active: newIsReverseOrder });
  }

  function onChangeDisplay(newDisplay: PageDisplay) {
    setIsSetDefaultHidden(false);
    setIndividualPageStyles(Array(comic.numberOfPages).fill(undefined));
    setDisplayLocal(newDisplay);
    posthog.capture('Page display changed', { display: newDisplay });
  }

  function onChangeClickToToggleDisplay() {
    setIsSetDefaultHidden(false);
    const newClickToToggleDisplay = !currentClickToToggleDisplay;
    setClickPageToToggleLocal(newClickToToggleDisplay);
    posthog.capture('Tap page cycle display toggled', {
      active: newClickToToggleDisplay,
    });
  }

  const [style, setStyle] = useState(displayToPageStyle(displaySaved, true));
  const [individualPageStyles, setIndividualPageStyles] = useState<
    (number | undefined)[]
  >(Array(comic.numberOfPages).fill(undefined));
  const [individualPageStylesShowLabels, setIndividualPageStylesShowLabels] = useState<
    (number | undefined)[]
  >(Array(comic.numberOfPages).fill(undefined));

  // There are slight differences between SSR and how we want it to look on the client.
  // Namely, on the client we sometimes want specific pixel values for the width and height,
  // so that the images don't jump around if the screen size changes. We can't get these values
  // on the server, however, so there and on first client load, use percentages, which should
  // always match until the window size potentially changes. Then, on the second render, update
  // the style to use the pixel values.
  useEffect(() => {
    setStyle(displayToPageStyle(currentDisplay, false));
  }, [currentDisplay]);

  function onPageClick(pageNumber: number) {
    if (!currentClickToToggleDisplay) return;
    const pageIndex = pageNumber - 1;

    let newIndex = (pageDisplays.indexOf(currentDisplay) + 1) % pageDisplays.length;
    if (individualPageStyles[pageIndex] !== undefined) {
      newIndex = (individualPageStyles[pageIndex]! + 1) % pageDisplays.length;
    }

    posthog.capture('Page clicked, cycle display');

    setIndividualPageStyles(prev => {
      const updated = [...prev];
      updated[pageIndex] = newIndex;
      return updated;
    });

    setIndividualPageStylesShowLabels(prev => {
      const updated = [...prev];
      updated[pageIndex] = newIndex;
      return updated;
    });

    if (labelUpdateTimeoutRef.current !== null) {
      clearTimeout(labelUpdateTimeoutRef.current.timer);
      if (labelUpdateTimeoutRef.current.pageNum !== pageIndex) {
        setIndividualPageStylesShowLabels(prev => {
          const updated = [...prev];
          updated[labelUpdateTimeoutRef.current!.pageNum] = undefined;
          return updated;
        });
      }
    }
    labelUpdateTimeoutRef.current = {
      timer: setTimeout(() => {
        individualPageStylesShowLabels[pageIndex] = undefined;
        setIndividualPageStylesShowLabels([...individualPageStylesShowLabels]);
      }, 500),
      pageNum: pageIndex,
    };

    setIndividualPageStylesShowLabels([...individualPageStylesShowLabels]);
  }

  function getPageStyle(pageNumber: number): PageStyle {
    if (individualPageStyles[pageNumber] !== undefined) {
      return displayToPageStyle(pageDisplays[individualPageStyles[pageNumber]]);
    }
    return style;
  }

  return (
    <>
      {isManagingTags && (
        <ComicManageTags
          comic={comic}
          setIsManagingTags={setIsManagingTags}
          isLoggedIn={isLoggedIn}
          isMod={isMod}
          infoBoxesExtraMarginClass={infoBoxesExtraMarginClass}
        />
      )}

      {isReportingProblem && (
        <ComicReportProblem
          comic={comic}
          setIsReportingProblem={setIsReportingProblem}
          isLoggedIn={isLoggedIn}
          infoBoxesExtraMarginClass={infoBoxesExtraMarginClass}
        />
      )}

      {!isManagingTags && !isReportingProblem && (
        <div className="flex flex-col gap-1.5 mt-3 mb-5 md:mt-5 md:mb-0 md:w-[728px]">
          <div className="w-full flex flex-row gap-3">
            <DropdownButton
              text="Page fit"
              options={pageDisplays.map(pageDisplay => ({
                text: pageDisplay,
                onClick: () => onChangeDisplay(pageDisplay),
              }))}
            />

            <DropdownButton
              text="Contribute"
              style={{ width: 154 }}
              options={[
                {
                  text: 'Add or remove tags',
                  onClick: () => setIsManagingTags(true),
                },
                {
                  text: 'Report problem',
                  onClick: () => setIsReportingProblem(true),
                },
              ]}
            />
          </div>

          <div className="flex flex-col gap-y-1">
            <SwitchToggle
              label="Tap pages to cycle display"
              onChange={onChangeClickToToggleDisplay}
              checked={currentClickToToggleDisplay}
              className="mt-1"
            />
            <SwitchToggle
              label="Reverse page order"
              onChange={onChangeReverseOrder}
              checked={currentIsReverseOrder}
              className="mt-1"
            />
          </div>

          {hasChanged && !isSetDefaultHidden && (
            <div className="mt-1 flex flex-row items-center">
              <Button
                text="Set as default"
                className="py-1! px-2! "
                onClick={setDefault}
                variant="outlined"
              />
              <IconButton
                variant="naked"
                icon={MdClear}
                className="ml-0 text-gray-700 dark:text-gray-600"
                onClick={() => setIsSetDefaultHidden(true)}
              />
            </div>
          )}

          <Button
            variant="naked"
            text="Go to bottom & comments"
            startIcon={MdArrowDownward}
            className="mt-3 md:mt-2 self-start"
            noPadding
            onClick={() => {
              const bottomButton = document.getElementById('to-top-button');
              if (bottomButton) {
                bottomButton.scrollIntoView({ behavior: 'smooth' });
              } else {
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
              }
            }}
          />
        </div>
      )}

      {children}

      <div className="gap-4 mt-4 flex flex-col items-center w-full">
        {comic.pages.map((page, i) => (
          <div key={page.token} className="relative">
            <img
              src={`${pagesPath}/comics/${comic.id}/${page.token}.jpg`}
              alt={`Page ${page.pageNumber}`}
              className="comicPage"
              style={getPageStyle(page.pageNumber)}
              onClick={() => onPageClick(page.pageNumber)}
            />

            {individualPageStylesShowLabels[i] !== undefined && (
              <div
                className={`absolute top-2 w-full flex items-center justify-center font-bold`}
              >
                <span className="bg-[#00000077] px-3 py-1 rounded-full text-white">
                  {pageDisplays[individualPageStylesShowLabels[i]]}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

function displayToPageStyle(display: PageDisplay, serverSafe = false) {
  const useWindowDim = !serverSafe && typeof window !== 'undefined';
  let widthPadding = 32;
  if (useWindowDim) {
    if (document.body.clientWidth > 768) {
      widthPadding = 40;
    }
  }

  if (display === 'Fit') {
    return {
      width: 'auto',
      maxHeight: '100vh',
      maxWidth: '100%',
    };
  }
  if (display === 'Fit width') {
    return {
      width: 'auto',
      maxHeight: 'none',
      maxWidth: useWindowDim ? document.body.clientWidth - widthPadding + 'px' : '100%',
    };
  }
  if (display === 'Fit height') {
    return {
      width: 'auto',
      maxHeight: '100vh',
      maxWidth: 'none',
    };
  }
  if (display === 'Full size') {
    return {
      width: 'auto',
      maxHeight: 'none',
      maxWidth: 'none',
    };
  }
  return {
    width: '100px',
    maxHeight: 'none',
    maxWidth: '100%',
  };
}
