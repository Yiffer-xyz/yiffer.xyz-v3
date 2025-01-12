import { Link as RemixLink } from '@remix-run/react';
import { RiArrowRightLine } from 'react-icons/ri';

type LinkProps = {
  href: string;
  text: string;
  newTab?: boolean;
  isInsideParagraph?: boolean;
  color?: 'link' | 'text' | 'white';
  bold?: boolean;
  Icon?: React.ElementType;
  IconRight?: React.ElementType;
  showRightArrow?: boolean;
  iconMargin?: number;
  className?: string;
  style?: React.CSSProperties;
};

export default function Link({
  href,
  text,
  newTab,
  isInsideParagraph = false,
  color = 'link',
  bold = true,
  Icon,
  IconRight,
  iconMargin = 4,
  showRightArrow,
  className,
  style,
  ...props
}: LinkProps) {
  let colorClass = `text-blue-weak-200 dark:text-blue-strong-300 from-blue-weak-200 to-blue-weak-200
    dark:from-blue-strong-300 dark:to-blue-strong-300`;
  if (color === 'text') {
    colorClass = `text-light dark:text-dark from-text-light to-text-light
    dark:from-text-dark dark:to-text-dark`;
  }
  if (color === 'white') {
    colorClass = `!text-dark dark:text-dark from-text-dark to-text-dark
    dark:from-text-dark dark:to-text-dark`;
  }

  const linkClass = `
    w-fit h-fit ${bold ? 'font-semibold' : ''} bg-gradient-to-r
    ${colorClass} 
    bg-no-repeat focus:no-underline cursor-pointer
    ${className}
  `;

  let pClass = '';
  if (className?.includes('mx-auto')) {
    pClass += ' mx-auto';
  }
  if (className?.includes('text-sm') || className?.includes('text-xs')) {
    pClass += ' leading-none';
  }

  // ℹ️ NOTE that there are a few lines regarding links in `main.css`.
  // These special things are not supported in tailwind yet.

  const InnerLinkComponent = href.includes('http') ? (
    <a
      href={href}
      target={newTab ? '_blank' : '_self'}
      rel={newTab ? 'noreferrer' : undefined}
      className={`${linkClass}`}
      style={{ paddingBottom: '1px', ...style }}
      {...props}
    >
      {Icon ? (
        <Icon style={{ marginRight: iconMargin, marginBottom: '3px' }} />
      ) : undefined}
      {text}
      {showRightArrow && (
        <RiArrowRightLine style={{ marginLeft: iconMargin, marginBottom: 3 }} />
      )}
      {!showRightArrow && IconRight ? (
        <IconRight style={{ marginLeft: iconMargin }} />
      ) : undefined}
    </a>
  ) : (
    <RemixLink
      to={href}
      target={newTab ? '_blank' : '_self'}
      rel={newTab ? 'noreferrer' : undefined}
      className={`${linkClass}`}
      style={{ paddingBottom: '1px', ...style }}
      prefetch="intent"
      {...props}
    >
      {Icon ? (
        <Icon style={{ marginRight: iconMargin, marginBottom: '3px' }} />
      ) : undefined}
      {text}
      {showRightArrow && (
        <RiArrowRightLine style={{ marginLeft: iconMargin, marginBottom: 3 }} />
      )}
      {!showRightArrow && IconRight ? (
        <IconRight style={{ marginLeft: iconMargin }} />
      ) : undefined}
    </RemixLink>
  );

  if (isInsideParagraph) return InnerLinkComponent;
  return <p className={`w-fit inline ${pClass}`}>{InnerLinkComponent}</p>;
}
