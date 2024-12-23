import type React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { MdClear, MdQuestionMark } from 'react-icons/md';
import type { Comic, PageDisplay } from '~/types/types';
import Button from '~/ui-components/Buttons/Button';
import IconButton from '~/ui-components/Buttons/IconButton';
import SwitchToggle from '~/ui-components/Buttons/SwitchToggle';
import { padPageNumber } from '~/utils/general';
import { useUIPreferences } from '~/utils/theme-provider';
import posthog from 'posthog-js';

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
  children?: React.ReactNode;
};

export default function DisplayOptionsAndPages({
  comic,
  pagesPath,
  children, // Advertisement
}: ComicDisplayOptionsProps) {
  const { comicDisplayOptions, setComicDisplayOptions } = useUIPreferences();
  const {
    display: displaySaved,
    reverseOrder: reverseOrderSaved,
    clickToToggleDisplay: clickToToggleDisplaySaved,
  } = comicDisplayOptions;

  const labelUpdateTimeoutRef = useRef<{ timer: NodeJS.Timeout; pageNum: number } | null>(
    null
  );
  const [isShowingExplanation, setIsShowingExplanation] = useState(false);
  const [isSetDefaultHidden, setIsSetDefaultHidden] = useState(false);
  const [isReverseOrderLocal, setIsReverseOrderLocal] = useState<boolean | null>(null);
  const [displayLocal, setDisplayLocal] = useState<PageDisplay | null>(null);
  const [clickPageToToggleLocal, setClickPageToToggleLocal] = useState<boolean | null>(
    null
  );

  const currentIsReverseOrder = isReverseOrderLocal ?? reverseOrderSaved;
  const currentDisplay = displayLocal ?? displaySaved;
  const currentClickToToggleDisplay = clickPageToToggleLocal ?? clickToToggleDisplaySaved;

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

    let newIndex = (pageDisplays.indexOf(currentDisplay) + 1) % pageDisplays.length;
    if (individualPageStyles[pageNumber] !== undefined) {
      newIndex = (individualPageStyles[pageNumber]! + 1) % pageDisplays.length;
    }

    posthog.capture('Page clicked, cycle display');

    individualPageStyles[pageNumber] = newIndex;
    setIndividualPageStyles([...individualPageStyles]);

    individualPageStylesShowLabels[pageNumber] = newIndex;
    if (labelUpdateTimeoutRef.current !== null) {
      clearTimeout(labelUpdateTimeoutRef.current.timer);
      if (labelUpdateTimeoutRef.current.pageNum !== pageNumber) {
        individualPageStylesShowLabels[labelUpdateTimeoutRef.current.pageNum] = undefined;
      }
    }
    labelUpdateTimeoutRef.current = {
      timer: setTimeout(() => {
        individualPageStylesShowLabels[pageNumber] = undefined;
        setIndividualPageStylesShowLabels([...individualPageStylesShowLabels]);
      }, 500),
      pageNum: pageNumber,
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
      <div className="flex flex-col gap-1.5 mt-6 mb-7 md:mt-5 md:mb-4 md:w-[728px]">
        <div className="flex flex-row items-center">
          <p className="font-semibold">Display options</p>
          <IconButton
            icon={MdQuestionMark}
            variant="naked"
            className="-mt-0.5"
            onClick={() => setIsShowingExplanation(!isShowingExplanation)}
          />
        </div>

        {isShowingExplanation && (
          <div className="text-sm -mt-2 mb-2 flex flex-col gap-2">
            <p>
              The various page fit options can be used to adjust how the comic pages are
              displayed relative to your screen size.
            </p>
            <p>
              Depending on screen and page sizes, some of them might have the same
              results.
            </p>
            <p>
              With "tap pages to cycle display" enabled, you can tap or click each page to
              cycle through the display options for that page only.
            </p>
            <p>
              "Reverse page order" might be useful if you're returning to catch up on
              ongoing comics you've been following, especially if your connection is slow,
              as this will make the last pages load immediately.
            </p>
          </div>
        )}

        <div className="flex flex-row gap-2 flex-wrap items-center">
          {pageDisplays.map(display => (
            <Button
              key={display}
              onClick={() => onChangeDisplay(display)}
              text={display}
              className="!py-1 !px-2 font-normal"
            />
          ))}
        </div>

        <div className="flex flex-row flex-wrap gap-x-8 gap-y-1">
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
              className="!py-1 !px-2 font-normal"
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
      </div>

      {children}

      <div className="gap-4 mt-4 flex flex-col items-center w-full">
        {Array.from({ length: comic.numberOfPages }, (_, i) => (
          <div key={i} className="relative">
            <img
              src={`${pagesPath}/${comic.name}/${padPageNumber(currentIsReverseOrder ? comic.numberOfPages - i : i + 1)}.jpg`}
              alt={`Page ${i + 1}`}
              className="comicPage"
              style={getPageStyle(i)}
              onClick={() => onPageClick(i)}
            />
            {/* abc */}
            {/* <div className="w-[400px] h-[600px] bg-gray-800 flex items-center justify-center">
              <p>Page {i + 1}</p>
            </div> */}

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
