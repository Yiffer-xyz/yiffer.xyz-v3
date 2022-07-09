import { useMemo, useState, useRef, useEffect } from 'react';

// TODO Add keyboard listeners for up/down to move selected item,
// and space/enter to select and open the menu. Like in old yiffer.

export default function Select({
  options,
  title = '',
  value,
  onChange,
  error = false,
  maxWidth = 999999,
  isFullWidth = false,
  initialWidth = 0, // TODO needed?
  className = '',
  ...props
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [minWidth, setMinWidth] = useState(0);
  const [width, setWidth] = useState(0);
  const selectItemContainerRef = useRef('selectItemContainer');

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
    let container = selectItemContainerRef.current;
    if (container && container.children.length > 0) {
      let maxChildWidth = 0;
      for (let child of container.children) {
        if (child.clientWidth > maxChildWidth) {
          maxChildWidth = child.clientWidth;
        }
      }

      if (minWidth > maxWidth) {
        setWidth(maxWidth);
      } else {
        setMinWidth(maxChildWidth);
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
    if (minWidth) {
      return { minWidth: `${minWidth + 16}px` };
    } else if (initialWidth) {
      return { minWidth: `${initialWidth + 16}px` };
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

  async function waitMillisec(millisec) {
    return new Promise(resolve => {
      setTimeout(() => resolve(), millisec);
    });
  }

  function onSelected(clickedValue) {
    onChange(clickedValue);
    setIsOpen(false);
  }

  const convertedOptions = useMemo(() => {
    if (!options || !options.length) {
      return [];
    }
    // Convert string array to {text, value} array
    if (typeof options[0] === 'string') {
      return options.map(text => ({ text: text, value: text }));
    }
    return options;
  }, [options]);

  const borderStyle = error
    ? ''
    : { borderImage: 'linear-gradient(to right, #9aebe7, #adfee0) 1' };

  return (
    <div
      className={`hover:cursor-pointer focus:bg-theme1-primaryTrans
        relative w-fit outline-none h-9 leading-9 pt-3 box-content ${className}`}
      style={{ ...minWidthStyle, ...widthStyle }}
      {...props}
      tabIndex={0}
    >
      {title && <label className="absolute text-sm top-0 left-2">{title}</label>}
      <div // TODO: "selected" from old
        onClick={() => setIsOpen(!isOpen)}
        className={`border border-0 border-b-2 px-2 after:absolute
          after:content-[''] after:bottom-2.5 after:w-0 after:h-0 after:border-5 after:border-transparent
          after:border-t-text-light dark:after:border-t-text-dark after:right-3 ${
            value ? '' : 'text-gray-750'
          }`}
        style={{ ...borderStyle }}
      >
        {value ? convertedOptions.find(x => x.value === value).text : '—'}
      </div>
      <div
        className={`${
          isOpen ? '' : 'invisible'
        } overflow-hidden shadow-lg w-fit min-w-full absolute bg-white dark:bg-gray-400 left-0 right-0 z-40 max-h-80 overflow-y-auto`}
        ref={selectItemContainerRef}
      >
        {convertedOptions.map(({ text, value }) => (
          <div
            key={value}
            onClick={e => onSelected(value)}
            className="z-40 hover:cursor-pointer px-3 whitespace-nowrap hover:bg-gradient-to-r
              hover:from-theme1-primary hover:to-theme2-primary dark:hover:text-text-light"
          >
            {text}
          </div>
        ))}
      </div>
    </div>
  );
}
