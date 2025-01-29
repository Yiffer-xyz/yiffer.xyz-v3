import type { HTMLAttributes } from 'react';
import { useState } from 'react';
import { FaChevronDown } from 'react-icons/fa';

export default function ShowHideBox({
  showButtonText,
  hideButtonText,
  showHideClassName,
  showHideColorClassName,
  border = true,
  underline = true,
  children,
  onExpand,
  openClassName,
  className,
}: {
  showButtonText: string;
  hideButtonText?: string;
  showHideClassName?: HTMLAttributes<HTMLDivElement>['className'];
  showHideColorClassName?: HTMLAttributes<HTMLDivElement>['className'];
  border?: boolean;
  underline?: boolean;
  children: React.ReactNode;
  onExpand?: () => void;
  openClassName?: HTMLAttributes<HTMLDivElement>['className'];
  className?: HTMLAttributes<HTMLDivElement>['className'];
}) {
  const [showInfo, setShowInfo] = useState(false);

  const underlineClass = underline
    ? `bg-[length:0%_1px] transition-[background-size] duration-200 bg-[center_bottom] 
      hover:bg-[length:100%_1px] bg-gradient-to-r from-blue-weak-200 to-blue-weak-200
      dark:from-blue-strong-300 dark:to-blue-strong-300 bg-no-repeat
      focus:no-underline`
    : '';

  return (
    <div
      className={[
        showInfo
          ? border
            ? 'border-2 border-theme1-primary px-3 py-2'
            : ''
          : 'px-0 py-0',
        'transition-[padding]',
        className,
        openClassName && showInfo ? openClassName : '',
      ].join(' ')}
    >
      <p className={`text-left ${showHideClassName ?? ''}`}>
        <button
          onClick={() => {
            setShowInfo(!showInfo);
            onExpand?.();
          }}
          className={`w-fit h-fit text-blue-weak-200 dark:text-blue-strong-300 font-semibold
          cursor-pointer text-left ${underlineClass} ${showHideColorClassName ?? ''}`}
        >
          {showInfo ? (hideButtonText ?? showButtonText) : showButtonText}
          <FaChevronDown
            size={10}
            className={`mb-[2px] ml-0.5 inline-block transition-transform ${
              showInfo ? '-rotate-180' : ''
            }`}
          />
        </button>
      </p>

      {showInfo && children}
    </div>
  );
}
