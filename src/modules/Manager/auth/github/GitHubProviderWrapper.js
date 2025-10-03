import React, { useEffect, useState } from 'react';
import { AuthProvider } from '../AuthContext';
import GitHubService from './GitHubService';

const GitHubProviderWrapper = ({ children }) => {
  const [authService] = useState(() => new GitHubService());
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await authService.init();
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize GitHub auth:', error);
        setIsInitialized(true); // Still set to true to avoid blocking the app
      }
    };

    initializeAuth();
  }, [authService]);

  if (!isInitialized) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>Initializing authentication...</div>
      </div>
    );
  }

  return (
    <AuthProvider provider={authService}>
      {children}
    </AuthProvider>
  );
};

export default GitHubProviderWrapper;

