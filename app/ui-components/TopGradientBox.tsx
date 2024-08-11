import type { HTMLAttributes } from 'react';

type TopGradientBoxProps = {
  containerClassName?: HTMLAttributes<HTMLDivElement>['className'];
  innerClassName?: HTMLAttributes<HTMLDivElement>['className'];
  children: React.ReactNode;
};

export default function TopGradientBox({
  containerClassName,
  innerClassName,
  children,
}: TopGradientBoxProps) {
  return (
    <div
      className={`pt-2.5 bg-gradient-to-r from-theme1-primary to-theme2-primary shadow-lg
        dark:from-theme1-dark dark:to-theme2-dark
        ${containerClassName}`}
    >
      <div className={`bg-white dark:bg-gray-300 w-full h-full ${innerClassName}`}>
        {children}
      </div>
    </div>
  );
}
