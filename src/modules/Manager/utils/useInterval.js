import { useEffect, useRef } from 'react';

/**
 * Custom hook for setting up an interval that can be paused
 * @param {Function} callback - The function to call on each interval
 * @param {number|null} delay - The delay in ms. null means the interval is paused
 */
function useInterval(callback, delay) {
  const savedCallback = useRef();

  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    
    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

export default useInterval; 