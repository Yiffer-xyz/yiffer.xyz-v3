import { useEffect, useMemo, useRef, useState } from 'react';
import { IoCloseOutline } from 'react-icons/io5';
import { RiCloseLine } from 'react-icons/ri';
import useWindowSize from '~/utils/useWindowSize';

export type BaseMultiSelectProps<T> = {
  options: { text: string; value: T }[];
  equalSingleItemValueFunc?: (a: T, b: T | undefined) => boolean;
  title?: string;
  maxWidth?: number;
  name: string;
  includeClearAll?: boolean;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
};

type FullMultiSelectProps<T> = {
  onChange: (value: T[]) => void;
  value?: T[];
} & BaseMultiSelectProps<T>;

export default function MultiSelect<T>({
  options,
  title = '',
  value,
  onChange,
  equalSingleItemValueFunc,
  maxWidth = 999999,
  name,
  includeClearAll,
  placeholder = '',
  className = '',
  ...props
}: FullMultiSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [minWidth, setMinWidth] = useState(0);
  const [width, setWidth] = useState(0);
  const [areOptionsFullWidth, setAreOptionsFullWidth] = useState(false);
  const selectItemContainerRef = useRef<HTMLDivElement>(null);
  const [currentlyHighlightedIndex, setCurrentlyHighlightedIndex] = useState(-1);

  const { isMobile } = useWindowSize();

  useEffect(() => {
    tryComputeWidth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (searchText && !isOpen) {
      setIsOpen(true);
    }
    setCurrentlyHighlightedIndex(-1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);

  const availableOptions = useMemo(() => {
    if (!value && !searchText) {
      return options;
    }

    return options.filter(option => {
      let isValidOption = true;
      if (searchText) {
        isValidOption = option.text.toLowerCase().includes(searchText.toLowerCase());
      }

      if (value) {
        if (equalSingleItemValueFunc) {
          isValidOption =
            isValidOption &&
            !value.find(val => equalSingleItemValueFunc(option.value, val));
        } else {
          isValidOption = isValidOption && !value.find(val => val === option.value);
        }
      }

      return isValidOption;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options, value, searchText]);

  async function tryComputeWidth() {
    let isFinished = false;
    while (!isFinished) {
      await waitMillisec(25);
      isFinished = computeWidth();
    }
    setAreOptionsFullWidth(true);
  }

  function computeWidth() {
    const container = selectItemContainerRef.current;
    if (container && container.children.length > 0) {
      let maxChildWidth = 0;
      for (const child of container.children) {
        if (child.clientWidth > maxChildWidth) {
          maxChildWidth = child.clientWidth;
        }
      }

      if (minWidth > (maxWidth as number)) {
        setWidth(maxWidth as number);
      } else {
        setMinWidth(maxChildWidth);
      }

      return true;
    } else {
      return false;
    }
  }

  const minWidthStyle = useMemo(() => {
    if (width) {
      return {};
    }
    if (minWidth) {
      return { minWidth: `${minWidth + 16}px` };
    }
    return {};
  }, [minWidth, width]);

  const widthStyle = useMemo(() => {
    if (width) {
      return { width };
    }
    return { width: '100%' };
  }, [width]);

  async function waitMillisec(millisec: number) {
    return new Promise<void>(resolve => {
      setTimeout(() => resolve(), millisec);
    });
  }

  function onSelected(clickedValue: T) {
    const newValues = [...(value ?? []), clickedValue];
    onChange(newValues);
    clearAndCloseSearch();
  }

  function onDeselected(clickedValue: T) {
    const newValues = (value ?? []).filter(val => val !== clickedValue);
    onChange(newValues);
  }

  function getTextFromValue(value: T) {
    if (equalSingleItemValueFunc) {
      return options.find(option => equalSingleItemValueFunc(option.value, value))?.text;
    }
    return options.find(option => option.value === value)?.text;
  }

  function removeAllSelected() {
    onChange([]);
    setHighlightedIndex(-1);
  }

  function clearAndCloseSearch({ avoidIfHighlighted = false } = {}) {
    if (avoidIfHighlighted && currentlyHighlightedIndex !== -1) {
      return;
    }
    setSearchText('');
    setIsOpen(false);
    setHighlightedIndex(-1);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      if (currentlyHighlightedIndex !== -1 && availableOptions.length > 0) {
        onSelected(availableOptions[currentlyHighlightedIndex].value);
      } else if (
        currentlyHighlightedIndex === -1 &&
        availableOptions.length > 0 &&
        isOpen
      ) {
        onSelected(availableOptions[0].value);
      }
    } else if (event.key === 'ArrowDown') {
      if (!isOpen) {
        setIsOpen(true);
        setHighlightedIndex(0);
      } else if (currentlyHighlightedIndex === availableOptions.length - 1) {
        setHighlightedIndex(0);
      } else {
        setHighlightedIndex(currentlyHighlightedIndex + 1);
      }
    } else if (event.key === 'ArrowUp') {
      if (!isOpen) {
        setIsOpen(true);
        setHighlightedIndex(availableOptions.length - 1);
      } else if (currentlyHighlightedIndex === 0 || currentlyHighlightedIndex === -1) {
        setHighlightedIndex(availableOptions.length - 1);
      } else {
        setHighlightedIndex(currentlyHighlightedIndex - 1);
      }
    } else if (event.key === 'Escape') {
      clearAndCloseSearch();
    }
  }

  function setHighlightedIndex(indexNum: number) {
    if (indexNum !== -1 && selectItemContainerRef.current) {
      const option = selectItemContainerRef.current.children[indexNum];
      if (option) {
        (option as HTMLElement).scrollIntoView({ block: 'nearest', inline: 'start' });
      }
    }

    setCurrentlyHighlightedIndex(indexNum);
  }

  const inputClassname = `text-text-light dark:text-text-dark bg-transparent  px-2 after:absolute
    after:content-[''] after:bottom-2.5 after:w-0 after:h-0 after:border-5 after:border-transparent
    after:border-t-text-light dark:after:border-t-text-dark after:right-3
    placeholder-gray-800 dark:placeholder-gray-700 w-fit min-w-8 flex-grow outline-none`;

  const borderClassname = `border border-0 border-theme1-primary border-b-2
    disabled:border-gray-800 dark:disabled:border-gray-600`;

  return (
    <div
      onKeyDown={onKeyDown}
      className={`hover:cursor-pointer focus:bg-theme1-primaryTrans
        relative w-fit h-fit min-h-9 outline-none leading-9 box-content
        ${title ? 'pt-5' : ''} ${className} ${borderClassname}`}
      style={{
        ...minWidthStyle,
        ...widthStyle,
      }}
      {...props}
    >
      {title && <label className="absolute text-sm top-0 left-2">{title}</label>}

      <div className="flex flex-row gap-1 flex-wrap pr-8">
        {value !== undefined && (
          <>
            {value.map(singleVal => (
              <div
                className={`px-2 bg-theme1-primaryTrans rounded hover:bg-red-trans focus:bg-red-trans
                  flex flex-row items-center h-8 md:h-fit`}
                onClick={() => onDeselected(singleVal)}
                key={JSON.stringify(singleVal)}
              >
                <p className="">{getTextFromValue(singleVal)}</p>

                {isMobile && (
                  <span className="">
                    <IoCloseOutline size={13} className="mt-[1px] -mr-1 ml-0.5" />
                  </span>
                )}
              </div>
            ))}
          </>
        )}

        <input
          type="text"
          autoComplete="off"
          value={searchText || ''}
          name={name}
          onChange={e => setSearchText(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onClick={() => setIsOpen(true)}
          className={inputClassname}
          placeholder={placeholder}
          onBlur={() => clearAndCloseSearch({ avoidIfHighlighted: true })}
        />
      </div>

      {/* CLEAR CROSS ICON */}
      {value && value.length > 0 && includeClearAll && (
        <span
          className="absolute right-2 -top-[1px] hover:cursor-pointer"
          onClick={removeAllSelected}
        >
          <RiCloseLine />
        </span>
      )}

      {/* OPTIONS */}
      <div
        className={`${
          isOpen ? '' : 'invisible'
        } overflow-hidden shadow-lg w-fit min-w-full absolute bg-white dark:bg-gray-400 left-0 right-0 z-40 max-h-80 overflow-y-auto`}
        ref={selectItemContainerRef}
      >
        {availableOptions.map(({ text, value: optionValue }, index) => (
          <div
            key={text}
            onClick={() => onSelected(optionValue)}
            onMouseEnter={() => setHighlightedIndex(index)}
            onMouseLeave={() => setHighlightedIndex(-1)}
            className={`z-40 hover:cursor-pointer px-3 whitespace-nowrap 
              ${areOptionsFullWidth ? 'w-full' : 'w-fit'}
              ${
                currentlyHighlightedIndex === index
                  ? 'bg-gradient-to-r from-theme1-primary to-theme2-primary text-text-light '
                  : ''
              }}
            `}
          >
            <p>{text}</p>
          </div>
        ))}
        {options.length === 0 && (
          <div
            className={`z-40 px-3 whitespace-nowrap text-gray-700 hover:cursor-default ${
              areOptionsFullWidth ? 'w-full' : 'w-fit'
            }`}
            onClick={() => setSearchText('')}
          >
            No results
          </div>
        )}
      </div>
    </div>
  );
}
