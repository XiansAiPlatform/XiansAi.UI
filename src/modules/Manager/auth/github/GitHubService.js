import { getConfig } from '../../../../config';

class GitHubService {
  constructor() {
    const config = getConfig();
    this.config = {
      clientId: config.githubClientId,
      authUrl: config.githubAuthUrl || 'https://github.com/login/oauth/authorize',
      redirectUri: config.githubRedirectUri || window.location.origin + '/callback',
      scope: config.githubScope || 'read:user user:email',
      apiBaseUrl: config.apiBaseUrl
    };
    
    this.authState = {
      user: null,
      isAuthenticated: false,
      accessToken: null,
    };
    this.onAuthStateChangedCallback = () => {};
  }

  async init() {
    try {
      // Check if we have a stored token
      const token = localStorage.getItem('access_token');
      if (token) {
        // Validate the token
        const isValid = await this._validateToken(token);
        if (isValid) {
          this._updateAuthState({
            user: this._extractUserFromToken(token),
            isAuthenticated: true,
            accessToken: token
          });
        } else {
          // Clear invalid token
          localStorage.removeItem('access_token');
        }
      }
    } catch (error) {
      console.error("Error initializing GitHubService:", error);
      localStorage.removeItem('access_token');
    }
  }

  /**
   * Check if current URL is in callback flow
   */
  isInCallbackFlow() {
    const params = new URLSearchParams(window.location.search);
    return params.has('code') && params.has('state');
  }

  /**
   * Check if current URL is logout callback
   */
  isLogoutCallback() {
    return false; // GitHub doesn't have a logout callback
  }

  /**
   * Start the GitHub OAuth login flow
   */
  async login() {
    try {
      // Generate a random state to mitigate CSRF
      const state = crypto.randomUUID();
      sessionStorage.setItem('gh_oauth_state', state);

      const params = new URLSearchParams({
        client_id: this.config.clientId,
        redirect_uri: this.config.redirectUri,
        scope: this.config.scope,
        state
      });

      window.location.href = `${this.config.authUrl}?${params.toString()}`;
    } catch (error) {
      console.error("Error starting GitHub login:", error);
      throw error;
    }
  }

  /**
   * Handle the OAuth callback
   */
  async handleRedirectCallback() {
    try {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const returnedState = params.get('state');
      const expectedState = sessionStorage.getItem('gh_oauth_state');

      // Clean up state
      sessionStorage.removeItem('gh_oauth_state');

      if (!code || !returnedState || returnedState !== expectedState) {
        throw new Error('Invalid OAuth state - possible CSRF attack');
      }

      // Exchange code for token
      const response = await fetch(`${this.config.apiBaseUrl}/api/public/auth/github/callback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          code, 
          redirectUri: this.config.redirectUri 
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to exchange code for token');
      }

      const { token } = await response.json();
      
      // Store the token
      localStorage.setItem('access_token', token);

      // Update auth state
      this._updateAuthState({
        user: this._extractUserFromToken(token),
        isAuthenticated: true,
        accessToken: token
      });

      return token;
    } catch (error) {
      console.error("Error handling GitHub callback:", error);
      throw error;
    }
  }

  /**
   * Logout the user
   */
  async logout() {
    try {
      // Clear local storage
      localStorage.removeItem('access_token');
      
      // Update auth state
      this._updateAuthState({
        user: null,
        isAuthenticated: false,
        accessToken: null
      });

      // Redirect to login
      window.location.href = '/login';
    } catch (error) {
      console.error("Error during logout:", error);
      throw error;
    }
  }

  /**
   * Get the current auth state
   */
  getAuthState() {
    return this.authState;
  }

  /**
   * Get the access token
   */
  async getAccessToken() {
    if (this.authState.accessToken) {
      // Validate token before returning
      const isValid = await this._validateToken(this.authState.accessToken);
      if (isValid) {
        return this.authState.accessToken;
      }
    }
    return null;
  }

  /**
   * Get access token silently (required by AuthContext)
   * For GitHub, this is the same as getAccessToken since we store JWT locally
   */
  async getAccessTokenSilently(options = {}) {
    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        throw new Error('No token available - login required');
      }

      // Validate token
      const isValid = await this._validateToken(token);
      if (!isValid) {
        localStorage.removeItem('access_token');
        throw new Error('Token expired - login required');
      }

      // Update auth state
      this.authState.accessToken = token;
      return token;
    } catch (error) {
      console.error("GitHubService: getAccessTokenSilently failed:", error);
      throw error;
    }
  }

  /**
   * Set callback for auth state changes
   */
  onAuthStateChanged(callback) {
    this.onAuthStateChangedCallback = callback;
  }

  /**
   * Private: Update auth state and notify listeners
   */
  _updateAuthState(state) {
    this.authState = {
      ...this.authState,
      ...state
    };
    
    if (this.onAuthStateChangedCallback) {
      this.onAuthStateChangedCallback(this.authState);
    }
  }

  /**
   * Private: Validate token
   */
  async _validateToken(token) {
    try {
      // Simple check: decode JWT and check expiration
      const payload = this._decodeJWT(token);
      if (!payload) return false;

      // Check if token is expired
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error validating token:", error);
      return false;
    }
  }

  /**
   * Private: Decode JWT token
   */
  _decodeJWT(token) {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const payload = JSON.parse(atob(parts[1]));
      return payload;
    } catch (error) {
      console.error("Error decoding JWT:", error);
      return null;
    }
  }

  /**
   * Private: Extract user info from JWT token
   */
  _extractUserFromToken(token) {
    try {
      const payload = this._decodeJWT(token);
      if (!payload) return null;

      return {
        sub: payload.sub,
        name: payload.name || payload.login,
        email: payload.email,
        login: payload.login,
        provider: 'github'
      };
    } catch (error) {
      console.error("Error extracting user from token:", error);
      return null;
    }
  }
}

export default GitHubService;

