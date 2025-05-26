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
    config.organizationClaim = process.env.REACT_APP_AUTH0_ORGANIZATION_CLAIM || 'https://xians.ai/tenants';
  } else if (authProvider === 'entraId') {
    config.entraIdClientId = process.env.REACT_APP_ENTRA_ID_CLIENT_ID;
    config.entraIdAuthority = process.env.REACT_APP_ENTRA_ID_AUTHORITY;
    config.entraIdScopes = process.env.REACT_APP_ENTRA_ID_SCOPES ? process.env.REACT_APP_ENTRA_ID_SCOPES.split(',') : ['User.Read'];
    config.organizationClaim = process.env.REACT_APP_ENTRA_ID_ORGANIZATION_CLAIM || 'roles';
    config.knownAuthorities = process.env.REACT_APP_ENTRA_ID_KNOWN_AUTHORITIES ? process.env.REACT_APP_ENTRA_ID_KNOWN_AUTHORITIES.split(',') : [];

  }

  return config;
}
