class KeycloakTokenService {
  getOrganizations(token) {
    const decodedToken = JSON.parse(atob(token.split('.')[1]));

    try {
      // Check if token exists
      if (!decodedToken) {
        console.warn('KeycloakTokenService: No token provided');
        return [];
      }

      // Extract organizations directly from the 'organization' field
      if (decodedToken.organization && typeof decodedToken.organization === 'object') {
        // Extract organization names from the keys of the organization object
        const orgNames = Object.keys(decodedToken.organization);
        console.log('KeycloakTokenService: Found organizations:', orgNames);
        return orgNames;
      }
      
      // If no organization field or it's empty
      console.warn('KeycloakTokenService: No organization data found in token');
      return [];
    } catch (error) {
      console.error('KeycloakTokenService: Error extracting organizations', error);
      return [];
    }
  }
}

export default KeycloakTokenService;