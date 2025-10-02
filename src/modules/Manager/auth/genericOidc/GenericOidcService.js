import { getConfig } from '../../../../config';

class GenericOidcService {
  constructor() {
    const config = getConfig();
    this.config = {
      authority: config.genericOidcAuthority,
      clientId: config.genericOidcClientId,
      scope: config.genericOidcScope || 'openid profile',
      redirectUri: window.location.origin + '/callback',
      postLogoutRedirectUri: window.location.origin + '/login',
      responseType: 'code',
      responseMode: 'query',
      automaticSilentRenew: true,
      loadUserInfo: true,
      metadata: {
        issuer: config.genericOidcAuthority,
        authorization_endpoint: `${config.genericOidcAuthority}/oauth2/authorize`,
        token_endpoint: `${config.genericOidcAuthority}/oauth2/token`,
        userinfo_endpoint: `${config.genericOidcAuthority}/oauth2/userinfo`,
        end_session_endpoint: `${config.genericOidcAuthority}/oauth2/logout`,
        jwks_uri: `${config.genericOidcAuthority}/oauth2/jwks`
      }
    };
    
    this.authState = {
      user: null,
      isAuthenticated: false,
      accessToken: null,
    };
    this.onAuthStateChangedCallback = () => {};
    this.userManager = null;
  }

  async init() {
    try {
      // Import oidc-client-ts
      const oidcClient = await import('oidc-client-ts');
      const { UserManager } = oidcClient;
      
      this.userManager = new UserManager({
        authority: this.config.authority,
        client_id: this.config.clientId,
        redirect_uri: this.config.redirectUri,
        post_logout_redirect_uri: this.config.postLogoutRedirectUri,
        response_type: this.config.responseType,
        scope: this.config.scope,
        automaticSilentRenew: this.config.automaticSilentRenew,
        loadUserInfo: this.config.loadUserInfo,
        metadata: this.config.metadata,
        filterProtocolClaims: true
      });

      // Set up event handlers
      this.userManager.events.addUserLoaded((user) => {
        console.log('GenericOidcService: User loaded', user);
        this._updateAuthState(user);
      });

      this.userManager.events.addUserUnloaded(() => {
        console.log('GenericOidcService: User unloaded');
        this._updateAuthState(null);
      });

      this.userManager.events.addAccessTokenExpiring(() => {
        console.log('GenericOidcService: Access token expiring');
        this._renewToken();
      });

      this.userManager.events.addAccessTokenExpired(() => {
        console.log('GenericOidcService: Access token expired');
        this._updateAuthState(null);
      });

      // Check if user is already authenticated
      const user = await this.userManager.getUser();
      this._updateAuthState(user);
      
    } catch (error) {
      console.error("Error initializing GenericOidcService:", error);
      this.authState = { user: null, isAuthenticated: false, accessToken: null };
      this._notifyStateChange();
    }
  }

  async login(options = {}) {
    try {
      await this.userManager.signinRedirect({
        prompt: options.prompt || 'login',
        extraQueryParams: options.extraQueryParams || {}
      });
    } catch (error) {
      console.error("GenericOidcService: Login failed:", error);
      throw error;
    }
  }

  async logout(options = {}) {
    try {
      console.log("GenericOidcService: Starting logout with options:", options);
      
      // Clear state immediately
      this._updateAuthState(null);
      
      // Clear any stored tokens
      await this.userManager.removeUser();
      
      // Redirect to logout endpoint
      const returnTo = options.returnTo || window.location.origin + '/login';
      await this.userManager.signoutRedirect({
        post_logout_redirect_uri: returnTo
      });
      
    } catch (error) {
      console.error("GenericOidcService: Error during logout:", error);
      // Even if logout fails, redirect to login page
      window.location.replace(options.returnTo || window.location.origin + '/login');
    }
  }

  async getAccessTokenSilently(options = {}) {
    try {
      const user = await this.userManager.getUser();
      if (user && !user.expired) {
        this.authState.accessToken = user.access_token;
        this._notifyStateChange();
        return user.access_token;
      } else {
        // Try to renew the token
        const renewedUser = await this.userManager.signinSilent();
        this._updateAuthState(renewedUser);
        return renewedUser ? renewedUser.access_token : null;
      }
    } catch (error) {
      console.error("GenericOidcService: getAccessTokenSilently failed:", error);
      throw error;
    }
  }

  getAuthState() {
    return this.authState;
  }

  onAuthStateChanged(callback) {
    this.onAuthStateChangedCallback = callback;
  }

  _notifyStateChange() {
    if (this.onAuthStateChangedCallback) {
      this.onAuthStateChangedCallback(this.authState);
    }
  }

  _updateAuthState(user) {
    if (user && !user.expired) {
      this.authState = {
        user: {
          id: user.profile.sub || user.profile.id,
          name: user.profile.name || user.profile.preferred_username,
          email: user.profile.email,
          picture: user.profile.picture,
          ...user.profile
        },
        isAuthenticated: true,
        accessToken: user.access_token
      };
    } else {
      this.authState = { user: null, isAuthenticated: false, accessToken: null };
    }
    this._notifyStateChange();
  }

  async _renewToken() {
    try {
      const user = await this.userManager.signinSilent();
      this._updateAuthState(user);
    } catch (error) {
      console.error("GenericOidcService: Token renewal failed:", error);
      this._updateAuthState(null);
    }
  }

  async handleRedirectCallback() {
    try {
      console.log("GenericOidcService: Handling redirect callback");
      
      const user = await this.userManager.signinRedirectCallback();
      this._updateAuthState(user);
      
    } catch (error) {
      console.error("Error handling redirect callback in GenericOidcService:", error);
      this._updateAuthState(null);
      throw error;
    }
  }

  isInCallbackFlow() {
    return window.location.search.includes("code=") && window.location.search.includes("state=");
  }

  isLogoutCallback() {
    return window.location.search.includes("logout") || window.location.hash.includes("logout");
  }

  // Optional: Handle authentication errors
  async handleAuthenticationError(error, context) {
    console.error(`GenericOidcService: Authentication error in ${context}:`, error);
    
    if (error.message && error.message.includes('interaction_required')) {
      return {
        type: 'INTERACTION_REQUIRED',
        message: error.message,
        userMessage: 'Please select the account you want to use.'
      };
    }
    
    return {
      type: 'UNKNOWN_ERROR',
      message: error.message || 'Authentication failed',
      userMessage: 'An authentication error occurred. Please try again.'
    };
  }

  // Optional: Account management methods
  hasMultipleAccounts() {
    // Generic OIDC doesn't have built-in account management like MSAL
    return false;
  }

  getCachedAccounts() {
    // Generic OIDC doesn't cache multiple accounts
    return [];
  }

  async selectAccount() {
    // Force login with account selection
    await this.login({ prompt: 'select_account' });
  }

  async forceLogoutAndClear(returnUrl) {
    // Clear all stored data and redirect
    await this.userManager.removeUser();
    await this.logout({ returnTo: returnUrl });
  }

  isAccountConflictError(error) {
    return error && (
      error.message?.includes('interaction_required') ||
      error.message?.includes('account_selection_required') ||
      error.type === 'INTERACTION_REQUIRED'
    );
  }

  isReady() {
    return this.userManager !== null;
  }
}

export default GenericOidcService;
