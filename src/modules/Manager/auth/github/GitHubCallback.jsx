import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

/**
 * GitHub OAuth Callback Component
 * Handles the OAuth callback from GitHub and exchanges code for JWT
 * Works with the AuthContext to handle the callback flow
 */
function GitHubCallback() {
  const navigate = useNavigate();
  const { providerInstance, isLoading, isAuthenticated, user } = useAuth();
  const [status, setStatus] = useState('processing');
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        if (!providerInstance) {
          console.log('GitHubCallback: Waiting for provider instance...');
          return; // Wait for provider to be ready
        }

        console.log('GitHubCallback: Starting callback handling');
        setStatus('processing');
        
        // The AuthContext should have already called handleRedirectCallback
        // during initialization, but if not, we can trigger it here
        if (!isLoading && !isAuthenticated) {
          console.log('GitHubCallback: Triggering manual callback handling');
          const result = await providerInstance.handleRedirectCallback();
          
          if (result && result.returnTo) {
            console.log('GitHubCallback: Redirecting to return URL:', result.returnTo);
            window.location.href = result.returnTo;
            return;
          }
        }
        
        setStatus('success');
        
        // Navigate to dashboard or return path after successful authentication
        setTimeout(() => {
          console.log('GitHubCallback: Navigating to dashboard');
          navigate('/manager/dashboard');
        }, 1000);
        
      } catch (error) {
        console.error('GitHubCallback: Error during callback handling:', error);
        setError(error.message || 'Authentication failed');
        setStatus('error');
        
        // Navigate to login page after error
        setTimeout(() => {
          console.log('GitHubCallback: Navigating to login due to error');
          navigate('/login');
        }, 3000);
      }
    };

    handleCallback();
  }, [navigate, providerInstance, isLoading, isAuthenticated, user]);

  // If we're authenticated, redirect immediately
  useEffect(() => {
    if (isAuthenticated && user && status === 'processing') {
      console.log('GitHubCallback: User is authenticated, redirecting to dashboard');
      setStatus('success');
      setTimeout(() => {
        navigate('/manager/dashboard');
      }, 500);
    }
  }, [isAuthenticated, user, status, navigate]);

  if (status === 'processing') {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        padding: '20px'
      }}>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #3498db',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <h2 style={{ marginTop: '20px', color: '#333' }}>
          Processing GitHub authentication...
        </h2>
        <p style={{ color: '#666', textAlign: 'center' }}>
          Please wait while we complete your login.
        </p>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        padding: '20px'
      }}>
        <div style={{ 
          width: '60px', 
          height: '60px', 
          backgroundColor: '#e74c3c',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px'
        }}>
          <span style={{ color: 'white', fontSize: '24px' }}>✗</span>
        </div>
        <h2 style={{ color: '#e74c3c', marginBottom: '10px' }}>
          Authentication Failed
        </h2>
        <p style={{ color: '#666', textAlign: 'center', marginBottom: '20px' }}>
          {error || 'An error occurred during authentication.'}
        </p>
        <p style={{ color: '#999', fontSize: '14px' }}>
          Redirecting to login page...
        </p>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        padding: '20px'
      }}>
        <div style={{ 
          width: '60px', 
          height: '60px', 
          backgroundColor: '#27ae60',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px'
        }}>
          <span style={{ color: 'white', fontSize: '24px' }}>✓</span>
        </div>
        <h2 style={{ color: '#27ae60', marginBottom: '10px' }}>
          Authentication Successful
        </h2>
        <p style={{ color: '#666', textAlign: 'center' }}>
          Redirecting to dashboard...
        </p>
      </div>
    );
  }

  return null;
}

export default GitHubCallback;
