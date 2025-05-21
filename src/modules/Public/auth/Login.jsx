import React from 'react';
// import { useAuth0 } from '@auth0/auth0-react'; // Old import
import { useAuth } from '../../../auth/AuthContext'; // New import

function Login() {
  // const { loginWithRedirect } = useAuth0(); // Old hook
  const { login, isLoading, isAuthenticated, error } = useAuth(); // New hook, login is now the generic login function

  React.useEffect(() => {
    // Only attempt to login if not already loading and not authenticated
    if (!isLoading && !isAuthenticated) {
      login(); // Call the generic login function
               // Specific options for login (like redirect URI for Auth0, or scopes for Entra ID)
               // should be configured within the respective service (Auth0Service, EntraIdService)
               // or passed here if the abstraction needs to support them dynamically.
               // For now, services use their default redirect URIs and scopes.
    }
  }, [login, isLoading, isAuthenticated]); // Add isLoading and isAuthenticated to dependencies

  if (isLoading) {
    return <div>Loading authentication provider...</div>;
  }

  if (error) {
    // Handle login initiation error, though most errors would occur after redirect
    return <div>Error initiating login: {error.message}. Please try again.</div>;
  }
  
  if (isAuthenticated) {
    // Should be redirected by protected routes or callback handler, 
    // but good to have a message if user lands here while authenticated.
    return <div>Already authenticated. Redirecting...</div>;
  }

  return <div>Redirecting to login...</div>;
}

export default Login;