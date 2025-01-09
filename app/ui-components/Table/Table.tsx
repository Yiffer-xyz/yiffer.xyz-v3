interface TableProps {
  horizontalScroll?: boolean;
  maxHeight?: number;
  children: React.ReactNode;
  className?: string;
}

export default function Table({
  horizontalScroll,
  maxHeight,
  children,
  className = '',
}: TableProps) {
  const horizontalScrollClass = `overflow-x-auto max-w-full whitespace-nowrap `;
  const verticalScrollStyle = maxHeight ? { maxHeight, overflowY: 'scroll' } : undefined;
  const fullClassName = `
    w-fit
    ${className} ${horizontalScroll ? horizontalScrollClass : ''}
  `;

  if (horizontalScroll || maxHeight) {
    return (
      // @ts-ignore
      <div className={fullClassName} style={verticalScrollStyle}>
        <table>{children}</table>
      </div>
    );
  }

  return <table className={fullClassName}>{children}</table>;
}
