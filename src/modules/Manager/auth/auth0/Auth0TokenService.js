import { getConfig } from '../../../../config';

class Auth0TokenService {
  getOrganizations(token) {
    const decodedToken = JSON.parse(atob(token.split('.')[1]));
    const orgInfoPath = getConfig().organizationClaim;
    let orgInfo = decodedToken[orgInfoPath];
    return Array.isArray(orgInfo) ? orgInfo : (orgInfo ? [orgInfo] : []);
  }

  // Add other Auth0 specific token utility functions if needed in the future
  // e.g., getPermissions(decodedToken), getRoles(decodedToken)
}

export default Auth0TokenService;