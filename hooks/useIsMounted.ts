import { useRef, useEffect, useCallback } from 'react';

/**
 * Custom hook to track if a component is currently mounted.
 * Helps prevent "Can't perform a React state update on an unmounted component" errors.
 *
 * @returns {() => boolean} A function that returns true if the component is mounted, false otherwise.
 */
export const useIsMounted = () => {
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  return useCallback(() => isMounted.current, []);
};
