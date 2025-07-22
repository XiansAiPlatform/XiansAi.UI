import { createContext, use, useState, useEffect, useRef } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => use(AuthContext);

export const AuthProvider = ({ children, provider: AuthProviderInstance }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [isProcessingCallback, setIsProcessingCallback] = useState(false);
  const redirectCallbackHandled = useRef(false);
  const isLoggingOut = useRef(false);

  useEffect(() => {
    if (AuthProviderInstance) {
      const initAuth = async () => {
        try {
          setIsLoading(true);
          await AuthProviderInstance.init();
          const authState = AuthProviderInstance.getAuthState();
          
          setUser(authState.user);
          setIsAuthenticated(authState.isAuthenticated);
          setAccessToken(authState.accessToken);
        } catch (e) {
          console.error("AuthContext: Error during initAuth:", e);
          setError(e);
        } finally {
          setIsLoading(false);
        }
      };

      // Use the provider's generic methods to detect callback flow
      const isInCallbackFlow = AuthProviderInstance.isInCallbackFlow && AuthProviderInstance.isInCallbackFlow();
      const isLogoutCallback = AuthProviderInstance.isLogoutCallback && AuthProviderInstance.isLogoutCallback();
      
      if (isLogoutCallback) {
        // Handle logout callback - redirect to login page
        console.log("AuthContext: Detected logout callback, redirecting to login");
        setIsLoading(false);
        window.location.replace('/login');
        return;
      } else if (!isInCallbackFlow) {
        // Normal init if not in a callback URL
        initAuth();
      } else if (isInCallbackFlow && !redirectCallbackHandled.current) {
        // We're in a callback URL and haven't handled it yet
        redirectCallbackHandled.current = true;
        setIsProcessingCallback(true);
        
        const handleRedirectCallback = async () => {
          try {
            // Call the provider's handleRedirectCallback method
            await AuthProviderInstance.handleRedirectCallback();
            const authState = AuthProviderInstance.getAuthState();
            
            // Update React state
            setUser(authState.user);
            setIsAuthenticated(authState.isAuthenticated);
            setAccessToken(authState.accessToken);
            
            // Small delay to ensure state updates propagate before navigation
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Only clear URL parameters after successful authentication
            if (authState.isAuthenticated && window.history && window.history.replaceState) {
              window.history.replaceState({}, document.title, window.location.pathname);
            }
          } catch (e) {
            console.error("AuthContext: Error handling redirect callback:", e);
            
            // Check if this is an interaction required error
            if (AuthProviderInstance.handleAuthenticationError) {
              const errorInfo = await AuthProviderInstance.handleAuthenticationError(e, 'redirectCallback');
              
              if (errorInfo.type === 'INTERACTION_REQUIRED') {
                console.warn("AuthContext: Interaction required error in callback, redirecting to login with account selection");
                
                // Clear any stale state
                setUser(null);
                setIsAuthenticated(false);
                setAccessToken(null);
                
                // Redirect to login page with error indication
                window.location.replace('/login?error=account_conflict&message=' + encodeURIComponent('Multiple accounts detected. Please select the account you want to use.'));
                return;
              }
            }
            
            setError(e);
          } finally {
            setIsLoading(false);
            setIsProcessingCallback(false);
          }
        };
        
        handleRedirectCallback();
      }

      const unsubscribe = AuthProviderInstance.onAuthStateChanged((authState) => {
        
        setUser(authState.user);
        setIsAuthenticated(authState.isAuthenticated);
        setAccessToken(authState.accessToken);
        if (!redirectCallbackHandled.current) {
          setIsLoading(false);
        }
      });

      return () => {
        if (unsubscribe && typeof unsubscribe === 'function') {
          unsubscribe();
        }
      };
    }
  }, [AuthProviderInstance]);

  const login = async (options) => {
    try {
      setIsLoading(true);
      setError(null); // Clear any previous errors
      await AuthProviderInstance.login(options);
    } catch (e) {
      console.warn("AuthContext: Login failed:", e);
      
      // Check if this is an interaction required error that we can handle gracefully
      if (AuthProviderInstance.handleAuthenticationError) {
        const errorInfo = await AuthProviderInstance.handleAuthenticationError(e, 'login');
        
        if (errorInfo.type === 'INTERACTION_REQUIRED') {
          setError({
            ...errorInfo,
            userMessage: 'Multiple Microsoft accounts detected. Please select the account you want to use.'
          });
        } else {
          setError(errorInfo);
        }
      } else {
        setError(e);
      }
      
      setIsLoading(false); // Ensure loading is set to false on error
    }
  };

  const logout = async (options) => {
    try {
      setIsLoading(true);
      isLoggingOut.current = true;
      
      // Explicitly set auth state to logged out immediately
      setUser(null);
      setIsAuthenticated(false);
      setAccessToken(null);
      setError(null);
      
      await AuthProviderInstance.logout(options);
      
    } catch (e) {
      console.error("Error during logout:", e);
      setError(e);
      // Even if logout fails, redirect to login page
      setTimeout(() => {
        window.location.replace('/login');
      }, 1000);
    } finally {
      setIsLoading(false);
      isLoggingOut.current = false;
    }
  };

  const getAccessTokenSilently = async (options) => {
    if (!AuthProviderInstance) return null;
    try {
      const token = await AuthProviderInstance.getAccessTokenSilently(options);
      setAccessToken(token);
      setError(null); // Clear any previous errors on success
      return token;
    } catch (e) {
      console.warn("AuthContext: getAccessTokenSilently failed:", e);
      
      // Check if this is an interaction required error that we can handle gracefully
      if (AuthProviderInstance.handleAuthenticationError) {
        const errorInfo = await AuthProviderInstance.handleAuthenticationError(e, 'getAccessTokenSilently');
        
        if (errorInfo.type === 'INTERACTION_REQUIRED') {
          console.log("AuthContext: Interaction required, clearing auth state");
          
          // Clear the current auth state since the session is invalid
          setUser(null);
          setIsAuthenticated(false);
          setAccessToken(null);
          
          // Set a more user-friendly error with recovery options
          setError({
            ...errorInfo,
            userMessage: 'Your session has expired or there is an account conflict. Please login again.'
          });
          
          // Don't re-throw here, let the component handle the error state
          return null;
        }
      }
      
      setError(e);
      // Re-throw for other types of errors
      throw e;
    }
  };


  // Utility methods for handling account conflicts
  const selectAccount = async () => {
    if (AuthProviderInstance.selectAccount) {
      try {
        setIsLoading(true);
        setError(null);
        await AuthProviderInstance.selectAccount();
      } catch (e) {
        console.error("AuthContext: Account selection failed:", e);
        setError(e);
        setIsLoading(false);
      }
    } else {
      // Fallback to regular login with select_account prompt
      await login({ prompt: 'select_account' });
    }
  };

  const forceLogoutAndClear = async (returnUrl) => {
    if (AuthProviderInstance.forceLogoutAndClear) {
      try {
        setIsLoading(true);
        setError(null);
        
        // Clear local state immediately
        setUser(null);
        setIsAuthenticated(false);
        setAccessToken(null);
        
        await AuthProviderInstance.forceLogoutAndClear(returnUrl);
      } catch (e) {
        console.error("AuthContext: Force logout failed:", e);
        // Fallback to regular logout
        await logout({ returnTo: returnUrl });
      }
    } else {
      // Fallback to regular logout
      await logout({ returnTo: returnUrl });
    }
  };

  const clearError = () => {
    setError(null);
  };

  const hasMultipleAccounts = () => {
    // Check if provider is ready before calling method
    if (AuthProviderInstance.isReady && !AuthProviderInstance.isReady()) {
      return false;
    }
    return AuthProviderInstance.hasMultipleAccounts ? AuthProviderInstance.hasMultipleAccounts() : false;
  };

  const getCachedAccounts = () => {
    // Check if provider is ready before calling method
    if (AuthProviderInstance.isReady && !AuthProviderInstance.isReady()) {
      return [];
    }
    return AuthProviderInstance.getCachedAccounts ? AuthProviderInstance.getCachedAccounts() : [];
  };

  const isAccountConflictError = (error) => {
    if (AuthProviderInstance.isAccountConflictError) {
      return AuthProviderInstance.isAccountConflictError(error);
    }
    // Fallback check
    return error && (
      error.code === 'INTERACTION_REQUIRED' ||
      error.type === 'INTERACTION_REQUIRED' ||
      error.message?.includes('AADB2C90077') ||
      error.message?.includes('account conflict')
    );
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    error,
    accessToken,
    isProcessingCallback,
    login,
    logout,
    getAccessTokenSilently,
    // Account conflict handling utilities
    selectAccount,
    forceLogoutAndClear,
    clearError,
    hasMultipleAccounts,
    getCachedAccounts,
    isAccountConflictError,
    // Expose the raw provider instance if needed for provider-specific functionalities
    // though it's better to abstract them into the generic interface if possible.
    providerInstance: AuthProviderInstance 
  };

  return <AuthContext value={value}>{children}</AuthContext>;
}; 