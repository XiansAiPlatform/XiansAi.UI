import { useRef, useCallback } from 'react';

const useInputFocus = () => {
  const inputRef = useRef(null);
  
  // Focus the input field
  const focusInput = useCallback(() => {
    setTimeout(() => {
      if (inputRef.current && inputRef.current.focus) {
        inputRef.current.focus();
      }
    }, 100);
  }, []);
  
  return {
    inputRef,
    focusInput
  };
};

export default useInputFocus; 