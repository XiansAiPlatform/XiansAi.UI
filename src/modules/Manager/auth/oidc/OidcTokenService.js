import { getConfig } from '../../../../config';

class OidcTokenService {
  /**
   * Extract organizations from the access token
   * @param {string} token - The access token
   * @returns {Array} Array of organization identifiers
   */
  getOrganizations(token) {
    try {
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      const config = getConfig();
      
      // Use the configured organization claim path
      const orgClaimPath = config.organizationClaim || 'organizations';
      let orgInfo = decodedToken[orgClaimPath];
      
      // Handle both array and single value
      return Array.isArray(orgInfo) ? orgInfo : (orgInfo ? [orgInfo] : []);
    } catch (error) {
      console.error("OidcTokenService: Error decoding token:", error);
      return [];
    }
  }

  /**
   * Get a specific claim from the token
   * @param {string} token - The access token
   * @param {string} claimName - Name of the claim to extract
   * @returns {any} The claim value or null
   */
  getClaim(token, claimName) {
    try {
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      return decodedToken[claimName] || null;
    } catch (error) {
      console.error("OidcTokenService: Error extracting claim:", error);
      return null;
    }
  }

  /**
   * Decode the entire token payload
   * @param {string} token - The access token
   * @returns {object} The decoded token payload
   */
  decodeToken(token) {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (error) {
      console.error("OidcTokenService: Error decoding token:", error);
      return null;
    }
  }

  /**
   * Check if token is expired
   * @param {string} token - The access token
   * @returns {boolean} True if expired, false otherwise
   */
  isTokenExpired(token) {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded || !decoded.exp) {
        return true;
      }
      // exp is in seconds, Date.now() is in milliseconds
      return decoded.exp * 1000 < Date.now();
    } catch (error) {
      console.error("OidcTokenService: Error checking token expiration:", error);
      return true;
    }
  }
}

export default OidcTokenService;

