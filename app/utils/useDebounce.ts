import debounce from 'lodash.debounce';
import { useEffect, useMemo, useRef } from 'react';

export default function useDebounce(callback: () => void) {
  const ref = useRef<() => void>(() => {});

  useEffect(() => {
    ref.current = callback;
  }, [callback]);

  const debouncedCallback = useMemo(() => {
    const func = () => {
      ref.current?.();
    };

    // eslint-disable-next-line react-hooks/refs
    return debounce(func, 1000);
  }, []);

  return debouncedCallback;
}
