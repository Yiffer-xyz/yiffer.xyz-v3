import { useEffect, useState } from 'react';

export default function useWindowSize() {
  const [windowSize, setWindowSize] = useState<{
    width?: number;
    height?: number;
    isMobile: boolean;
  }>({
    width: undefined,
    height: undefined,
    isMobile: false,
  });

  useEffect(() => {
    if (!window) {
      return;
    }
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
        isMobile: window.innerWidth < 640,
      });
    }
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return windowSize;
}
