import { useState } from 'react';

export type BaseRadioButtonGroupProps<T> = {
  options: { text: string; value: T }[];
  title?: string;
  name: string;
  direction?: 'vertical' | 'horizontal';
  disabled?: boolean;
  className?: string;
};

type FullRadioButtonGroupProps<T> = {
  onChange: (value: T) => void;
  value?: T;
} & BaseRadioButtonGroupProps<T>;

export default function RadioButtonGroup<T>({
  options,
  title,
  name,
  direction = 'vertical',
  value,
  disabled = false,
  onChange,
  className = '',
}: FullRadioButtonGroupProps<T>) {
  const [currentlyHighlightedIndex, setCurrentlyHighlightedIndex] = useState(-1);

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>, index: number) {
    if (event.key !== 'Tab') {
      event.stopPropagation();
      event.preventDefault();
    }
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      let newIndex = currentlyHighlightedIndex;
      if (event.key === 'ArrowUp') {
        newIndex--;
      } else {
        newIndex++;
      }
      if (newIndex < 0) {
        newIndex = options.length - 1;
      } else if (newIndex >= options.length) {
        newIndex = 0;
      }
      setCurrentlyHighlightedIndex(newIndex);
    }
    if (event.key === 'Enter' || event.key === ' ') {
      onChange(options[index].value);
    }
  }

  const wrapperClassName =
    direction === 'vertical' ? 'flex flex-col gap-2' : 'flex flex-row gap-6';

  return (
    <>
      <div className={`flex flex-col ${className}`}>
        {title && <label className="mb-2">{title}</label>}
        <div className={wrapperClassName} onBlur={() => setCurrentlyHighlightedIndex(-1)}>
          {options.map((option, index) => (
            <div
              key={index}
              className="flex flex-row items-center cursor-pointer outline-none"
              onClick={() => !disabled && onChange(option.value)}
              onKeyDown={e => onKeyDown(e, index)}
              tabIndex={0}
              onFocus={() => setCurrentlyHighlightedIndex(index)}
            >
              <div
                className={`flex flex-shrink-0 items-center justify-center w-5 h-5 rounded-full border-[1.5px]
                border-gray-800 dark:border-gray-600 
              ${
                currentlyHighlightedIndex === index && !disabled
                  ? ' bg-theme1-primaryTrans '
                  : ''
              } ${disabled ? 'bg-gray-900 dark:bg-gray-300' : ''}`}
              >
                {value === option.value && (
                  <div
                    className={`w-2 h-2 rounded-full ${
                      disabled
                        ? 'bg-theme1-300 dark:bg-theme1-500'
                        : 'bg-theme1-dark dark:bg-theme1-primary'
                    }`}
                  />
                )}
              </div>
              <div className="ml-1.5 text-sm">{option.text}</div>
            </div>
          ))}
        </div>
      </div>
      <input type="hidden" name={name} value={value?.toString() || ''} />
    </>
  );
}
