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

  useEffect(() => {
    if (AuthProviderInstance) {
      const initAuth = async () => {
        try {
          setIsLoading(true);
          console.log("AuthContext: Starting normal authentication initialization...");
          await AuthProviderInstance.init();
          const authState = AuthProviderInstance.getAuthState();
          console.log("AuthContext: Got auth state from provider:", authState);
          
          setUser(authState.user);
          setIsAuthenticated(authState.isAuthenticated);
          setAccessToken(authState.accessToken);
          
          console.log("AuthContext: Normal authentication initialization completed", {
            isAuthenticated: authState.isAuthenticated,
            user: authState.user?.name
          });
        } catch (e) {
          console.error("AuthContext: Error during initAuth:", e);
          setError(e);
        } finally {
          setIsLoading(false);
        }
      };

      // Detect if we're in a callback URL
      // For Auth0: check for code= and state= parameters
      // For MSAL/Entra ID: check for callback path or MSAL-specific parameters
      const hasAuth0Params = (window.location.search.includes("code=") && window.location.search.includes("state=")) || 
                            (window.location.hash.includes("code=") && window.location.hash.includes("state="));
      const hasEntraIdParams = window.location.pathname === '/callback' || 
                              window.location.search.includes("code=") || 
                              window.location.search.includes("error=") ||
                              window.location.search.includes("admin_consent=");
      
      const hasAuthParams = hasAuth0Params || hasEntraIdParams;
      
      if (!hasAuthParams) {
        // Normal init if not in a callback URL
        initAuth();
      } else if (hasAuthParams && !redirectCallbackHandled.current) {
        // We're in a callback URL and haven't handled it yet
        redirectCallbackHandled.current = true;
        setIsProcessingCallback(true);
        
        const handleRedirectCallback = async () => {
          try {
            console.log("AuthContext: Starting callback processing...");
            console.log("AuthContext: URL info - Path:", window.location.pathname, "Search:", window.location.search, "Hash:", window.location.hash);
            
            // Call the provider's handleRedirectCallback method
            await AuthProviderInstance.handleRedirectCallback();
            
            console.log("AuthContext: Callback processing completed, getting auth state...");
            const authState = AuthProviderInstance.getAuthState();
            console.log("AuthContext: Retrieved auth state:", authState);
            
            // Update React state
            setUser(authState.user);
            setIsAuthenticated(authState.isAuthenticated);
            setAccessToken(authState.accessToken);
            
            console.log("AuthContext: Callback processing successful", {
              isAuthenticated: authState.isAuthenticated,
              user: authState.user?.name
            });
            
            // Small delay to ensure state updates propagate before navigation
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Only clear URL parameters after successful authentication
            if (authState.isAuthenticated && window.history && window.history.replaceState) {
              console.log("AuthContext: Clearing URL parameters after successful authentication");
              window.history.replaceState({}, document.title, window.location.pathname);
            }
          } catch (e) {
            console.error("AuthContext: Error handling redirect callback:", e);
            setError(e);
          } finally {
            console.log("AuthContext: Callback processing finished");
            setIsLoading(false);
            setIsProcessingCallback(false);
          }
        };
        
        handleRedirectCallback();
      }

      const unsubscribe = AuthProviderInstance.onAuthStateChanged((authState) => {
        console.log("AuthContext: onAuthStateChanged triggered with:", authState);
        
        setUser(authState.user);
        setIsAuthenticated(authState.isAuthenticated);
        setAccessToken(authState.accessToken);
        if (!redirectCallbackHandled.current) {
          setIsLoading(false);
        }
        
        console.log("AuthContext: React state updated via onAuthStateChanged");
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
      await AuthProviderInstance.login(options);
    } catch (e) {
      setError(e);
      setIsLoading(false); // Ensure loading is set to false on error
    }
  };

  const logout = async (options) => {
    try {
      setIsLoading(true);
      // Ensure federated logout is requested
      const logoutOptions = {
        ...options,
        logoutParams: {
          ...(options?.logoutParams),
          federated: true,
        },
      };
      await AuthProviderInstance.logout(logoutOptions);
      // Explicitly set auth state to logged out
      setUser(null);
      setIsAuthenticated(false);
      setAccessToken(null);
      // Auth state will also be updated by onAuthStateChanged, but this makes it immediate
    } catch (e) {
      console.error("Error during logout:", e);
      setError(e);
    } finally {
      setIsLoading(false); // Ensure loading is set to false in all cases
    }
  };

  const getAccessTokenSilently = async (options) => {
    if (!AuthProviderInstance) return null;
    try {
      const token = await AuthProviderInstance.getAccessTokenSilently(options);
      setAccessToken(token);
      return token;
    } catch (e) {
      setError(e);
      // If getting token silently fails, it might mean session expired,
      // an interactive login might be required.
      // Depending on the provider, this might trigger a redirect or throw an error.
      // For now, we'll just re-throw, consumers can handle it.
      throw e;
    }
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
    // Expose the raw provider instance if needed for provider-specific functionalities
    // though it's better to abstract them into the generic interface if possible.
    providerInstance: AuthProviderInstance 
  };

  return <AuthContext value={value}>{children}</AuthContext>;
}; 