import { useEffect } from 'react';
import { Typography, Button, CircularProgress, Container, Paper } from '@mui/material';
import { ErrorOutline, Login as LoginIcon } from '@mui/icons-material';
import { useNotification } from '../contexts/NotificationContext';
import { useSelectedOrg } from '../contexts/OrganizationContext';
import { useAuth } from './AuthContext';
import AccountConflictHandler from '../Components/Common/AccountConflictHandler';
import useAccountConflictHandler from '../Components/Common/useAccountConflictHandler';
import NoOrganizationAvailable from '../Components/Common/NoOrganizationAvailable';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, login, error, isProcessingCallback, clearError } = useAuth();
  const { showError } = useNotification();
  const { isOrgLoading, selectedOrg } = useSelectedOrg();

  // Use the account conflict handler
  const { dialogProps, isAccountConflictError } = useAccountConflictHandler({
    onConflictDetected: (conflictError) => {
      console.log('Account conflict detected in ProtectedRoute:', conflictError);
    },
    onResolved: () => {
      console.log('Account conflict resolved in ProtectedRoute');
    }
  });

  useEffect(() => {
    const initiateAuth = async () => {
      if (isProcessingCallback) {
        return;
      }
      
      if (!isLoading && !isAuthenticated && !error) {
        try {
          // Check if user just logged out
          const justLoggedOut = sessionStorage.getItem('just_logged_out');
          if (justLoggedOut) {
            console.log('ProtectedRoute: User just logged out, redirecting to login page instead of auto-login');
            sessionStorage.removeItem('just_logged_out');
            window.location.replace('/login');
            return;
          }
          
          if (!navigator.onLine) {
            showError('No internet connection. Please check your network and try again.');
            return;
          }
          
          // Store the current URL before redirecting to login
          const currentPath = window.location.pathname + window.location.search;
          console.log('ProtectedRoute: Storing return URL:', currentPath);
          sessionStorage.setItem('returnUrl', currentPath);
          
          await login();
        } catch (err) {
          console.error('Authentication error during login redirect:', err);
          showError('Unable to authenticate. Please try again later.');
        }
      }
    };

    initiateAuth();
  }, [isAuthenticated, isLoading, login, showError, error, isProcessingCallback]);

  const handleRetryLogin = () => {
    clearError();
    login();
  };

  if (isLoading || isProcessingCallback || isOrgLoading) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <CircularProgress size={40} sx={{ mb: 2 }} />
          <Typography variant="h6">Loading...</Typography>
          {isProcessingCallback && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Processing authentication...
            </Typography>
          )}
        </Paper>
      </Container>
    );
  }

  if (error) {
    // Check if this is an account conflict error
    const isConflictError = isAccountConflictError(error);
    
    if (isConflictError) {
      // Let the AccountConflictHandler handle the UI for account conflicts
      return (
        <Container maxWidth="sm" sx={{ mt: 8 }}>
          <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
            <ErrorOutline color="warning" sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Account Selection Required
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {error.userMessage || 'Multiple Microsoft accounts detected. Please select which account to use.'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              A dialog will appear to help you resolve this issue.
            </Typography>
          </Paper>
          <AccountConflictHandler {...dialogProps} />
        </Container>
      );
    } else {
      // Show standard error UI for non-conflict errors
      return (
        <Container maxWidth="sm" sx={{ mt: 8 }}>
          <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
            <ErrorOutline color="error" sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h5" color="error" gutterBottom>
              Authentication Error
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              {error.message || 'Unable to authenticate. Please try again.'}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<LoginIcon />}
              onClick={handleRetryLogin}
              size="large"
            >
              Try Login Again
            </Button>
          </Paper>
        </Container>
      );
    }
  }

  if (isAuthenticated && !selectedOrg) {
    return <NoOrganizationAvailable />;
  }

  return isAuthenticated ? children : null;
};

export default ProtectedRoute; 