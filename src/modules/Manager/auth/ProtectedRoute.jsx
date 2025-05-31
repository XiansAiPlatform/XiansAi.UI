import { useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { useSelectedOrg } from '../contexts/OrganizationContext';
import { useAuth } from './AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, login, error } = useAuth();
  const { showError } = useNotification();
  const { isOrgLoading, selectedOrg } = useSelectedOrg();

  useEffect(() => {
    const initiateAuth = async () => {
      if (!isLoading && !isAuthenticated && !error) {
        try {
          if (!navigator.onLine) {
            showError('No internet connection. Please check your network and try again.');
            return;
          }
          await login();
        } catch (err) {
          console.error('Authentication error during login redirect:', err);
          showError('Unable to authenticate. Please try again later.');
        }
      }
    };

    initiateAuth();
  }, [isAuthenticated, isLoading, login, showError, error]);

  if (isLoading || isOrgLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Authentication Error: {error.message}. Please try logging in again.</div>;
  }

  if (isAuthenticated && !selectedOrg) {
    return <div>No organization available. Please ensure you are part of an organization.</div>;
  }

  return isAuthenticated ? children : null;
};

export default ProtectedRoute; 