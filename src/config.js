// Helper function to get environment variable with runtime override
function getEnvVar(key, defaultValue = undefined) {
  // Check for runtime configuration first (injected at container startup)
  if (typeof window !== 'undefined' && window.RUNTIME_CONFIG && window.RUNTIME_CONFIG[key] && window.RUNTIME_CONFIG[key] !== `\${${key}}`) {
    return window.RUNTIME_CONFIG[key];
  }
  
  // Fall back to build-time environment variables
  return process.env[key] || defaultValue;
}

export function getConfig() {
  const authProvider = getEnvVar('REACT_APP_AUTH_PROVIDER');

  const config = {
    authProvider,
    apiBaseUrl: getEnvVar('REACT_APP_API_URL'),
    modules: {
      // Enable/disable modules (defaults to true if not specified)
      public: getEnvVar('REACT_APP_ENABLE_PUBLIC_MODULE') !== 'false',
      manager: getEnvVar('REACT_APP_ENABLE_MANAGER_MODULE') !== 'false',
    }
  };

  if (authProvider === 'auth0') {
    config.domain = getEnvVar('REACT_APP_AUTH0_DOMAIN');
    config.clientId = getEnvVar('REACT_APP_AUTH0_CLIENT_ID');
    config.audience = getEnvVar('REACT_APP_AUTH0_AUDIENCE');
    config.organizationClaim = getEnvVar('REACT_APP_AUTH0_ORGANIZATION_CLAIM', 'https://xians.ai/tenants');
  } else if (authProvider === 'entraId') {
    config.entraIdClientId = getEnvVar('REACT_APP_ENTRA_ID_CLIENT_ID');
    config.entraIdAuthority = getEnvVar('REACT_APP_ENTRA_ID_AUTHORITY');
    const scopes = getEnvVar('REACT_APP_ENTRA_ID_SCOPES');
    config.entraIdScopes = scopes ? scopes.split(',') : ['User.Read'];
    config.organizationClaim = getEnvVar('REACT_APP_ENTRA_ID_ORGANIZATION_CLAIM');
    const authorities = getEnvVar('REACT_APP_ENTRA_ID_KNOWN_AUTHORITIES');
    config.knownAuthorities = authorities ? authorities.split(',') : [];
  } else if (authProvider === 'keycloak') {
    config.keycloakUrl = getEnvVar('REACT_APP_KEYCLOAK_URL');
    config.keycloakRealm = getEnvVar('REACT_APP_KEYCLOAK_REALM');
    config.keycloakClientId = getEnvVar('REACT_APP_KEYCLOAK_CLIENT_ID');
  } else {
    throw new Error(`Unsupported auth provider: ${authProvider}`);
  }

  return config;
}
