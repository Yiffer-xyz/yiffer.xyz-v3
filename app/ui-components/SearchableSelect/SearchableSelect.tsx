import { useEffect, useMemo, useRef, useState } from 'react';
import { RiCloseLine } from 'react-icons/ri';
import useWindowSize from '~/utils/useWindowSize';

type keyValOptions<T> = { text: string; value: T };

export type BaseSearchableSelectProps<T> = {
  options: { text: string; value: T }[];
  title?: string;
  error?: boolean;
  maxWidth?: number;
  isFullWidth?: boolean;
  initialWidth?: number;
  placeholder?: string;
  name: string;
  disabled?: boolean;
  mobileCompact?: boolean;
  equalValueFunc?: (a: T, b: T | undefined) => boolean;
  className?: string;
};

type FullSelectProps<T> = {
  onChange: (value: T) => void;
  onValueCleared: () => void;
  value?: T;
} & BaseSearchableSelectProps<T>;

export default function SearchableSelect<T>({
  options,
  title = '',
  value,
  onValueCleared,
  onChange,
  error = false,
  maxWidth = 999999,
  isFullWidth = false,
  initialWidth = 0, // TODO needed?
  placeholder = '',
  name,
  disabled = false,
  mobileCompact = false,
  equalValueFunc,
  className = '',
  ...props
}: FullSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [minWidth, setMinWidth] = useState(0);
  const [width, setWidth] = useState(0);
  const [currentlyHighlightedIndex, setCurrentlyHighlightedIndex] = useState(-1);
  const windowSize = useWindowSize();
  const selectItemContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const windowWidth: number = windowSize.width || 0;

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

  async function tryComputeWidth() {
    let isFinished = false;
    while (!isFinished) {
      await waitMillisec(25);
      isFinished = computeWidth();
    }
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
    }

    return false;
  }

  const minWidthStyle = useMemo(() => {
    if (width || isFullWidth) {
      return {};
    }
    if (minWidth) {
      return { minWidth: `${minWidth + 0}px` };
    } else if (initialWidth) {
      return { minWidth: `${initialWidth + 0}px` };
    }
    return {};
  }, [initialWidth, isFullWidth, minWidth, width]);

  const widthStyle = useMemo(() => {
    if (isFullWidth) {
      return { width: '100%' };
    }
    if (width) {
      return { width: `${width}px` };
    }
    return {};
  }, [isFullWidth, width]);

  async function waitMillisec(millisec: number) {
    return new Promise<void>(resolve => {
      setTimeout(() => resolve(), millisec);
    });
  }

  function onSelected(clickedValue: T) {
    onChange(clickedValue);
    clearAndCloseSearch();
  }

  function clearAndCloseSearch({ avoidIfHighlighted = false } = {}) {
    if (avoidIfHighlighted && currentlyHighlightedIndex !== -1) {
      return;
    }
    setSearchText('');
    setIsOpen(false);
    setHighlightedIndex(-1);
    inputRef.current?.blur();
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      if (currentlyHighlightedIndex !== -1 && filteredOptions.length > 0) {
        onSelected(filteredOptions[currentlyHighlightedIndex].value);
      } else if (
        currentlyHighlightedIndex === -1 &&
        filteredOptions.length > 0 &&
        isOpen
      ) {
        onSelected(filteredOptions[0].value);
      }
    } else if (event.key === 'ArrowDown') {
      if (!isOpen) {
        setIsOpen(true);
        setHighlightedIndex(0);
      } else if (currentlyHighlightedIndex === filteredOptions.length - 1) {
        setHighlightedIndex(0);
      } else {
        setHighlightedIndex(currentlyHighlightedIndex + 1);
      }
    } else if (event.key === 'ArrowUp') {
      if (!isOpen) {
        setIsOpen(true);
        setHighlightedIndex(filteredOptions.length - 1);
      } else if (currentlyHighlightedIndex === 0 || currentlyHighlightedIndex === -1) {
        setHighlightedIndex(filteredOptions.length - 1);
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

  const filteredOptions = useMemo<keyValOptions<T>[]>(() => {
    if (!searchText) {
      return options;
    }
    return options.filter(option => {
      return option.text.toLowerCase().includes(searchText.toLowerCase());
    });
  }, [options, searchText]);

  function onFilledInputActivated() {
    onValueCleared();
    setIsOpen(true);
  }

  const convertedValue = useMemo(() => {
    if (equalValueFunc) {
      return options.find(option => equalValueFunc(option.value, value));
    }
    return options.find(option => option.value === value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options, value]);

  const borderStyle =
    error || disabled
      ? ''
      : { borderImage: 'linear-gradient(to right, #9aebe7, #adfee0) 1' };

  const inputClassname = `text-text-light dark:text-text-dark bg-transparent border border-0 border-b-2 px-2 after:absolute
    disabled:border-gray-800 dark:disabled:border-gray-600
    after:content-[''] after:bottom-2.5 after:w-0 after:h-0 after:border-5 after:border-transparent
    after:border-t-text-light dark:after:border-t-text-dark after:right-3
    placeholder-gray-800 dark:placeholder-gray-700 w-full outline-none`;

  return (
    <div
      onKeyDown={onKeyDown}
      className={`hover:cursor-pointer focus:bg-theme1-primaryTrans
        relative w-fit outline-none h-9 leading-9 pt-3 box-content ${className}`}
      style={{ ...minWidthStyle, ...widthStyle }}
      {...props}
    >
      {title && <label className="absolute text-sm top-0 left-2">{title}</label>}

      {value ? (
        <input
          type="text"
          autoComplete="off"
          value={convertedValue?.text || ''}
          disabled={disabled}
          style={{ ...borderStyle }}
          onFocus={onFilledInputActivated}
          className={inputClassname}
          onChange={() => null}
        />
      ) : (
        <input
          type="text"
          autoComplete="off"
          value={searchText || ''}
          disabled={disabled}
          name={name}
          onChange={e => setSearchText(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onClick={() => setIsOpen(true)}
          style={{ ...borderStyle }}
          className={inputClassname}
          placeholder={placeholder}
          onBlur={() => clearAndCloseSearch({ avoidIfHighlighted: true })}
          ref={inputRef}
        />
      )}

      {value && (
        <span
          className="absolute right-2 top-3 hover:cursor-pointer"
          onClick={onValueCleared}
        >
          <RiCloseLine />
        </span>
      )}

      <div
        className={`${
          isOpen ? '' : 'invisible'
        } overflow-hidden shadow-lg w-fit min-w-full absolute bg-white dark:bg-gray-400 left-0 right-0 z-40 max-h-80 overflow-y-auto`}
        ref={selectItemContainerRef}
      >
        {filteredOptions.map(({ text, value: optionValue }, index) => (
          <div
            key={text}
            onClick={() => onSelected(optionValue)}
            onMouseEnter={() => setHighlightedIndex(index)}
            onMouseLeave={() => setHighlightedIndex(-1)}
            className={`z-40 hover:cursor-pointer px-3 whitespace-nowrap  ${
              currentlyHighlightedIndex === index
                ? 'bg-gradient-to-r from-theme1-primary to-theme2-primary text-text-light '
                : ''
            }}`}
          >
            <p className={mobileCompact && windowWidth < 460 ? 'text-sm leading-7' : ''}>
              {text}
            </p>
          </div>
        ))}
        {filteredOptions.length === 0 && (
          <div
            className="z-40 px-3 whitespace-nowrap text-gray-700 hover:cursor-default"
            onClick={() => clearAndCloseSearch()}
          >
            No results
          </div>
        )}
      </div>

      <input
        type="text"
        name={name}
        value={convertedValue?.text || ''}
        disabled={disabled}
        onChange={() => null}
        readOnly
        hidden
      />
    </div>
  );
}
