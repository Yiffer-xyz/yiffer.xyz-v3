import { useEffect, useState } from 'react';

// Tailwind's breakpoints:
// sm 640
// md 768
// lg 1024
// xl 1280
// 2xl 1536

type SizeType = {
  width?: number;
  height?: number;
  isMobile: boolean;
  isSmUp: boolean;
  isMdUp: boolean;
  isLgUp: boolean;
  isXlUp: boolean;
};

const emptySizes: SizeType = {
  width: undefined,
  height: undefined,
  isMobile: false,
  isSmUp: false,
  isMdUp: false,
  isLgUp: false,
  isXlUp: false,
};

function getWindowSize(): SizeType {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
    isMobile: window.innerWidth < 640,
    isSmUp: window.innerWidth >= 640,
    isMdUp: window.innerWidth >= 768,
    isLgUp: window.innerWidth >= 1024,
    isXlUp: window.innerWidth >= 1280,
  };
}

export default function useWindowSize() {
  const [windowSize, setWindowSize] = useState<SizeType>(
    typeof window === 'undefined' ? emptySizes : getWindowSize()
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    function handleResize() {
      if (!window) return;
      setWindowSize(getWindowSize());
    }

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
}
