import { getConfig } from '../../../../config';

/**
 * GitHub OAuth Service
 * Handles GitHub OAuth authentication flow with server-side JWT exchange
 */
class GitHubService {
  constructor() {
    const config = getConfig();
    this.config = config;
    this.authState = {
      user: null,
      isAuthenticated: false,
      accessToken: null
    };
    this.onAuthStateChangedCallback = () => {};
    this.isInitialized = false;
    this.isLoggingOut = false; // Flag to prevent login during logout
    
    console.log('GitHubService: Initialized with config:', {
      githubClientId: config.githubClientId ? 'configured' : 'missing',
      githubRedirectUri: config.githubRedirectUri,
      apiBaseUrl: config.apiBaseUrl
    });
  }

  /**
   * Initialize the service
   */
  async init() {
    if (this.isInitialized) return;

    try {
      console.log('GitHubService: Initializing...');
      
      // Check if there's a token in localStorage
      const token = localStorage.getItem('github_access_token');
      if (token) {
        console.log('GitHubService: Found stored token, validating...');
        
        // Validate token by decoding (basic check)
        const user = this.parseJwt(token);
        if (user && this.isTokenValid(token)) {
          console.log('GitHubService: Token is valid, restoring auth state');
          this.authState = {
            user: this._mapUserProfile(user),
            isAuthenticated: true,
            accessToken: token
          };
        } else {
          // Token is invalid or expired, clear it
          console.log('GitHubService: Token is invalid or expired, clearing');
          localStorage.removeItem('github_access_token');
        }
      } else {
        console.log('GitHubService: No stored token found');
      }

      this.isInitialized = true;
      this._notifyStateChange();
      console.log('GitHubService: Initialization complete');
    } catch (error) {
      console.error('GitHubService: Error during initialization:', error);
      this.authState = { user: null, isAuthenticated: false, accessToken: null };
      this.isInitialized = true;
    }
  }

  /**
   * Check if currently in OAuth callback flow
   */
  isInCallbackFlow() {
    const params = new URLSearchParams(window.location.search);
    return params.has('code') && params.has('state');
  }

  /**
   * Check if this is a logout callback (not applicable for GitHub)
   */
  isLogoutCallback() {
    return false;
  }

  /**
   * Initiate GitHub OAuth login
   */
  async login(options = {}) {
    try {
      console.log('GitHubService: Initiating login');
      
      // Prevent login if logout is in progress
      if (this.isLoggingOut) {
        console.warn('GitHubService: Login blocked - logout in progress');
        return;
      }
      
      // Generate random state for CSRF protection
      const state = this.generateRandomString();
      sessionStorage.setItem('github_oauth_state', state);

      // Store return path if provided
      if (options.returnTo) {
        sessionStorage.setItem('github_return_to', options.returnTo);
      }

      // Build GitHub authorization URL
      const params = new URLSearchParams({
        client_id: this.config.githubClientId,
        redirect_uri: this.config.githubRedirectUri,
        scope: this.config.githubScopes || 'read:user user:email',
        state: state,
        // Force GitHub to prompt for login even if user is already logged in
        // This prevents automatic re-authentication after logout
        prompt: 'login'
      });

      const authUrl = `https://github.com/login/oauth/authorize?${params.toString()}`;
      console.log('GitHubService: Redirecting to GitHub for authentication');
      
      // Redirect to GitHub
      window.location.href = authUrl;
    } catch (error) {
      console.error('GitHubService: Login error:', error);
      throw error;
    }
  }

  /**
   * Handle OAuth callback and exchange code for JWT
   */
  async handleRedirectCallback() {
    try {
      console.log('GitHubService: Handling redirect callback');
      console.log('GitHubService: Current URL:', window.location.href);
      
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const state = params.get('state');
      const error = params.get('error');
      const savedState = sessionStorage.getItem('github_oauth_state');

      // Check for OAuth errors
      if (error) {
        const errorDescription = params.get('error_description') || 'GitHub OAuth error';
        console.error('GitHubService: OAuth error:', error, errorDescription);
        throw new Error(`GitHub OAuth error: ${error} - ${errorDescription}`);
      }

      // Verify state to prevent CSRF
      if (!state || state !== savedState) {
        console.error('GitHubService: State mismatch - expected:', savedState, 'received:', state);
        throw new Error('Invalid OAuth state parameter - possible CSRF attack');
      }

      if (!code) {
        console.error('GitHubService: No authorization code received');
        throw new Error('No authorization code received from GitHub');
      }

      console.log('GitHubService: Exchanging code for JWT with server');

      // Exchange code for JWT with server
      const response = await fetch(`${this.config.apiBaseUrl}/api/public/auth/github/exchange`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code,
          redirectUri: this.config.githubRedirectUri
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('GitHubService: Server token exchange failed:', response.status, errorData);
        throw new Error(errorData.error_description || `Server error: ${response.status}`);
      }

      const data = await response.json();
      console.log('GitHubService: Server response:', data);
      
      // The server returns { AccessToken, TokenType, ExpiresIn }
      const token = data.AccessToken || data.accessToken || data.access_token;

      if (!token) {
        console.error('GitHubService: No access token in server response. Response keys:', Object.keys(data));
        console.error('GitHubService: Full server response:', data);
        throw new Error('No access token received from server');
      }

      console.log('GitHubService: Successfully received JWT from server');

      // Parse JWT to get user info
      const user = this.parseJwt(token);

      if (!user) {
        console.error('GitHubService: Failed to parse user info from JWT');
        throw new Error('Invalid JWT token received');
      }

      // Store token
      localStorage.setItem('github_access_token', token);

      // Update auth state
      this.authState = {
        user: this._mapUserProfile(user),
        isAuthenticated: true,
        accessToken: token
      };

      // Clean up session storage
      sessionStorage.removeItem('github_oauth_state');

      // Notify state change
      this._notifyStateChange();

      console.log('GitHubService: Authentication successful, user:', this.authState.user);

      // Get return path and clean up
      const returnTo = sessionStorage.getItem('github_return_to');
      sessionStorage.removeItem('github_return_to');

      return { user: this.authState.user, returnTo };

    } catch (error) {
      console.error('GitHubService: Callback error:', error);
      // Clean up on error
      sessionStorage.removeItem('github_oauth_state');
      sessionStorage.removeItem('github_return_to');
      localStorage.removeItem('github_access_token');
      
      // Reset auth state
      this.authState = {
        user: null,
        isAuthenticated: false,
        accessToken: null
      };
      this._notifyStateChange();
      
      throw error;
    }
  }

  /**
   * Logout
   */
  async logout(options = {}) {
    try {
      console.log('GitHubService: Starting logout process');
      
      // Set logout flag to prevent any login attempts during logout
      this.isLoggingOut = true;
      
      // Clear all GitHub-related storage items
      localStorage.removeItem('github_access_token');
      sessionStorage.removeItem('github_oauth_state');
      sessionStorage.removeItem('github_return_to');
      
      // Clear returnUrl that might trigger automatic navigation
      sessionStorage.removeItem('returnUrl');
      
      // Set a flag to prevent ProtectedRoute from auto-triggering login
      sessionStorage.setItem('just_logged_out', 'true');

      // Reset auth state
      this.authState = {
        user: null,
        isAuthenticated: false,
        accessToken: null
      };

      // Reset initialization flag to ensure clean state
      this.isInitialized = false;

      // Notify state change
      this._notifyStateChange();

      console.log('GitHubService: Logout completed, all storage and state cleared');

      // Redirect to login or provided returnTo
      const returnTo = options.returnTo || window.location.origin + '/login';
      
      // The flag will be cleared when the page reloads
      // Use window.location.replace instead of href to prevent back button issues
      window.location.replace(returnTo);
    } catch (error) {
      console.error('GitHubService: Logout error:', error);
      this.isLoggingOut = false; // Clear flag on error
      throw error;
    }
  }

  /**
   * Get access token
   */
  async getAccessTokenSilently(options = {}) {
    const token = localStorage.getItem('github_access_token');
    
    if (!token) {
      console.log('GitHubService: No access token available');
      throw new Error('Login required');
    }

    // Check if token is expired
    if (!this.isTokenValid(token)) {
      console.log('GitHubService: Token expired, clearing and requiring re-authentication');
      // Token expired, need to re-authenticate
      localStorage.removeItem('github_access_token');
      this.authState = {
        user: null,
        isAuthenticated: false,
        accessToken: null
      };
      this._notifyStateChange();
      throw new Error('Token expired');
    }

    this.authState.accessToken = token;
    return token;
  }

  /**
   * Get current auth state
   */
  getAuthState() {
    return { ...this.authState };
  }

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChanged(callback) {
    this.onAuthStateChangedCallback = callback;
    
    // Return unsubscribe function
    return () => {
      this.onAuthStateChangedCallback = () => {};
    };
  }

  /**
   * Notify subscriber of state change
   */
  _notifyStateChange() {
    if (typeof this.onAuthStateChangedCallback === 'function') {
      this.onAuthStateChangedCallback(this.getAuthState());
    }
  }

  /**
   * Parse JWT token
   */
  parseJwt(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      const payload = JSON.parse(jsonPayload);
      
      return {
        sub: payload.sub,
        name: payload.name || payload.preferred_username,
        email: payload.email,
        preferred_username: payload.preferred_username,
        iss: payload.iss,
        aud: payload.aud,
        exp: payload.exp,
        iat: payload.iat,
        jti: payload.jti
      };
    } catch (error) {
      console.error('GitHubService: Error parsing JWT:', error);
      return null;
    }
  }

  /**
   * Map user profile to standard format
   */
  _mapUserProfile(user) {
    if (!user) return null;
    
    // Extract user ID with fallbacks
    const userId = user.sub || user.preferred_username;
    
    // Extract name with fallbacks
    const userName = user.name || user.preferred_username || user.email?.split('@')[0] || 'User';
    
    // Extract email
    const userEmail = user.email || '';
    
    return {
      id: userId,
      name: userName,
      email: userEmail,
      picture: '', // GitHub avatar URL would need to be fetched separately
      username: user.preferred_username || userEmail,
      sub: user.sub,
      ...user // Spread all other profile properties
    };
  }

  /**
   * Check if token is valid (not expired)
   */
  isTokenValid(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      const payload = JSON.parse(jsonPayload);
      const now = Math.floor(Date.now() / 1000);
      
      return payload.exp && payload.exp > now;
    } catch (error) {
      return false;
    }
  }

  /**
   * Generate random string for state parameter
   */
  generateRandomString() {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return array[0].toString(36) + Date.now().toString(36);
  }

  /**
   * Check if provider is ready
   */
  isReady() {
    return this.isInitialized;
  }

  /**
   * Check if error is an account conflict error (for AuthContext compatibility)
   * GitHub OAuth doesn't typically have account conflicts like Enterprise providers
   */
  isAccountConflictError(error) {
    // GitHub OAuth doesn't have account conflicts like Entra ID/Azure
    // Return false to maintain compatibility with AuthContext
    return false;
  }

  /**
   * Get cached accounts (for AuthContext compatibility)
   * GitHub OAuth doesn't cache multiple accounts
   */
  getCachedAccounts() {
    return [];
  }

  /**
   * Check if there are multiple accounts (for AuthContext compatibility)
   * GitHub OAuth doesn't support multiple accounts
   */
  hasMultipleAccounts() {
    return false;
  }

  /**
   * Select account (for AuthContext compatibility)
   * Not applicable for GitHub OAuth
   */
  async selectAccount() {
    console.log('GitHubService: selectAccount called but not applicable for GitHub OAuth');
    return this.login();
  }

  /**
   * Force logout and clear (for AuthContext compatibility)
   */
  async forceLogoutAndClear(returnUrl) {
    console.log('GitHubService: forceLogoutAndClear called');
    return this.logout({ returnTo: returnUrl });
  }
}

export default GitHubService;

