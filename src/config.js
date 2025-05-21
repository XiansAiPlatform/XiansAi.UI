export function getConfig() {
  const authProvider = process.env.REACT_APP_AUTH_PROVIDER || 'auth0'; // Default to auth0

  const config = {
    authProvider,
    apiBaseUrl: process.env.REACT_APP_API_URL,
  };

  if (authProvider === 'auth0') {
    config.domain = process.env.REACT_APP_AUTH0_DOMAIN;
    config.clientId = process.env.REACT_APP_AUTH0_CLIENT_ID;
    config.audience = process.env.REACT_APP_AUTH0_AUDIENCE;
  } else if (authProvider === 'entraId') {
    config.entraIdClientId = process.env.REACT_APP_ENTRA_ID_CLIENT_ID;
    config.entraIdAuthority = process.env.REACT_APP_ENTRA_ID_AUTHORITY;
    config.entraIdScopes = process.env.REACT_APP_ENTRA_ID_SCOPES ? process.env.REACT_APP_ENTRA_ID_SCOPES.split(',') : ['User.Read'];
  }

  return config;
}
