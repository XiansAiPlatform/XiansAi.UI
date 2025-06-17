import { createContext, use, useState, useEffect, useRef } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => use(AuthContext);

export const AuthProvider = ({ children, provider: AuthProviderInstance }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const redirectCallbackHandled = useRef(false);

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
          console.error("Error during initAuth:", e);
          setError(e);
        } finally {
          setIsLoading(false);
        }
      };

      // Only call this if we're not in the callback URL or if we're in the callback URL 
      // and haven't handled the callback yet (to avoid infinite loop)
      const hasAuthParams = (window.location.search.includes("code=") && window.location.search.includes("state=")) || (window.location.hash.includes("code=") && window.location.hash.includes("state="));
      if (!hasAuthParams) {
        // Normal init if not in a callback URL
        initAuth();
      } else if (hasAuthParams && !redirectCallbackHandled.current) {
        // We're in a callback URL and haven't handled it yet
        redirectCallbackHandled.current = true;
        
        const handleRedirectCallback = async () => {
          try {
            console.log("Handling Auth redirect callback...");
            await AuthProviderInstance.handleRedirectCallback();
            const authState = AuthProviderInstance.getAuthState();
            setUser(authState.user);
            setIsAuthenticated(authState.isAuthenticated);
            setAccessToken(authState.accessToken);
            // Clear URL parameters after successful handling
            if (window.history && window.history.replaceState) {
              window.history.replaceState({}, document.title, window.location.pathname);
            }
          } catch (e) {
            console.error("Error handling redirect callback:", e);
            setError(e);
          } finally {
            setIsLoading(false);
          }
        };
        
        handleRedirectCallback();
      }

      const unsubscribe = AuthProviderInstance.onAuthStateChanged((authState) => {
        setUser(authState.user);
        setIsAuthenticated(authState.isAuthenticated);
        setAccessToken(authState.accessToken);
        setIsLoading(false);
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
    login,
    logout,
    getAccessTokenSilently,
    // Expose the raw provider instance if needed for provider-specific functionalities
    // though it's better to abstract them into the generic interface if possible.
    providerInstance: AuthProviderInstance 
  };

  return <AuthContext value={value}>{children}</AuthContext>;
}; 