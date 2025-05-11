import { useAuth0 } from '@auth0/auth0-react';
import { useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { useSelectedOrg } from '../contexts/OrganizationContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();
  const { showError } = useNotification();
  const { isOrgLoading, selectedOrg } = useSelectedOrg();

  useEffect(() => {
    const initiateAuth = async () => {
      if (!isAuthenticated && !isLoading) {
        try {
          if (!navigator.onLine) {
            showError('No internet connection. Please check your network and try again.');
            return;
          }
          await loginWithRedirect();
        } catch (error) {
          console.error('Auth0 authentication error:', error);
          showError('Unable to authenticate. Please try again later.');
        }
      }
    };

    initiateAuth();
  }, [isAuthenticated, isLoading, loginWithRedirect, showError]);

  if (isLoading || isOrgLoading) {
    return <div>Loading...</div>;
  }

  if (isAuthenticated && !selectedOrg) {
    return <div>No organization available</div>;
  }

  return isAuthenticated ? children : null;
};

export default ProtectedRoute; 