import { useEffect, useMemo, useRef, useState } from 'react';
import { colors } from 'tailwind.config';
import { waitMillisec } from '~/utils/general';

export type MultiSelectProps<T> = {
  options: { text: string; value: T }[];
  title?: string;
  onValueAdded: (value: T) => void;
  onValueRemoved: (value: T) => void;
  onAllOptionSelected?: () => void;
  values: T[];
  allOption?: { text: string; value: T };
  onClose?: () => void;
  error?: boolean;
  maxWidth?: number;
  minWidth?: number;
  forceWidth?: number;
  isFullWidth?: boolean;
  name: string;
  className?: string;
  style?: React.CSSProperties;
};

export default function MultiSelectDropdown<T>({
  options,
  title = '',
  values,
  allOption,
  onClose = () => null,
  onValueAdded,
  onValueRemoved,
  onAllOptionSelected = () => null,
  error = false,
  maxWidth = 999999,
  minWidth = 0,
  forceWidth,
  isFullWidth = false,
  name,
  className = '',
  ...props
}: MultiSelectProps<T>) {
  const prevIsOpen = useRef(false);
  const [isOpen, setIsOpen] = useState(false);
  const [computedMinWidth, setComputedMinWidth] = useState(0);
  const [shouldAddRightPadding, setShouldAddRightPadding] = useState(false);
  const [width, setWidth] = useState(0);
  const [currentlyHighlightedIndex, setCurrentlyHighlightedIndex] = useState(-1);
  const [upperPartWidth, setUpperPartWidth] = useState(0);
  const selectItemContainerRef = useRef<HTMLDivElement>(null);
  const upperPartRef = useRef<HTMLDivElement>(null);

  const allOptions = useMemo(() => {
    if (allOption) {
      return [allOption, ...options];
    }
    return options;
  }, [allOption, options]);

  useEffect(() => {
    if (forceWidth) return;
    tryComputeInitialWidth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (forceWidth) return;
    computUpperWidth();
  }, [forceWidth, values]);

  useEffect(() => {
    setCurrentlyHighlightedIndex(-1);
    if (prevIsOpen.current && !isOpen) {
      onClose();
    }
    prevIsOpen.current = isOpen;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  async function tryComputeInitialWidth() {
    let isFinished = false;
    while (!isFinished) {
      await waitMillisec(25);
      isFinished = computeInitialWidth();
    }
  }

  function computUpperWidth() {
    const container = upperPartRef.current;
    const widthOfUpperPart = container?.clientWidth || 0;
    setUpperPartWidth(widthOfUpperPart);
  }

  function computeInitialWidth() {
    const container = selectItemContainerRef.current;
    if (container && container.children.length > 0) {
      let maxChildWidth = 0;
      for (const child of container.children) {
        if (child.clientWidth > maxChildWidth) {
          maxChildWidth = child.clientWidth;
        }
      }

      if (computedMinWidth > maxWidth) {
        setWidth(maxWidth);
      } else {
        if (maxChildWidth > minWidth) {
          setShouldAddRightPadding(true);
        }
        setComputedMinWidth(Math.max(maxChildWidth, minWidth));
      }

      return true;
    } else {
      return false;
    }
  }

  const minWidthStyle = useMemo(() => {
    if (width || isFullWidth || forceWidth) {
      return {};
    }

    if (computedMinWidth) {
      if (upperPartWidth > computedMinWidth) {
        return { minWidth: upperPartWidth + 38 };
      }
      return { minWidth: computedMinWidth + (shouldAddRightPadding ? 38 : 0) };
    }
    if (minWidth) {
      if (upperPartWidth > minWidth) {
        return { minWidth: upperPartWidth + 38 };
      }
      return { minWidth: minWidth };
    }
    return {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFullWidth, computedMinWidth, minWidth, width, upperPartWidth, values.length]);

  const widthStyle = useMemo(() => {
    if (forceWidth) {
      return { width: forceWidth };
    }
    if (isFullWidth) {
      return { width: '100%' };
    }
    if (width) {
      return { width: width };
    }
    return {};
  }, [isFullWidth, width, forceWidth]);

  function onSelected(clickedValue: T) {
    if (allOption && clickedValue === allOption.value) {
      onAllOptionSelected();
    } else if (values.includes(clickedValue)) {
      onValueRemoved(clickedValue);
    } else {
      onValueAdded(clickedValue);
    }
  }

  const convertedValue = useMemo(() => {
    return values
      .map(val => allOptions.find(option => option.value === val)?.text)
      .join(', ');
  }, [allOptions, values]);

  function setHighlightedIndex(indexNum: number) {
    if (indexNum !== -1 && selectItemContainerRef.current) {
      const option = selectItemContainerRef.current.children[indexNum];
      if (option) {
        (option as HTMLElement).scrollIntoView({ block: 'nearest', inline: 'start' });
      }
    }

    setCurrentlyHighlightedIndex(indexNum);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'Tab') {
      event.stopPropagation();
      event.preventDefault();
    }
    if (event.key === 'Enter' || event.key === ' ') {
      if (!isOpen) {
        setIsOpen(true);
      } else if (currentlyHighlightedIndex !== -1 && options.length > 0) {
        onSelected(options[currentlyHighlightedIndex].value);
      } else {
        setIsOpen(false);
      }
    } else if (event.key === 'ArrowDown') {
      if (!isOpen) {
        setIsOpen(true);
        setHighlightedIndex(0);
      } else if (currentlyHighlightedIndex === options.length - 1) {
        setHighlightedIndex(0);
      } else {
        setHighlightedIndex(currentlyHighlightedIndex + 1);
      }
    } else if (event.key === 'ArrowUp') {
      if (!isOpen) {
        setIsOpen(true);
        setHighlightedIndex(options.length - 1);
      } else if (currentlyHighlightedIndex === 0 || currentlyHighlightedIndex === -1) {
        setHighlightedIndex(options.length - 1);
      } else {
        setHighlightedIndex(currentlyHighlightedIndex - 1);
      }
    } else if (event.key === 'Escape') {
      setIsOpen(false);
    }
  }

  const borderStyle = error
    ? ''
    : {
        borderImage: `linear-gradient(to right, ${colors.theme1.primary}, ${colors.theme2.primary}) 1`,
      };

  function isValueSelected(value: T) {
    return values.includes(value);
  }

  return (
    <div
      onKeyDown={onKeyDown}
      className={`hover:cursor-pointer focus:bg-theme1-primaryTrans
        relative w-fit outline-none h-9 leading-9 pt-3 box-content ${className}`}
      style={{ ...minWidthStyle, ...widthStyle }}
      {...props}
      tabIndex={0}
      onBlur={() => setIsOpen(false)}
    >
      {title && <label className="absolute text-sm top-0 left-2">{title}</label>}

      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`border-0 border-b-2 px-2 after:absolute
          after:content-[''] after:bottom-2.5 after:w-0 after:h-0 after:border-5 after:border-transparent
          after:border-t-text-light dark:after:border-t-text-dark after:right-3`}
        style={{ ...borderStyle }}
      >
        <div ref={upperPartRef} className="w-fit">
          {convertedValue}
        </div>
      </div>
      <div
        className={`${
          isOpen ? '' : 'invisible'
        } overflow-hidden shadow-lg w-fit min-w-full absolute bg-white dark:bg-gray-400 left-0 right-0 z-40 max-h-80 overflow-y-auto`}
        ref={selectItemContainerRef}
      >
        {allOptions.map(({ text, value: optionValue }, index) => (
          <div
            key={text}
            onMouseEnter={() => setHighlightedIndex(index)}
            onMouseLeave={() => setHighlightedIndex(-1)}
            onClick={e => onSelected(optionValue)}
            className={`z-40 hover:cursor-pointer px-3 whitespace-nowrap  ${
              currentlyHighlightedIndex === index
                ? `bg-gradient-to-r from-theme1-primaryLessTrans to-theme2-primaryLessTrans  
                   dark:from-theme1-primaryTrans dark:to-theme2-primaryTrans `
                : ''
            }}`}
          >
            <span
              className={`${
                isValueSelected(optionValue)
                  ? ' border-b-2 border-theme1-darker2 dark:border-b-3 dark:border-theme1-primary font-semibold'
                  : ''
              }`}
            >
              {text}
            </span>
          </div>
        ))}
      </div>

      <input
        type="text"
        name={name}
        value={convertedValue ?? ''}
        onChange={() => null}
        hidden
      />
    </div>
  );
}
