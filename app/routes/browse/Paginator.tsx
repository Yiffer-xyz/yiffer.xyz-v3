import { useMemo } from 'react';
import { RiArrowLeftLine, RiArrowRightLine } from 'react-icons/ri';
import { useUIPreferences } from '~/utils/theme-provider';
import posthog from 'posthog-js';
import { THEME1, THEME1_DARK, THEME2, THEME2_DARK } from '~/types/constants';

type PaginatorProps = {
  currentPage: number;
  numPages: number;
  onPageChange: (page: number) => void;
  className?: string;
};

export default function Paginator({
  currentPage,
  numPages,
  onPageChange,
  className = '',
}: PaginatorProps) {
  const { theme } = useUIPreferences();

  const paginationButtons = useMemo(() => {
    return getPaginationButtons(currentPage, numPages);
  }, [currentPage, numPages]);

  const selectedButtonClass = 'border-0 border-hidden pt-[5px]';

  const selectedBorderImageStyle = `linear-gradient(to right, ${
    theme === 'light' ? THEME1 : THEME1_DARK
  }, 
    ${theme === 'light' ? THEME2 : THEME2_DARK}) 1`;

  return (
    <div
      className={`mx-auto w-[332px] sm:w-[300px] flex flex-row h-8 text-xs shadow max-w-95p
        dark:bg-gray-300 rounded-xs overflow-hidden ${className}`}
    >
      <button
        className="grow bg-theme1-primary dark:bg-theme1-dark flex items-center justify-center h-full w-2 cursor-pointer"
        onClick={() => {
          if (currentPage >= 2) {
            onPageChange(currentPage - 1);
            posthog.capture('Paginated', {
              page: currentPage - 1,
              source: 'arrow-button',
            });
          }
        }}
      >
        <RiArrowLeftLine className="text-text-light text-sm" />
      </button>
      {paginationButtons.map((btnTxt, i) => {
        const isDots = typeof btnTxt === 'string';
        const isSelected = !isDots && btnTxt === currentPage;

        return (
          <button
            key={currentPage + '-' + i}
            className={`grow flex items-center justify-center h-full cursor-pointer
              ${typeof btnTxt === 'number' && 'hover:bg-theme1-primary-trans'}
              ${isSelected && selectedButtonClass}`}
            style={
              isSelected
                ? {
                    borderBottomStyle: 'solid',
                    borderBottomWidth: '5px',
                    borderImage: selectedBorderImageStyle,
                  }
                : undefined
            }
            onClick={() => {
              if (!isDots) onPageChange(btnTxt as number);
              posthog.capture('Paginated', { page: btnTxt, source: 'number-button' });
            }}
          >
            {btnTxt}
          </button>
        );
      })}
      <button
        className="grow bg-theme2-primary dark:bg-theme2-dark flex items-center justify-center h-full w-2"
        onClick={() => {
          if (currentPage < numPages) {
            onPageChange(currentPage + 1);
            posthog.capture('Paginated', {
              page: currentPage + 1,
              source: 'arrow-button',
            });
          }
        }}
      >
        <RiArrowRightLine className="text-text-light text-sm" />
      </button>
    </div>
  );
}

function getPaginationButtons(
  currentPage: number,
  numPages: number
): Array<number | string> {
  const buttonList: Array<number | string> = [];
  if (numPages <= 9) {
    for (let i = 1; i < numPages + 1; i++) {
      buttonList.push(i);
    }
    return buttonList;
  }
  if (currentPage <= 5) {
    return [1, 2, 3, 4, 5, 6, 7, '...', numPages];
  }
  if (currentPage >= numPages - 4) {
    return [
      1,
      '...',
      numPages - 6,
      numPages - 5,
      numPages - 4,
      numPages - 3,
      numPages - 2,
      numPages - 1,
      numPages,
    ];
  }
  return [
    1,
    '...',
    currentPage - 2,
    currentPage - 1,
    currentPage,
    currentPage + 1,
    currentPage + 2,
    '...',
    numPages,
  ];
}
