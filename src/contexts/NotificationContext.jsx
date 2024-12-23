import React, { createContext, useContext } from 'react';
import { toast } from 'react-hot-toast';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const showError = (message) => {
    toast.error(message);
  };

  const showSuccess = (message) => {
    toast.success(message);
  };

  return (
    <NotificationContext.Provider value={{ showError, showSuccess }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotification = () => useContext(NotificationContext); 