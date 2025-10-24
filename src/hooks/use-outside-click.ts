import type { RefObject } from 'react';
import { useEffect, useRef } from 'react';

export const useOutsideClick = <T extends HTMLElement>(
  reference: RefObject<T | null>,
  handler: (event: MouseEvent | TouchEvent) => void,
) => {
  const handlerReference = useRef(handler);

  useEffect(() => {
    handlerReference.current = handler;
  }, [handler]);

  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      const element = reference.current;
      if (!element || element.contains(event.target as Node)) return;
      handlerReference.current(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [reference]);
};
