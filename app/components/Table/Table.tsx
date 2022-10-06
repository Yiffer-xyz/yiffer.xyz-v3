interface TableProps {
  horizontalScroll?: boolean;
  /** A style value that'll be applied to the container - eg. 70vh, 20rem, etc. */
  maxHeight?: string;
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
  const verticalScrollStyle = maxHeight ? { maxHeight } : {};
  const fullClassName = `
    w-fit
    ${className} ${horizontalScroll ? horizontalScrollClass : ''}
  `;

  if (horizontalScroll || maxHeight) {
    return (
      <div className={fullClassName} style={verticalScrollStyle}>
        <table>{children}</table>
      </div>
    );
  }

  return <table className={fullClassName}>{children}</table>;
}
