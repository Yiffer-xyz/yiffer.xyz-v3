import { type HTMLAttributes } from 'react';
import { FaChevronRight } from 'react-icons/fa';

export type ListButtonItem = {
  onClick?: () => void;
  Icon: React.ElementType;
  title?: string;
  text: string;
  disabled?: boolean;
  color?: 'normal' | 'error';
  iconClassName?: string;
  canVaryHeight?: boolean;
};

export default function ListButtons({
  items,
  className,
}: {
  items: ListButtonItem[];
  className?: HTMLAttributes<HTMLDivElement>['className'];
}) {
  const borderClass =
    'flex flex-row justify-between items-center border-b border-gray-850 dark:border-gray-500 px-3.5 gap-8';
  const errorClass = 'text-red-strong-200 dark:text-red-strong-300';
  const iconErrorClass = 'text-red-weak-200 dark:text-red-weak-300';
  const clickableClass = 'cursor-pointer hover:bg-blue-more-trans';
  const errorClickableClass = 'cursor-pointer hover:bg-red-more-trans';
  const rowTitleClass = 'text-sm text-gray-700 dark:text-gray-750 -mb-1';
  const rowClass = 'flex flex-row gap-3 items-center';
  const chevronClass = 'text-gray-700 dark:text-gray-750 text-xs';
  const iconClass = 'text-gray-500 dark:text-gray-800 mt-0.5';
  const disabledClass = 'opacity-50 cursor-not-allowed';

  function getClickableClass(item: ListButtonItem) {
    if (!item.onClick) {
      return '';
    }
    if (item.disabled) {
      return disabledClass;
    } else {
      if (item.color === 'error') {
        return errorClickableClass;
      } else {
        return clickableClass;
      }
    }
  }

  return (
    <div className={`w-full md:w-fit ${className}`}>
      <div className="rounded-md border border-gray-850 dark:border-gray-500">
        {items.map((item, index) => (
          <div
            key={index}
            className={`${borderClass}
              ${getClickableClass(item)}
              ${index === items.length - 1 ? 'border-b-0' : ''}
              ${item.color === 'error' ? errorClass : ''}
              ${item.canVaryHeight ? 'py-2' : 'h-14'}`}
            role="button"
            tabIndex={0}
            onClick={!item.disabled ? item.onClick : undefined}
            aria-disabled={item.disabled}
          >
            <div className={rowClass}>
              <item.Icon
                className={`shrink-0 ${item.iconClassName} ${iconClass} ${item.color === 'error' ? iconErrorClass : ''}`}
              />
              <div>
                {item.title && <p className={rowTitleClass}>{item.title}</p>}
                <p className={item.title ? '-mt-0.5' : ''}>{item.text}</p>
              </div>
            </div>

            {item.onClick && <FaChevronRight className={`shrink-0 ${chevronClass}`} />}
          </div>
        ))}
      </div>
    </div>
  );
}
