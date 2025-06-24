import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../Manager/contexts/NotificationContext';
import { useAuth } from '../../Manager/auth/AuthContext';

const Callback = () => {
  const { isAuthenticated, error, isLoading, isProcessingCallback } = useAuth();
  const navigate = useNavigate();
  const { showError } = useNotification();
  const [hasShownError, setHasShownError] = useState(false);

  useEffect(() => {
    // Don't navigate while still processing
    if (isLoading || isProcessingCallback) {
      return;
    }

    // Only show errors that persist after the redirect handling and haven't been shown yet
    if (error && !hasShownError) {
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
      navigate('/manager/definitions');
    }
  }, [isAuthenticated, error, isLoading, isProcessingCallback, navigate, showError, hasShownError]);

  // Show loading state while processing authentication
  if (isLoading || isProcessingCallback) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <h2>Processing authentication...</h2>
        <p>Please wait while we complete the sign-in process.</p>
        {isProcessingCallback && (
          <p style={{ fontSize: '14px', color: '#666' }}>
            Handling authentication callback...
          </p>
        )}
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '20px',
        color: '#d32f2f'
      }}>
        <h2>Authentication Error</h2>
        <p>{error.message || 'Authentication failed'}</p>
        <p>Redirecting to login page...</p>
      </div>
    );
  }

  // If not authenticated and no error, show processing message
  if (!isAuthenticated && !error) {
    // If callback processing is done but still not authenticated, show different message
    if (!isLoading && !isProcessingCallback) {
      return (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          flexDirection: 'column',
          gap: '20px',
          color: '#ff9800'
        }}>
          <h2>Authentication Incomplete</h2>
          <p>The authentication process completed but no valid session was found.</p>
          <p>Redirecting to login page...</p>
        </div>
      );
    }
    
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column' 
      }}>
        <p>Processing authentication... If you are not redirected, please try logging in again.</p>
      </div>
    );
  }

  // If authenticated, show success message while redirecting
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      flexDirection: 'column',
      gap: '20px',
      color: '#2e7d32'
    }}>
      <h2>Authentication Successful!</h2>
      <p>Redirecting to application...</p>
    </div>
  );
};

export default Callback;
