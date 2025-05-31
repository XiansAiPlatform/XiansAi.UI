import { toast } from 'react-toastify';

// Add these styles to your CSS or styled-components
const toastStyles = {
  container: {
    padding: '12px 0',
    width: '100%',
  },
  title: {
    fontWeight: 'bold',
    marginBottom: '8px',
    color: '#e74c3c',
    fontSize: '1.1rem',
  },
  description: {
    marginBottom: '8px',
    color: '#2c3e50',
    fontSize: '1rem',
    lineHeight: '1.4',
    wordBreak: 'break-word',
  },
  technical: {
    fontSize: '0.9em',
    color: '#7f8c8d',
    fontFamily: 'monospace',
    padding: '8px',
    background: '#f8f9fa',
    borderRadius: '4px',
    marginTop: '8px',
    wordBreak: 'break-word',
    overflowWrap: 'break-word',
  },
};

/**
 * Handles API errors with consistent formatting and user-friendly notifications.
 * 
 * @param {Error|Response} error - The error object or Response to handle
 * @param {string} customMessage - Custom title for the error (optional)
 * @param {function} showErrorCallback - Callback function for displaying errors (optional)
 *                                      When provided, receives only the clean user message
 *                                      When not provided, shows detailed error with styling
 * @returns {Object} Error details object with title, description, and technical info
 */
export const handleApiError = async (error, customMessage = '', showErrorCallback = null) => {
  let userMessage = '';
  let technicalDetails = '';
  let errorTitle = customMessage || 'Error';
  
  // Check if the error is a Response object (legacy support)
  if (error instanceof Response) {
    try {
      // Try to parse the error response as JSON with standard format { error: "message" }
      const errorData = await error.json();
      
      // Check if the error has the standard server format
      if (errorData && errorData.error) {
        userMessage = errorData.error;
        technicalDetails = `Status: ${error.status}`;
      } else if (errorData && typeof errorData === 'object') {
        // Legacy support for other structured formats
        if (errorData.title) {
          errorTitle = errorData.title;
        }
        
        if (errorData.detail) {
          userMessage = errorData.detail;
        } else {
          userMessage = getStatusMessage(error.status);
        }
        
        technicalDetails = `Status: ${errorData.status || error.status}`;
        if (errorData.type) {
          technicalDetails += ` | Type: ${errorData.type}`;
        }
      } else {
        userMessage = getStatusMessage(error.status);
        technicalDetails = error.status ? `Status: ${error.status}` : 'Unknown error';
      }
    } catch (parseError) {
      userMessage = getStatusMessage(error.status);
      technicalDetails = error.status ? `Status: ${error.status}` : 'Unknown error';
    }
  } else if (!navigator.onLine) {
    userMessage = 'No internet connection. Please check your network';
    technicalDetails = 'Network error';
  } else if (error instanceof TypeError && error.message === 'Failed to fetch') {
    userMessage = 'Unable to connect to the server. Please try again later';
    technicalDetails = error.message;
  } else if (error instanceof Error) {
    // Handle Error objects created by the API client
    userMessage = error.message;
    technicalDetails = error.status ? `Status: ${error.status}` : 'Client error';
    if (error.statusText) {
      technicalDetails += ` | ${error.statusText}`;
    }
  } else if (error.status) {
    // Handle HTTP errors (legacy support)
    userMessage = getStatusMessage(error.status);
    technicalDetails = error.message || `Status: ${error.status}`;
  } else {
    userMessage = 'An unexpected error occurred';
    technicalDetails = error.message || 'Unknown error';
  }

  // Construct the final message
  const finalMessage = {
    title: errorTitle,
    description: userMessage,
    technical: technicalDetails
  };

  // Custom Toast Component for better error presentation
  const ToastContent = () => (
    <div style={toastStyles.container}>
      <div style={toastStyles.title}>{finalMessage.title}</div>
      <div style={toastStyles.description}>{finalMessage.description}</div>
      <div style={toastStyles.technical}>
        Technical details: {finalMessage.technical}
      </div>
    </div>
  );

  // Use provided callback if available, otherwise fallback to direct toast
  if (showErrorCallback && typeof showErrorCallback === 'function') {
    // Pass just the user-friendly message to the callback, without technical details
    // This makes it more readable and less cluttered on the notification
    showErrorCallback(finalMessage.description);
  } else {
    // Fallback to direct toast call for backward compatibility
    // This shows the full detailed error with styling
    toast.error(<ToastContent />, {
      position: "bottom-right", // Changed to match NotificationContext
      autoClose: 6000, // Increased duration to allow reading
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      style: { maxWidth: '800px', width: '100%' }, // Increased width for better readability
    });
  }

  return finalMessage;
};

// Helper function to get status-based messages
const getStatusMessage = (status) => {
  switch (status) {
    case 400:
      return 'Invalid request. Please check your input';
    case 401:
      return 'Session expired. Please log in again';
    case 403:
      return 'You do not have permission to perform this action';
    case 404:
      return 'The requested resource could not be found';
    case 500:
      return 'Internal server error. Please try again later';
    case 503:
      return 'Service temporarily unavailable. Please try again later';
    default:
      return status ? `Server error (${status})` : 'An unexpected error occurred';
  }
}; 