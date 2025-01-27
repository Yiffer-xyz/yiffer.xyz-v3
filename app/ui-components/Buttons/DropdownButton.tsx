import { useEffect, useRef, useState } from 'react';
import { IoCaretDown } from 'react-icons/io5';
import { waitMillisec } from '~/utils/general';
import type { ButtonProps } from './Button';
import Button from './Button';
import clsx from 'clsx';

type DropdownButtonProps = {
  options: { text: string; onClick: () => void }[];
  isLoading?: boolean;
  text: string;
} & Omit<ButtonProps, 'onClick' | 'endIcon'>;

export default function DropdownButton({
  options,
  isLoading,
  text,
  ...props
}: DropdownButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentlyHighlightedIndex, setCurrentlyHighlightedIndex] = useState(-1);
  const [width, setWidth] = useState<number>();
  const [areChildrenWider, setAreChildrenWider] = useState(false);
  const itemsContainerRef = useRef<HTMLDivElement>(null);
  const mainButtonRef = useRef<HTMLButtonElement>(null);
  const closeTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    tryComputeWidth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setCurrentlyHighlightedIndex(-1);
  }, [isOpen]);

  function closeSoonIfOpen() {
    closeTimeout.current = setTimeout(() => {
      if (isOpen) {
        setIsOpen(false);
      }
    }, 300);
  }

  function cancelCloseTimeout() {
    if (closeTimeout.current) {
      clearTimeout(closeTimeout.current);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Tab' || e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setCurrentlyHighlightedIndex(
        currentlyHighlightedIndex === options.length - 1
          ? 0
          : currentlyHighlightedIndex + 1
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setCurrentlyHighlightedIndex(
        currentlyHighlightedIndex === 0 || currentlyHighlightedIndex === -1
          ? options.length - 1
          : currentlyHighlightedIndex - 1
      );
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        return;
      }
      if (currentlyHighlightedIndex === -1) {
        setIsOpen(false);
      } else {
        options[currentlyHighlightedIndex].onClick();
        setIsOpen(false);
      }
    }
  }

  // To make sure button and children have the same width
  async function tryComputeWidth() {
    let isFinished = false;
    while (!isFinished) {
      await waitMillisec(25);
      isFinished = computeWidth();
    }
  }

  function computeWidth() {
    const container = itemsContainerRef.current;
    const button = mainButtonRef.current;
    if (container && button && container.children.length > 0) {
      let maxChildWidth = 0;
      for (const child of container.children) {
        if (child.clientWidth > maxChildWidth) {
          maxChildWidth = child.clientWidth;
        }
      }
      const buttonWidth = button.clientWidth;
      const areChildrenWider = maxChildWidth > buttonWidth;
      setAreChildrenWider(areChildrenWider);
      setWidth(Math.max(maxChildWidth, buttonWidth));

      return true;
    } else {
      return false;
    }
  }

  const buttonStyle = width && areChildrenWider ? { width } : {};

  return (
    <div
      className={clsx(`relative inline-block text-left`, props.className)}
      onKeyDown={onKeyDown}
    >
      <Button
        {...props}
        text={text}
        endIcon={isLoading ? Spinner : IoCaretDown}
        onClick={e => {
          if (isLoading) return;
          setIsOpen(isOpenCurrently => !isOpenCurrently);
          e.stopPropagation();
        }}
        onMouseLeave={() => closeSoonIfOpen}
        onMouseEnter={cancelCloseTimeout}
        style={{ ...buttonStyle, ...props.style }}
        buttonRef={mainButtonRef}
        onBlur={() => {
          if (currentlyHighlightedIndex === -1) {
            setTimeout(() => setIsOpen(false), 50);
          }
        }}
        className={isLoading ? 'opacity-70' : ''}
      />
      <div
        className={`
          origin-top-right absolute left-0 shadow-lg bg-white dark:bg-gray-400 focus:outline-none rounded
          overflow-hidden z-10
          ${isOpen ? '' : 'invisible'}`}
        onMouseLeave={closeSoonIfOpen}
        onMouseEnter={cancelCloseTimeout}
      >
        <div
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="options-menu"
          ref={itemsContainerRef}
        >
          {options.map((option, index) => (
            <div
              key={index}
              className={`
                  block w-full text-left px-3 py-2 text-sm cursor-pointer whitespace-nowrap
                  font-semibold text-blue-weak-100 dark:text-text-dark
                  ${
                    index === currentlyHighlightedIndex
                      ? 'bg-blue-trans dark:bg-gray-600 '
                      : ''
                  }
                `}
              role="menuitem"
              onMouseEnter={() => setCurrentlyHighlightedIndex(index)}
              onMouseLeave={() => setCurrentlyHighlightedIndex(-1)}
              onClick={e => {
                e.stopPropagation();
                option.onClick();
                setIsOpen(false);
              }}
              style={width ? { width } : {}}
            >
              {option.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const Spinner = () => (
  <div className="ml-2 w-4 h-4 animate-spin border-solid border-transparent border-r-white border rounded-full" />
);
