import { useEffect, useMemo, useRef, useState } from 'react';
import { RiCloseLine } from 'react-icons/ri';
import { colors } from 'tailwind.config';
import useWindowSize from '~/utils/useWindowSize';

type keyValOptions<T> = { text: string; value: T };

export type BaseSearchableSelectProps<T> = {
  options: { text: string; value: T }[];
  title?: string;
  clearOnFocus?: boolean;
  clearOnSelect?: boolean;
  error?: boolean;
  maxWidth?: number;
  mobileFullWidth?: boolean;
  placeholder?: string;
  name?: string;
  disabled?: boolean;
  equalValueFunc?: (a: T, b: T | undefined) => boolean;
  className?: string;
  style?: React.CSSProperties;
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
  clearOnFocus,
  clearOnSelect,
  onChange,
  error = false,
  maxWidth = 999999,
  mobileFullWidth: mobileFullWidthProp = false,
  placeholder = '',
  name,
  disabled = false,
  equalValueFunc,
  className = '',
  ...props
}: FullSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [minWidth, setMinWidth] = useState(0);
  const [width, setWidth] = useState(0);
  const [currentlyHighlightedIndex, setCurrentlyHighlightedIndex] = useState(-1);
  const selectItemContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { isMobile } = useWindowSize();
  const mobileFullWidth = mobileFullWidthProp && isMobile;

  useEffect(() => {
    tryComputeWidth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
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
    if (width || mobileFullWidth) {
      return {};
    }
    if (minWidth) {
      return { minWidth: `${minWidth}px` };
    }
    return {};
  }, [mobileFullWidth, minWidth, width]);

  const widthStyle = useMemo(() => {
    if (mobileFullWidth && isMobile) {
      return { width: '100%' };
    }
    if (width) {
      return { width: `${width}px` };
    }
    return {};
  }, [mobileFullWidth, isMobile, width]);

  async function waitMillisec(millisec: number) {
    return new Promise<void>(resolve => {
      setTimeout(() => resolve(), millisec);
    });
  }

  function onSelected(text: string, clickedValue: T) {
    setSearchText(text);
    setIsOpen(false);
    onChange(clickedValue);
    if (clearOnSelect) {
      setSearchText('');
    }
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
        const { text, value } = filteredOptions[currentlyHighlightedIndex];
        onSelected(text, value);
      } else if (
        currentlyHighlightedIndex === -1 &&
        filteredOptions.length > 0 &&
        isOpen
      ) {
        const { text, value } = filteredOptions[0];
        onSelected(text, value);
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
    } else {
      setIsOpen(true);
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

  function onClearClicked() {
    onValueCleared();
    setSearchText('');
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
    if (clearOnFocus) {
      setSearchText('');
    }
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
      : {
          borderImage: `linear-gradient(to right, ${colors.theme1.primary}, ${colors.theme2.primary}) 1`,
        };

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
          onBlur={() => {
            // On mobile, this sometimes happens when clicking an option, before the click triggers,
            // closing the dropdown. Timeout is a hack to prevent this.
            setTimeout(() => {
              clearAndCloseSearch({ avoidIfHighlighted: true });
            }, 10);
          }}
          ref={inputRef}
        />
      )}

      {value && (
        <span
          className="absolute right-2 top-3 hover:cursor-pointer"
          onClick={onClearClicked}
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
            onClick={() => onSelected(text, optionValue)}
            onMouseEnter={() => setHighlightedIndex(index)}
            onMouseLeave={() => setHighlightedIndex(-1)}
            className={`z-40 hover:cursor-pointer px-3 py-[9px] whitespace-nowrap text-wrap md:text-nowrap leading-[1rem] ${
              currentlyHighlightedIndex === index
                ? 'bg-gradient-to-r from-theme1-primary to-theme2-primary text-text-light '
                : ''
            }`}
          >
            <p>{text}</p>
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
