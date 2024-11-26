import { RiArrowRightLine } from 'react-icons/ri';
import { Link as RemixLink } from '@remix-run/react';

type LinkCardProps = {
  href: string;
  title: string;
  description?: string;
  includeRightArrow?: boolean;
  disabled?: boolean;
  className?: string;
};

export default function LinkCard({
  href,
  title,
  description,
  includeRightArrow = false,
  disabled = false,
  className = '',
}: LinkCardProps) {
  const notDisabledStyle = `cursor-pointer hover:border-blue-weak-200 dark:hover:border-blue-strong-300 border-3 `;
  includeRightArrow = includeRightArrow && !disabled;

  const containerClassName = `flex flex-col bg-white   
    dark:bg-gray-300 rounded px-3 py-2 border-transparent shadow
    ${disabled ? 'opacity-60' : notDisabledStyle}
    ${className}`;

  return (
    <RemixLink
      to={href}
      className={containerClassName}
      style={disabled ? { pointerEvents: 'none' } : {}}
    >
      <p
        className={`text-blue-weak-200 dark:text-blue-strong-300 from-blue-weak-200 to-blue-weak-200
            dark:from-blue-strong-300 dark:to-blue-strong-300 font-semibold`}
      >
        {title}
        {includeRightArrow && (
          <RiArrowRightLine className="inline" style={{ marginLeft: 4 }} />
        )}
      </p>
      {description && <p>{description}</p>}
    </RemixLink>
  );
}
