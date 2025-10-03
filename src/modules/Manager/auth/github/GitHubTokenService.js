import { getConfig } from '../../../../config';

class GitHubTokenService {
  constructor() {
    this.config = getConfig();
  }

  /**
   * Get the access token from localStorage
   */
  async getAccessToken() {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        return null;
      }

      // Validate token before returning
      if (this._isTokenExpired(token)) {
        console.warn('Token is expired, clearing...');
        localStorage.removeItem('access_token');
        return null;
      }

      return token;
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  }

  /**
   * Check if token is expired
   */
  _isTokenExpired(token) {
    try {
      const payload = this._decodeJWT(token);
      if (!payload || !payload.exp) {
        return true;
      }

      // Add a small buffer (5 minutes) to refresh before actual expiration
      const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds
      return payload.exp * 1000 - bufferTime < Date.now();
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true;
    }
  }

  /**
   * Decode JWT token
   */
  _decodeJWT(token) {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const payload = JSON.parse(atob(parts[1]));
      return payload;
    } catch (error) {
      console.error('Error decoding JWT:', error);
      return null;
    }
  }

  /**
   * Clear the access token
   */
  clearToken() {
    localStorage.removeItem('access_token');
  }
}

export default GitHubTokenService;

