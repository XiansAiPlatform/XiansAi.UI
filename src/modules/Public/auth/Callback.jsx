import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Paper, 
  Typography, 
  CircularProgress, 
  Button
} from '@mui/material';
import { 
  ErrorOutline, 
  CheckCircle, 
  Warning as WarningIcon,
  Login as LoginIcon 
} from '@mui/icons-material';
import { useNotification } from '../../Manager/contexts/NotificationContext';
import { useAuth } from '../../Manager/auth/AuthContext';
import AccountConflictHandler from '../../Manager/Components/Common/AccountConflictHandler';
import useAccountConflictHandler from '../../Manager/Components/Common/useAccountConflictHandler';

const Callback = () => {
  const { isAuthenticated, error, isLoading, isProcessingCallback, providerInstance, clearError } = useAuth();
  const navigate = useNavigate();
  const { showError } = useNotification();
  const [hasShownError, setHasShownError] = useState(false);

  // Use the account conflict handler
  const { dialogProps, isAccountConflictError } = useAccountConflictHandler({
    onConflictDetected: (conflictError) => {
      console.log('Account conflict detected in Callback:', conflictError);
    },
    onResolved: () => {
      console.log('Account conflict resolved in Callback, attempting navigation');
      navigate('/manager/definitions');
    }
  });

  useEffect(() => {
    // Check if this is a logout callback using the auth provider's generic method
    const isLogoutCallback = providerInstance && 
                            providerInstance.isLogoutCallback && 
                            providerInstance.isLogoutCallback();
    
    if (isLogoutCallback) {
      console.log("Callback: Detected logout callback, redirecting to login");
      navigate('/login');
      return;
    }

    // Don't navigate while still processing
    if (isLoading || isProcessingCallback) {
      return;
    }

    // Handle account conflict errors specially
    if (error && isAccountConflictError(error)) {
      // Don't show error notification for conflicts - let the dialog handle it
      if (!hasShownError) {
        console.log('Account conflict detected in callback, showing conflict handler');
        setHasShownError(true);
      }
      return;
    }

    // Only show non-conflict errors that persist after the redirect handling and haven't been shown yet
    if (error && !hasShownError && !isAccountConflictError(error)) {
      console.error('Authentication error persisted after redirect handling:', error);
      showError(error.message || 'Authentication failed');
      setHasShownError(true);
      // Wait a bit before redirecting to ensure user sees the error
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      return;
    }
    
    // If callback processing is complete but user is not authenticated and no error,
    // it might mean the callback didn't contain valid auth data
    if (!isAuthenticated && !error) {
      setTimeout(() => {
        navigate('/login');
      }, 2000); // Give a brief moment to show the message
      return;
    }
    
    // Only redirect if successfully authenticated
    if (isAuthenticated && !error) {
      console.log("Callback: Successfully authenticated, redirecting to /manager/definitions");
      navigate('/manager/definitions');
    }
  }, [isAuthenticated, error, isLoading, isProcessingCallback, navigate, showError, hasShownError, providerInstance, isAccountConflictError]);

  const handleRetryLogin = () => {
    clearError();
    navigate('/login');
  };

  // Show loading state while processing authentication
  if (isLoading || isProcessingCallback) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ mb: 3 }} />
          <Typography variant="h5" gutterBottom>
            Processing authentication...
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Please wait while we complete the sign-in process.
          </Typography>
          {isProcessingCallback && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Handling authentication callback...
            </Typography>
          )}
        </Paper>
      </Container>
    );
  }

  // Show account conflict state
  if (error && isAccountConflictError(error)) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <WarningIcon color="warning" sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Account Selection Required
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {error.userMessage || 'Multiple Microsoft accounts detected during authentication.'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Please select which account you want to use to continue.
          </Typography>
        </Paper>
        <AccountConflictHandler {...dialogProps} />
      </Container>
    );
  }

  // Show error state for non-conflict errors
  if (error) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <ErrorOutline color="error" sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h5" color="error" gutterBottom>
            Authentication Error
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            {error.message || 'Authentication failed'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Redirecting to login page...
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<LoginIcon />}
            onClick={handleRetryLogin}
            size="large"
          >
            Try Again
          </Button>
        </Paper>
      </Container>
    );
  }

  // If not authenticated and no error, show processing message
  if (!isAuthenticated && !error) {
    // If callback processing is done but still not authenticated, show different message
    if (!isLoading && !isProcessingCallback) {
      return (
        <Container maxWidth="sm" sx={{ mt: 8 }}>
          <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
            <WarningIcon color="warning" sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Authentication Incomplete
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              The authentication process completed but no valid session was found.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Redirecting to login page...
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<LoginIcon />}
              onClick={handleRetryLogin}
              size="large"
            >
              Go to Login
            </Button>
          </Paper>
        </Container>
      );
    }
    
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <CircularProgress size={40} sx={{ mb: 2 }} />
          <Typography variant="body1">
            Processing authentication... If you are not redirected, please try logging in again.
          </Typography>
        </Paper>
      </Container>
    );
  }

  // If authenticated, show success message while redirecting
  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <CheckCircle color="success" sx={{ fontSize: 60, mb: 2 }} />
        <Typography variant="h5" color="success.main" gutterBottom>
          Authentication Successful!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Redirecting to application...
        </Typography>
      </Paper>
    </Container>
  );
};

export default Callback;
