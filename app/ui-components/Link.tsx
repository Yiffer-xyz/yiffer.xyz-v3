import { Link as RemixLink } from '@remix-run/react';

type LinkProps = {
  href: string;
  text: string;
  newTab?: boolean;
  Icon?: React.ElementType;
  IconRight?: React.ElementType;
  iconMargin?: number;
  className?: string;
};

export default function Link({
  href,
  text,
  newTab,
  Icon,
  IconRight,
  iconMargin = 4,
  className,
  ...props
}: LinkProps) {
  const linkClass = `
    w-fit h-fit text-blue-weak-200 dark:text-blue-strong-300 font-semibold
    bg-gradient-to-r from-blue-weak-200 to-blue-weak-200
    dark:from-blue-strong-300 dark:to-blue-strong-300 bg-no-repeat
    focus:no-underline cursor-pointer
    ${className}
  `;

  // NOTE that there are a few lines regarding links in `main.css`.
  // These special things are not supported in tailwind yet.

  if (href.includes('http')) {
    // external link
    // eslint-disable-next-line react/jsx-no-target-blank
    return (
      <a
        href={href}
        target={newTab ? '_blank' : '_self'}
        rel={newTab ? 'noreferrer' : undefined}
        className={linkClass}
        style={{ paddingBottom: '1px' }}
      >
        {Icon ? (
          <Icon style={{ marginRight: iconMargin, marginBottom: '3px' }} />
        ) : undefined}
        {text}
        {IconRight ? <IconRight style={{ marginLeft: iconMargin }} /> : undefined}
      </a>
    );
  } else {
    // internal link
    return (
      <RemixLink
        to={href}
        target={newTab ? '_blank' : '_self'}
        rel={newTab ? 'noreferrer' : undefined}
        className={linkClass}
        style={{ paddingBottom: '1px' }}
        prefetch="intent"
        {...props}
      >
        {Icon ? (
          <Icon style={{ marginRight: iconMargin, marginBottom: '3px' }} />
        ) : undefined}
        {text}
        {IconRight ? <IconRight style={{ marginLeft: iconMargin }} /> : undefined}
      </RemixLink>
    );
  }
}
