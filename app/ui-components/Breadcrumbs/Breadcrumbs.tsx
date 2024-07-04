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
  return (
    <p className={className}>
      {prevRoutes.map(route => (
        <>
          <Link href={route.href} text={route.text} key={route.href} /> <MdChevronRight />{' '}
        </>
      ))}

      {currentRoute}
    </p>
  );
}
