import { getConfig } from '../../../config';
import Auth0TokenService from './auth0/Auth0TokenService';
import EntraIdTokenService from './entraId/EntraIdTokenService';
import KeycloakTokenService from './keycloak/KeycloakTokenService';

let tokenServiceInstance = null;

export function createTokenService() {
  if (tokenServiceInstance) {
    return tokenServiceInstance;
  }

  const authProvider = getConfig().authProvider;

  switch (authProvider) {
    case 'auth0':
      tokenServiceInstance = new Auth0TokenService();
      break;
    case 'entraId':
      tokenServiceInstance = new EntraIdTokenService();
      break;
    case 'keycloak':
      tokenServiceInstance = new KeycloakTokenService();
      break;
    default:
      throw new Error(`Unsupported auth provider: ${authProvider}`);
  }
  
  return tokenServiceInstance;
}
