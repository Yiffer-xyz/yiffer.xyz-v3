import React from 'react';

type LinkProps = {
  href: string;
  text: string;
  newTab?: boolean;
  Icon?: React.ElementType;
  IconRight?: React.ElementType;
  className?: string;
};

export default function Link({ href, text, newTab, Icon, IconRight, className }: LinkProps) {
  return (
    // eslint-disable-next-line react/jsx-no-target-blank
    <a
      href={href}
      target={newTab ? '_blank' : '_self'}
      rel={newTab ? 'noreferrer' : undefined}
      className={`w-fit h-fit text-blue-weak-200 dark:text-blue-strong-300 font-semibold ${className}`}
      style={{ paddingBottom: '1px' }}
    >
      {Icon ? <Icon style={{ marginRight: '4px' }} /> : undefined}
      {text}
      {IconRight ? <IconRight style={{ marginLeft: '4px' }} /> : undefined}
    </a>
  );
}
