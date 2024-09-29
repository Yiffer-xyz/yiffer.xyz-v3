import React from 'react';
import { MdChevronRight } from 'react-icons/md';
import Link from '../Link';

type Props = {
  prevRoutes: {
    text: string;
    href: string;
  }[];
  currentRoute: string;
  className?: React.HTMLAttributes<HTMLParagraphElement>['className'];
};

export default function Breadcrumbs({ currentRoute, prevRoutes, className }: Props) {
  const prevRoutesWithHome = [{ text: 'Home', href: '/' }, ...prevRoutes];

  return (
    <div className={`mb-4 mt-2 ${className}`}>
      {prevRoutesWithHome.map(route => (
        <React.Fragment key={route.href}>
          <Link href={route.href} text={route.text} /> <MdChevronRight />{' '}
        </React.Fragment>
      ))}

      {currentRoute}
    </div>
  );
}
