import { useEffect, useMemo, useRef, useState } from 'react';
import { colors } from 'tailwind.config';
import { waitMillisec } from '~/utils/general';

export type BaseSelectProps<T> = {
  options: { text: string; value: T }[];
  title?: string;
  error?: boolean;
  maxWidth?: number;
  minWidth?: number;
  isFullWidth?: boolean;
  name: string;
  className?: string;
  style?: React.CSSProperties;
};

type FullSelectProps<T> = {
  onChange: (value: T) => void;
  value?: T;
} & BaseSelectProps<T>;

export default function Select<T>({
  options,
  title = '',
  value,
  onChange,
  error = false,
  maxWidth = 999999,
  minWidth = 0,
  isFullWidth = false,
  name,
  className = '',
  ...props
}: FullSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [computedMinWidth, setComputedMinWidth] = useState(0);
  const [shouldAddRightPadding, setShouldAddRightPadding] = useState(false);
  const [width, setWidth] = useState(0);
  const [currentlyHighlightedIndex, setCurrentlyHighlightedIndex] = useState(-1);
  const selectItemContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    tryComputeWidth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setCurrentlyHighlightedIndex(-1);
  }, [isOpen]);

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

      if (computedMinWidth > (maxWidth as number)) {
        setWidth(maxWidth as number);
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
    if (width || isFullWidth) {
      return {};
    }
    if (computedMinWidth) {
      return { minWidth: computedMinWidth + (shouldAddRightPadding ? 16 : 0) };
    }
    if (minWidth) {
      return { minWidth: minWidth };
    }
    return {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFullWidth, computedMinWidth, minWidth, width]);

  const widthStyle = useMemo(() => {
    if (isFullWidth) {
      return { width: '100%' };
    }
    if (width) {
      return { width: width };
    }
    return {};
  }, [isFullWidth, width]);

  function onSelected(clickedValue: any) {
    onChange(clickedValue);
    setIsOpen(false);
  }

  const convertedValue = useMemo(() => {
    return options.find(option => option.value === value);
  }, [options, value]);

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

  return (
    <div
      onKeyDown={onKeyDown}
      className={`hover:cursor-pointer focus:bg-theme1-primaryTrans
        relative w-fit outline-none h-9 leading-9 box-content ${className} ${title ? 'pt-3' : ''}`}
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
          after:border-t-text-light dark:after:border-t-text-dark after:right-3 ${
            value ? '' : 'text-gray-750'
          }`}
        style={{ ...borderStyle }}
      >
        {(value && options.find(x => x.value === value)?.text) || '—'}
      </div>
      <div
        className={`${
          isOpen ? '' : 'invisible'
        } overflow-hidden shadow-lg w-fit min-w-full absolute bg-white dark:bg-gray-400 left-0 right-0 z-40 max-h-80 overflow-y-auto`}
        ref={selectItemContainerRef}
      >
        {options.map(({ text, value: optionValue }, index) => (
          <div
            key={text}
            onMouseEnter={() => setHighlightedIndex(index)}
            onMouseLeave={() => setHighlightedIndex(-1)}
            onClick={e => onSelected(optionValue)}
            className={`z-40 hover:cursor-pointer px-3 whitespace-nowrap  ${
              currentlyHighlightedIndex === index
                ? 'bg-gradient-to-r from-theme1-primary to-theme2-primary text-text-light '
                : ''
            }}`}
          >
            {text}
          </div>
        ))}
      </div>

      <input
        type="text"
        name={name}
        value={convertedValue?.text || ''}
        onChange={() => null}
        hidden
      />
    </div>
  );
}
