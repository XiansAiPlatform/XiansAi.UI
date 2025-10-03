import { createContext, use } from 'react';
import { toast } from 'react-toastify';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const showError = (message) => {
    toast.error(message, {
      position: "bottom-left",
      autoClose: 6000, // Increased duration to match errorHandler
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      style: { maxWidth: '800px', width: '100%' }, // Added styling for better readability
    });
  };

  const showSuccess = (message) => {
    toast.success(message, {
      position: "bottom-left",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  // Enhanced error function that can handle React components for detailed errors
  const showDetailedError = (content) => {
    toast.error(content, {
      position: "bottom-left",
      autoClose: 6000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      style: { maxWidth: '800px', width: '100%' },
    });
  };

  return (
    (<NotificationContext value={{ showError, showSuccess, showDetailedError }}>
      {children}
    </NotificationContext>)
  );
}

export const useNotification = () => use(NotificationContext); 