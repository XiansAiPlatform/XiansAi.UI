import { toast } from 'react-toastify';

// Add these styles to your CSS or styled-components
const toastStyles = {
  container: {
    padding: '8px 0',
  },
  title: {
    fontWeight: 'bold',
    marginBottom: '4px',
    color: '#e74c3c',
  },
  description: {
    marginBottom: '4px',
    color: '#2c3e50',
  },
  technical: {
    fontSize: '0.8em',
    color: '#7f8c8d',
    fontFamily: 'monospace',
    padding: '4px',
    background: '#f8f9fa',
    borderRadius: '4px',
    marginTop: '4px',
  },
};

export const handleApiError = (error, customMessage = '') => {
  let userMessage = '';
  let technicalDetails = error.message || 'Unknown error';
  
  if (!navigator.onLine) {
    userMessage = 'No internet connection. Please check your network';
  } else if (error instanceof TypeError && error.message === 'Failed to fetch') {
    userMessage = 'Unable to connect to the server. Please try again later';
  } else if (error.status) {
    // Handle HTTP errors
    switch (error.status) {
      case 400:
        userMessage = 'Invalid request. Please check your input';
        break;
      case 401:
        userMessage = 'Session expired. Please log in again';
        break;
      case 403:
        userMessage = 'You do not have permission to perform this action';
        break;
      case 404:
        userMessage = 'The requested resource could not be found';
        break;
      case 500:
        userMessage = 'Internal server error. Please try again later';
        break;
      case 503:
        userMessage = 'Service temporarily unavailable. Please try again later';
        break;
      default:
        userMessage = `Server error (${error.status})`;
    }
  } else {
    userMessage = 'An unexpected error occurred';
  }

  // Construct the final message
  const finalMessage = {
    title: customMessage || 'Error',
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

  // Show toast notification with enhanced content
  toast.error(<ToastContent />, {
    position: "top-right",
    autoClose: 6000, // Increased duration to allow reading
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    style: { maxWidth: '600px' }, // Wider toast for better readability
  });

  return finalMessage;
}; 