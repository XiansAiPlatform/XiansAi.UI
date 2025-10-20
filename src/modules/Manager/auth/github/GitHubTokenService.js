import { getConfig } from '../../../../config';

/**
 * GitHub Token Service
 * Handles token retrieval and organization extraction for GitHub authentication
 */
class GitHubTokenService {
  /**
   * Extract organizations from the access token
   * @param {string} token - The access token (JWT from server)
   * @returns {Array} Array of organization identifiers
   */
  getOrganizations(token) {
    try {
      // Check if token exists
      if (!token) {
        console.warn('GitHubTokenService: No token provided');
        return [];
      }

      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      const config = getConfig();
      
      // Use the configured organization claim path
      const orgClaimPath = config.organizationClaim || 'organizations';
      let orgInfo = decodedToken[orgClaimPath];
      
      // Handle both array and single value
      if (Array.isArray(orgInfo)) {
        console.log('GitHubTokenService: Found organizations array:', orgInfo);
        return orgInfo;
      } else if (orgInfo) {
        console.log('GitHubTokenService: Found single organization:', orgInfo);
        return [orgInfo];
      }
      
      // If no organization claim found, log available claims for debugging
      console.warn('GitHubTokenService: No organization data found in token');
      console.debug('GitHubTokenService: Available claims:', Object.keys(decodedToken));
      return [];
    } catch (error) {
      console.error('GitHubTokenService: Error extracting organizations', error);
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
      console.error("GitHubTokenService: Error extracting claim:", error);
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
      console.error("GitHubTokenService: Error decoding token:", error);
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
      console.error("GitHubTokenService: Error checking token expiration:", error);
      return true;
    }
  }

  /**
   * Get user ID from token
   * @param {string} token - The access token
   * @returns {string|null} User ID or null
   */
  getUserId(token) {
    return this.getClaim(token, 'sub') || this.getClaim(token, 'preferred_username');
  }

  /**
   * Get user email from token
   * @param {string} token - The access token
   * @returns {string|null} User email or null
   */
  getUserEmail(token) {
    return this.getClaim(token, 'email');
  }

  /**
   * Get user name from token
   * @param {string} token - The access token
   * @returns {string|null} User name or null
   */
  getUserName(token) {
    return this.getClaim(token, 'name') || this.getClaim(token, 'preferred_username');
  }
}

export default GitHubTokenService;

