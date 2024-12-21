import type { HTMLAttributes } from 'react';
import { useState } from 'react';
import { FaChevronDown } from 'react-icons/fa';

export default function ShowHideBox({
  showButtonText,
  hideButtonText,
  children,
  className,
}: {
  showButtonText: string;
  hideButtonText: string;
  children: React.ReactNode;
  className?: HTMLAttributes<HTMLDivElement>['className'];
}) {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div
      className={[
        showInfo ? 'border-2 border-theme1-primary px-3 py-2' : 'px-0 py-0',
        'transition-[padding]',
        className,
      ].join(' ')}
    >
      <p className="text-left">
        <button
          onClick={() => setShowInfo(!showInfo)}
          className={`w-fit h-fit text-blue-weak-200 dark:text-blue-strong-300 font-semibold
          bg-gradient-to-r from-blue-weak-200 to-blue-weak-200
          dark:from-blue-strong-300 dark:to-blue-strong-300 bg-no-repeat
          focus:no-underline cursor-pointer bg-[length:0%_1px] transition-[background-size]
          duration-200 bg-[center_bottom] hover:bg-[length:100%_1px]`}
        >
          {showInfo ? hideButtonText : showButtonText}
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
