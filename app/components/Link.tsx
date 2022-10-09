import { Link as RemixLink } from '@remix-run/react';
import React from 'react';

type LinkProps = {
  href: string;
  text: string;
  newTab?: boolean;
  Icon?: React.ElementType;
  IconRight?: React.ElementType;
  className?: string;
};

export default function Link({
  href,
  text,
  newTab,
  Icon,
  IconRight,
  className,
  ...props
}: LinkProps) {
  if (href.includes('http')) {
    // external link
    // eslint-disable-next-line react/jsx-no-target-blank
    return (
      <a
        href={href}
        target={newTab ? '_blank' : '_self'}
        rel={newTab ? 'noreferrer' : undefined}
        className={`w-fit h-fit text-blue-weak-200 dark:text-blue-strong-300 font-semibold ${className}`}
        style={{ paddingBottom: '1px' }}
      >
        {text}
      </a>
    );
  } else {
    // internal link
    return (
      <RemixLink
        to={href}
        target={newTab ? '_blank' : '_self'}
        rel={newTab ? 'noreferrer' : undefined}
        className={`w-fit h-fit text-blue-weak-200 dark:text-blue-strong-300 font-semibold ${className}`}
        style={{ paddingBottom: '1px' }}
        prefetch="intent"
        {...props}
      >
        {Icon ? <Icon style={{ marginRight: '4px' }} /> : undefined}
        {text}
        {IconRight ? <IconRight style={{ marginLeft: '4px' }} /> : undefined}
      </RemixLink>
    );
  }
}
