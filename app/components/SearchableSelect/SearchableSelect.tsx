import { useMemo, useState, useRef, useEffect } from 'react';
import { RiCloseLine } from 'react-icons/ri';
type keyValOptions = { text: string; value: any };

export type BaseSearchableSelectProps = {
  options: string[] | { text: string; value: any }[];
  title?: string;
  error?: boolean;
  maxWidth?: number;
  isFullWidth?: boolean;
  initialWidth?: number;
  name: string;
  disabled?: boolean;
  className?: string;
};

type FullSelectProps = {
  onChange: (value: any) => void;
  onValueCleared: () => void;
  value?: any;
} & BaseSearchableSelectProps;

export default function SearchableSelect({
  options,
  title = '',
  value,
  onValueCleared,
  onChange,
  error = false,
  maxWidth = 999999,
  isFullWidth = false,
  initialWidth = 0, // TODO needed?
  name,
  disabled = false,
  className = '',
  ...props
}: FullSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [minWidth, setMinWidth] = useState(0);
  const [width, setWidth] = useState(0);
  const selectItemContainerRef = useRef<HTMLDivElement>(null);
  const [lastChangeTime, setLastChangeTime] = useState(0);

  useEffect(() => {
    tryComputeWidth();
  }, []);

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

  function onSelected(clickedValue: any) {
    setSearchText('');
    onChange(clickedValue);
    setIsOpen(false);
  }

  const convertedOptions = useMemo<keyValOptions[]>(() => {
    if (!options?.length) {
      return [];
    }
    // Convert string array to {text, value} array
    if (typeof options[0] === 'string') {
      return (options as string[]).map(text => ({ text: text, value: text }));
    }
    return options as keyValOptions[];
  }, [options]);

  const filteredOptions = useMemo<keyValOptions[]>(() => {
    if (!searchText) {
      return convertedOptions;
    }
    return convertedOptions.filter(option => {
      return option.text.toLowerCase().includes(searchText.toLowerCase());
    });
  }, [convertedOptions, searchText]);

  function onFilledInputActivated() {
    onValueCleared();
    setIsOpen(true);
    setLastChangeTime(Date.now());
  }

  const convertedValue = useMemo(() => {
    return convertedOptions.find(option => option.value === value);
  }, [convertedOptions, value]);

  const borderStyle =
    error || disabled
      ? ''
      : { borderImage: 'linear-gradient(to right, #9aebe7, #adfee0) 1' };

  const inputClassname = `text-text-light dark:text-text-dark bg-transparent border border-0 border-b-2 px-2 after:absolute
    disabled:border-gray-800 dark:disabled:border-gray-600
    after:content-[''] after:bottom-2.5 after:w-0 after:h-0 after:border-5 after:border-transparent
    after:border-t-text-light dark:after:border-t-text-dark after:right-3`;

  return (
    <div
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
        />
      ) : (
        <input
          type="text"
          autoComplete="off"
          value={searchText || ''}
          disabled={disabled}
          name={name}
          onChange={e => setSearchText(e.target.value)}
          onClick={() => {
            if (lastChangeTime + 100 < Date.now()) {
              setIsOpen(!isOpen || searchText.length > 0);
            }
          }}
          style={{ ...borderStyle }}
          className={inputClassname}
        />
      )}

      {value && (
        <span
          className="absolute right-4 top-3 hover:cursor-pointer"
          onClick={onFilledInputActivated}
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
        {filteredOptions.map(({ text, value: optionValue }) => (
          <div
            key={optionValue}
            onClick={e => onSelected(optionValue)}
            className="z-40 hover:cursor-pointer px-3 whitespace-nowrap hover:bg-gradient-to-r
              hover:from-theme1-primary hover:to-theme2-primary dark:hover:text-text-light"
          >
            {text}
          </div>
        ))}
        {filteredOptions.length === 0 && (
          <div
            className="z-40 px-3 whitespace-nowrap text-gray-700 hover:cursor-default"
            onClick={() => onSelected(null)}
          >
            No results
          </div>
        )}
      </div>

      <input
        type="text"
        name={name}
        value={value || ''}
        disabled={disabled}
        readOnly
        hidden
      />
    </div>
  );
}
