import { useEffect, useState } from 'react';

// Tailwind's breakpoints:
// sm 640
// md 768
// lg 1024
// xl 1280
// 2xl 1536

export default function useWindowSize() {
  const [windowSize, setWindowSize] = useState<{
    width?: number;
    height?: number;
    isMobile: boolean;
    isSmUp: boolean;
    isMdUp: boolean;
    isLgUp: boolean;
    isXlUp: boolean;
  }>({
    width: undefined,
    height: undefined,
    isMobile: false,
    isSmUp: false,
    isMdUp: false,
    isLgUp: false,
    isXlUp: false,
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
        isSmUp: window.innerWidth >= 640,
        isMdUp: window.innerWidth >= 768,
        isLgUp: window.innerWidth >= 1024,
        isXlUp: window.innerWidth >= 1280,
      });
    }
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
}
