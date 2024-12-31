import { useAuth0 } from '@auth0/auth0-react';
import { useNotification } from '../contexts/NotificationContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();
  const { showError } = useNotification();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    try {
      if (!navigator.onLine) {
        showError('No internet connection. Please check your network and try again.');
        return null;
      }
      loginWithRedirect();
      return null;
    } catch (error) {
      // Handle specific error types
      if (error.error === 'login_required') {
        showError('Session expired. Please log in again.');
      } else {
        // Log error for debugging
        console.error('Auth0 authentication error:', error);
        showError('Unable to authenticate. Please try again later.');
      }
      return null;
    }
  }

  return children;
};

export default ProtectedRoute; 