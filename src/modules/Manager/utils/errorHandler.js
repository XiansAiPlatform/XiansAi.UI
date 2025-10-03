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
 *                                      When provided, receives detailed error information
 *                                      When not provided, shows detailed error with styling
 * @param {Object} options - Additional options for error handling
 * @param {boolean} options.showDetailed - Whether to show detailed error information (default: true)
 * @param {boolean} options.includeActions - Whether to include suggested actions (default: true)
 * @returns {Object} Error details object with title, description, technical info, and actions
 */
export const handleApiError = async (error, customMessage = '', showErrorCallback = null, options = {}) => {
  const { showDetailed = true, includeActions = true } = options;
  let userMessage = '';
  let technicalDetails = '';
  let errorTitle = customMessage || 'Error';
  let suggestedActions = [];
  
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
    if (error.url) {
      technicalDetails += ` | URL: ${error.url}`;
    }
    if (error.method) {
      technicalDetails += ` | Method: ${error.method}`;
    }
    
    // Add specific handling for common error types
    if (error.message.includes('Failed to execute \'json\' on \'Response\'')) {
      userMessage = 'Server returned invalid data. This might be a temporary issue.';
      suggestedActions = ['Try refreshing the page', 'Check if the server is running properly', 'Contact support if the issue persists'];
    } else if (error.message.includes('body stream already read')) {
      userMessage = 'Server response processing error. This is likely a temporary issue.';
      suggestedActions = ['Try the operation again', 'Refresh the page if the issue persists'];
    } else if (error.message.includes('Failed to fetch')) {
      userMessage = 'Unable to connect to the server. Please check your connection.';
      suggestedActions = ['Check your internet connection', 'Verify the server is accessible', 'Try again in a moment'];
    }
    
    // Add status-specific suggestions
    if (error.status) {
      const statusActions = getActionsByStatus(error.status);
      suggestedActions = [...suggestedActions, ...statusActions];
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
    technical: technicalDetails,
    actions: suggestedActions
  };

  // Custom Toast Component for better error presentation
  const ToastContent = () => (
    <div style={toastStyles.container}>
      <div style={toastStyles.title}>{finalMessage.title}</div>
      <div style={toastStyles.description}>{finalMessage.description}</div>
      {finalMessage.actions && finalMessage.actions.length > 0 && includeActions && (
        <div style={{
          marginTop: '8px',
          marginBottom: '8px',
          fontSize: '0.95rem',
          color: '#34495e'
        }}>
          <strong>Try these steps:</strong>
          <ul style={{
            margin: '4px 0',
            paddingLeft: '20px',
            listStyleType: 'disc'
          }}>
            {finalMessage.actions.map((action, index) => (
              <li key={index} style={{ marginBottom: '2px' }}>{action}</li>
            ))}
          </ul>
        </div>
      )}
      {showDetailed && (
        <div style={toastStyles.technical}>
          Technical details: {finalMessage.technical}
        </div>
      )}
    </div>
  );

  // Use provided callback if available, otherwise fallback to direct toast
  if (showErrorCallback && typeof showErrorCallback === 'function') {
    // Check if the callback can handle detailed errors (like showDetailedError)
    // by checking if it accepts a React component
    try {
      // Try to pass the detailed component first
      showErrorCallback(<ToastContent />);
    } catch (err) {
      // Fallback to simple message if the callback doesn't support React components
      showErrorCallback(finalMessage.description);
    }
  } else {
    // Fallback to direct toast call for backward compatibility
    // This shows the full detailed error with styling
    toast.error(<ToastContent />, {
      position: "bottom-left", // Changed to match NotificationContext
      autoClose: 8000, // Increased duration to allow reading longer messages
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      style: { maxWidth: '900px', width: '100%' }, // Increased width for better readability
    });
  }

  return finalMessage;
};

// Helper function to get status-based messages
const getStatusMessage = (status) => {
  switch (status) {
    case 400:
      return 'Invalid request. Please check your input and try again';
    case 401:
      return 'Your session has expired. Please log in again';
    case 403:
      return 'You do not have permission to perform this action';
    case 404:
      return 'The requested resource could not be found';
    case 409:
      return 'There was a conflict with your request. The resource may already exist';
    case 422:
      return 'The request data is invalid or incomplete';
    case 429:
      return 'Too many requests. Please wait a moment and try again';
    case 500:
      return 'Internal server error. Please try again later';
    case 502:
      return 'Server is temporarily unavailable. Please try again later';
    case 503:
      return 'Service temporarily unavailable. Please try again later';
    default:
      return status ? `Server error (${status}). Please try again later` : 'An unexpected error occurred';
  }
};

// Helper function to get suggested actions based on status code
const getActionsByStatus = (status) => {
  switch (status) {
    case 400:
      return ['Check that all required fields are filled', 'Verify the data format is correct', 'Try submitting the form again'];
    case 401:
      return ['Click the login button to sign in again', 'Clear your browser cache and cookies', 'Contact support if login issues persist'];
    case 403:
      return ['Contact your administrator for access', 'Verify you have the correct permissions', 'Try logging out and back in'];
    case 404:
      return ['Check the URL is correct', 'Go back and try a different link', 'The resource may have been moved or deleted'];
    case 409:
      return ['Check if the item already exists', 'Try using a different name or identifier', 'Refresh the page to see current data'];
    case 422:
      return ['Review all form fields for errors', 'Check that required information is provided', 'Verify data formats match requirements'];
    case 429:
      return ['Wait a few minutes before trying again', 'Avoid making rapid repeated requests', 'Contact support if you need higher rate limits'];
    case 500:
      return ['Try the operation again in a few minutes', 'Check if the issue affects other features', 'Contact support if the problem persists'];
    case 502:
    case 503:
      return ['Wait a few minutes and try again', 'Check our status page for known issues', 'Contact support if the service remains unavailable'];
    default:
      return ['Try refreshing the page', 'Check your internet connection', 'Contact support if the issue continues'];
  }
}; 