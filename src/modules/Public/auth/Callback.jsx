import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../Manager/contexts/NotificationContext';
import { useAuth } from '../../Manager/auth/AuthContext';

const Callback = () => {
  const { isAuthenticated, error, isLoading } = useAuth();
  const navigate = useNavigate();
  const { showError } = useNotification();

  useEffect(() => {
    // Only show errors that persist after the redirect handling
    if (error) {
      console.error('Authentication error persisted after redirect handling:', error);
      showError(error.message || 'Authentication failed');
      navigate('/login');
      return;
    }
    
    // Redirect to application main route after successful auth
    if (!isLoading && isAuthenticated) {
      navigate('/runs');
    }
  }, [isAuthenticated, error, isLoading, navigate, showError]);

  // Simple UI during loading
  if (isLoading) {
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
      </div>
    );
  }

  if (!isAuthenticated && !error) {
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

  return null;
};

export default Callback;
