import { useEffect, useRef, useState } from 'react';

export default function useResizeObserver<T extends HTMLElement>(): [
  React.RefObject<T>,
  { width: number; height: number },
] {
  const elementRef = useRef<T>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const element = elementRef.current;

    if (!element) return;

    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setSize({ width, height });
      }
    });

    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return [elementRef, size];
}
