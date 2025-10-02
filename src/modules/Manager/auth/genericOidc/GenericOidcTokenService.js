class GenericOidcTokenService {
  getOrganizations(token) {
    try {
      // Check if token exists
      if (!token) {
        console.warn('GenericOidcTokenService: No token provided');
        return [];
      }

      const decodedToken = JSON.parse(atob(token.split('.')[1]));

      // Extract organizations from the configurable claim
      // Default to 'https://xians.ai/tenants' but can be configured
      const orgClaim = process.env.REACT_APP_GENERIC_OIDC_ORGANIZATION_CLAIM || 'https://xians.ai/tenants';
      
      if (decodedToken[orgClaim]) {
        // Handle both array and string formats
        if (Array.isArray(decodedToken[orgClaim])) {
          console.log('GenericOidcTokenService: Found organizations (array):', decodedToken[orgClaim]);
          return decodedToken[orgClaim];
        } else if (typeof decodedToken[orgClaim] === 'string') {
          console.log('GenericOidcTokenService: Found organization (string):', decodedToken[orgClaim]);
          return [decodedToken[orgClaim]];
        } else if (typeof decodedToken[orgClaim] === 'object') {
          // Handle object format like Keycloak
          const orgNames = Object.keys(decodedToken[orgClaim]);
          console.log('GenericOidcTokenService: Found organizations (object):', orgNames);
          return orgNames;
        }
      }
      
      // Fallback: check common alternative claims
      const fallbackClaims = ['tenants', 'organizations', 'orgs', 'groups'];
      for (const claim of fallbackClaims) {
        if (decodedToken[claim]) {
          if (Array.isArray(decodedToken[claim])) {
            console.log(`GenericOidcTokenService: Found organizations in ${claim}:`, decodedToken[claim]);
            return decodedToken[claim];
          } else if (typeof decodedToken[claim] === 'string') {
            console.log(`GenericOidcTokenService: Found organization in ${claim}:`, decodedToken[claim]);
            return [decodedToken[claim]];
          }
        }
      }
      
      // If no organization data found
      console.warn('GenericOidcTokenService: No organization data found in token');
      return [];
    } catch (error) {
      console.error('GenericOidcTokenService: Error extracting organizations', error);
      return [];
    }
  }
}

export default GenericOidcTokenService;

