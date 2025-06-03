export function getConfig() {
  const authProvider = process.env.REACT_APP_AUTH_PROVIDER || "keycloak"; // Default to auth0

  const config = {
    authProvider,
    apiBaseUrl: process.env.REACT_APP_API_URL,
    modules: {
      // Enable/disable modules (defaults to true if not specified)
      public: process.env.REACT_APP_ENABLE_PUBLIC_MODULE !== 'false',
      manager: process.env.REACT_APP_ENABLE_MANAGER_MODULE !== 'false',
      agents: process.env.REACT_APP_ENABLE_AGENTS_MODULE !== 'false',
    }
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
  } else if (authProvider === 'keycloak') {
    config.keycloakUrl = process.env.REACT_APP_KEYCLOAK_URL;
    config.keycloakRealm = process.env.REACT_APP_KEYCLOAK_REALM;
    config.keycloakClientId = process.env.REACT_APP_KEYCLOAK_CLIENT_ID;
    config.organizationClaim = process.env.REACT_APP_ENTRA_ID_ORGANIZATION_CLAIM || 'https://login-dev.parkly.no/tenants';
    config.knownAuthorities = process.env.REACT_APP_ENTRA_ID_KNOWN_AUTHORITIES ? process.env.REACT_APP_ENTRA_ID_KNOWN_AUTHORITIES.split(',') : [];
  }

  return config;
}
