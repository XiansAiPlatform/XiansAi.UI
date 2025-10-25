import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Manager/auth/AuthContext';
import AccountConflictHandler from '../../Manager/Components/Common/AccountConflictHandler';
import useAccountConflictHandler from '../../Manager/Components/Common/useAccountConflictHandler';
import { 
  Box, 
  Typography, 
  Alert, 
  Button, 
  CircularProgress,
  Paper,
  Container
} from '@mui/material';
import { Login as LoginIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { Link } from 'react-router-dom';

function Login() {
  const { login, isLoading, isAuthenticated, error, clearError } = useAuth();
  const [attemptedLogin, setAttemptedLogin] = useState(false);
  const navigate = useNavigate();
  
  // Use the account conflict handler
  const { dialogProps } = useAccountConflictHandler({
    onConflictDetected: (conflictError) => {
      console.log('Account conflict detected in Login component:', conflictError);
    },
    onResolved: () => {
      console.log('Account conflict resolved, login can proceed');
      setAttemptedLogin(false); // Reset so login can be attempted again
    }
  });

  // Check if this is an account conflict error
  const isAccountConflictError = error && (
    error.type === 'INTERACTION_REQUIRED' || 
    error.code === 'INTERACTION_REQUIRED' ||
    error.message?.includes('AADB2C90077') ||
    error.message?.includes('account conflict') ||
    error.message?.includes('authority_mismatch')
  );

  // Check for URL parameters indicating specific scenarios
  const urlParams = new URLSearchParams(window.location.search);
  const errorParam = urlParams.get('error');
  const messageParam = urlParams.get('message');
  const clearedParam = urlParams.get('cleared');

  useEffect(() => {
    // Redirect authenticated users to the main application
    if (isAuthenticated && !isLoading) {
      navigate('/manager/definitions');
      return;
    }

    // Don't auto-login - require explicit user action
    // This prevents automatic re-authentication after logout
  }, [isLoading, isAuthenticated, navigate]);

  const handleRetryLogin = () => {
    clearError();
    setAttemptedLogin(false);
  };

  const handleManualLogin = () => {
    // Clear the logout flag since user is intentionally logging in
    sessionStorage.removeItem('just_logged_out');
    clearError();
    setAttemptedLogin(true);
    // Call login without options - the GitHubService already sets prompt: 'login'
    login();
  };

  if (isLoading) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <CircularProgress size={40} sx={{ mb: 2 }} />
          <Typography variant="h6">Loading authentication provider...</Typography>
        </Paper>
      </Container>
    );
  }

  if (isAuthenticated) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="success.main">
            Already authenticated. Redirecting... OR click <Link to="/manager/definitions">here</Link>
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box textAlign="center" mb={3}>
          <Typography variant="h4" component="h1" gutterBottom>
            Sign In
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Please sign in to access your account
          </Typography>
        </Box>

        {/* Show success message if accounts were cleared */}
        {clearedParam && (
          <Alert severity="success" sx={{ mb: 3 }}>
            All cached accounts have been cleared. You can now sign in with a fresh session.
          </Alert>
        )}

        {/* Show authority mismatch error message */}
        {errorParam === 'authority_mismatch' && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Account Authority Mismatch
            </Typography>
            <Typography variant="body2">
              The cached account belongs to a different organization or tenant than this application is configured for. 
              All cached accounts have been cleared. Please sign in with an account that belongs to the correct organization.
            </Typography>
          </Alert>
        )}

        {/* Show error message from URL parameters */}
        {errorParam === 'account_conflict' && messageParam && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            {decodeURIComponent(messageParam)}
          </Alert>
        )}

        {/* Show non-conflict errors */}
        {error && !isAccountConflictError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Login Error
            </Typography>
            <Typography variant="body2">
              {error.message || 'An error occurred during login. Please try again.'}
            </Typography>
            <Button 
              size="small" 
              startIcon={<RefreshIcon />}
              onClick={handleRetryLogin}
              sx={{ mt: 1 }}
            >
              Try Again
            </Button>
          </Alert>
        )}

        {/* Login actions */}
        <Box textAlign="center">
          {attemptedLogin ? (
            <Box>
              <CircularProgress size={24} sx={{ mr: 2 }} />
              <Typography variant="body2" color="text.secondary">
                Redirecting to sign in...
              </Typography>
            </Box>
          ) : (
            <Button
              variant="contained"
              size="large"
              startIcon={<LoginIcon />}
              onClick={handleManualLogin}
              sx={{ minWidth: 200 }}
              disabled={isLoading}
            >
              Sign In
            </Button>
          )}
        </Box>

        {/* Help text */}
        <Typography variant="caption" color="text.secondary" textAlign="center" display="block" sx={{ mt: 3 }}>
          If you're having trouble signing in with different SSO accounts, 
          try using a different browser or an incognito/private browser window.
        </Typography>
      </Paper>

      {/* Account Conflict Handler Dialog */}
      <AccountConflictHandler {...dialogProps} />
    </Container>
  );
}

export default Login;