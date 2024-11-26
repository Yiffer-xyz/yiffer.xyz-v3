type Props<T> = {
  options: { text: string; description?: string; value: T; children?: React.ReactNode }[];
  value?: T;
  onChange: (value: T) => void;
  fullWidthMobile?: boolean;
  equalWidth?: boolean;
};

export default function SelectBoxes<T>({
  options,
  value,
  onChange,
  fullWidthMobile,
  equalWidth,
}: Props<T>) {
  return (
    <div
      className={`
      ${equalWidth ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'flex flex-wrap'} 
      gap-2
    `}
    >
      {options.map(option => (
        <button
          key={String(option.text)}
          onClick={() => onChange(option.value)}
          className={`
            px-3 py-1.5 rounded border-3 transition-colors cursor-pointer
            bg-white dark:bg-gray-300
            ${fullWidthMobile ? 'w-full md:w-fit' : ''}
            ${value === option.value ? 'border-theme1-dark' : 'border-gray-900 dark:border-gray-500'}
          `}
        >
          <div>
            <div>{option.text}</div>
            {option.description && (
              <div className="text-sm text-gray-600 dark:text-gray-800">
                {option.description}
              </div>
            )}
            {option.children}
          </div>
        </button>
      ))}
    </div>
  );
}
