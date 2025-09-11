import { useEffect, useState } from 'react';
import useWindowSize from '~/utils/useWindowSize';

interface TableProps {
  horizontalScroll?: 'always' | 'mobile-only';
  maxHeight?: number;
  children: React.ReactNode;
  className?: string;
}

const horizontalScrollClassStr = `overflow-x-auto max-w-full whitespace-nowrap `;

export default function Table({
  horizontalScroll,
  maxHeight,
  children,
  className = '',
}: TableProps) {
  const { isMobile } = useWindowSize();

  const [horizontalScrollClassVal, setHorizontalScrollClassVal] = useState(
    horizontalScroll === 'always' ? horizontalScrollClassStr : ''
  );

  const verticalScrollStyle = maxHeight ? { maxHeight, overflowY: 'scroll' } : undefined;

  const fullClassName = `w-fit ${className} ${horizontalScrollClassVal}`;

  useEffect(() => {
    if (isMobile && horizontalScroll === 'mobile-only') {
      setHorizontalScrollClassVal(horizontalScrollClassStr);
    }
  }, [isMobile, horizontalScroll]);

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
