export type TableHeadProps = {
  isTableMaxHeight?: boolean;
  children: React.ReactNode;
  className?: string;
};

// I did not find a better way to make it sticky than having to use this
// isTableMaxHeight prop, in addition to specifying the maxHeight prop on the table itself.
export default function TableHeadRow({
  isTableMaxHeight = false,
  children,
  className = '',
}: TableHeadProps) {
  const theadRowClass = `bg-gray-900 dark:bg-gray-300 text-left border-b
    border-gray-borderLight font-bold`;
  return (
    <thead>
      <tr
        className={`${theadRowClass} ${className} ${
          isTableMaxHeight ? 'sticky top-0' : ''
        }`}
      >
        {children}
      </tr>
    </thead>
  );
}
