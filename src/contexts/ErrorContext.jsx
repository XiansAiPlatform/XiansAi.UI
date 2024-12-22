import React, { createContext, useContext } from 'react';
import { toast } from 'react-hot-toast';

const ErrorContext = createContext();

export function ErrorProvider({ children }) {
  const showError = (message) => {
    toast.error(message);
  };

  return (
    <ErrorContext.Provider value={{ showError }}>
      {children}
    </ErrorContext.Provider>
  );
}

export const useError = () => useContext(ErrorContext); 