import { useCallback, useRef } from 'react';

export const useDebounce = <T extends (...arguments_: any[]) => void>(
  callback: T,
  delay: number,
) => {
  const timerId = useRef<NodeJS.Timeout | null>(null);

  return useCallback(
    (...arguments_: Parameters<T>) => {
      if (timerId.current) {
        clearTimeout(timerId.current);
      }

      timerId.current = setTimeout(() => {
        callback(...arguments_);
      }, delay);
    },
    [callback, delay],
  );
};
