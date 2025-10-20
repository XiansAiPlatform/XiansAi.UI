import { UserManager, WebStorageStateStore } from 'oidc-client-ts';
import { getConfig } from '../../../../config';

class OidcService {
  constructor() {
    const config = getConfig();
    this.config = config;
    
    // Dynamic redirect URIs - work automatically in any environment (like Auth0, Keycloak, EntraId)
    // These use window.location.origin so they adapt to dev, staging, prod automatically
    const redirectUri = window.location.origin + '/callback';
    const postLogoutRedirectUri = window.location.origin + '/';
    const silentRedirectUri = window.location.origin + '/silent-redirect';
    
    console.log('OidcService: Dynamic redirect URIs configured:', {
      redirectUri,
      postLogoutRedirectUri,
      silentRedirectUri
    });
    
    // Configure UserManager with OIDC settings
    this.userManager = new UserManager({
      authority: config.oidcAuthority,
      client_id: config.oidcClientId,
      redirect_uri: redirectUri,              // Dynamic - no env var needed!
      post_logout_redirect_uri: postLogoutRedirectUri,  // Dynamic - no env var needed!
      response_type: 'code',
      scope: config.oidcScopes || 'openid profile email',
      automaticSilentRenew: true,
      silent_redirect_uri: silentRedirectUri, // Dynamic - no env var needed!
      // Use session storage for state to avoid issues with multiple tabs
      userStore: new WebStorageStateStore({ store: window.sessionStorage }),
      // Optional: only include audience if your IdP requires it (e.g., Auth0)
      extraQueryParams: config.oidcAudience ? { audience: config.oidcAudience } : {}
    });
    
    this.authState = {
      user: null,
      isAuthenticated: false,
      accessToken: null
    };
    
    this.onAuthStateChangedCallback = () => {};
    
    // Setup event listeners for token lifecycle
    this.userManager.events.addUserLoaded(this._handleUserLoaded.bind(this));
    this.userManager.events.addUserUnloaded(this._handleUserUnloaded.bind(this));
    this.userManager.events.addAccessTokenExpiring(this._handleTokenExpiring.bind(this));
    this.userManager.events.addAccessTokenExpired(this._handleTokenExpired.bind(this));
    this.userManager.events.addSilentRenewError(this._handleSilentRenewError.bind(this));
    
    console.log('OidcService: Initialized with authority:', config.oidcAuthority);
  }
  
  async init() {
    try {
      console.log('OidcService: Initializing...');
      const user = await this.userManager.getUser();
      
      if (user && !user.expired) {
        console.log('OidcService: Found valid user session', user.profile);
        try {
          const hydrated = await this._hydrateWithUserInfoIfNeeded(user.access_token, user.profile || {});
          user.profile = hydrated;
        } catch (e) {
          console.warn('OidcService: UserInfo hydration skipped/failed during init:', e);
        }
        this._updateAuthState(user);
      } else {
        console.log('OidcService: No valid user session found');
        this.authState = { user: null, isAuthenticated: false, accessToken: null };
      }
      
      this._notifyStateChange();
    } catch (error) {
      console.error('OidcService: Error during initialization:', error);
      this.authState = { user: null, isAuthenticated: false, accessToken: null };
    }
  }
  
  async login(options) {
    try {
      console.log('OidcService: Initiating login redirect with options:', options);
      await this.userManager.signinRedirect(options);
    } catch (error) {
      console.error('OidcService: Login failed:', error);
      throw error;
    }
  }
  
  async handleRedirectCallback() {
    try {
      console.log('OidcService: Handling redirect callback');
      const user = await this.userManager.signinRedirectCallback();
      console.log('OidcService: Redirect callback successful, user:', user.profile);
      try {
        const hydrated = await this._hydrateWithUserInfoIfNeeded(user.access_token, user.profile || {});
        user.profile = hydrated;
      } catch (e) {
        console.warn('OidcService: UserInfo hydration skipped/failed during redirect callback:', e);
      }
      
      this._updateAuthState(user);
      this._notifyStateChange();
    } catch (error) {
      console.error('OidcService: Error handling redirect callback:', error);
      this.authState = { user: null, isAuthenticated: false, accessToken: null };
      this._notifyStateChange();
      throw error;
    }
  }
  
  async getAccessTokenSilently(options) {
    try {
      const user = await this.userManager.getUser();
      
      if (user && !user.expired) {
        this.authState.accessToken = user.access_token;
        return user.access_token;
      }
      
      // Try silent renew if token is expired
      console.log('OidcService: Token expired or not found, attempting silent renew...');
      const newUser = await this.userManager.signinSilent(options);
      this._updateAuthState(newUser);
      return newUser.access_token;
    } catch (error) {
      console.error('OidcService: Error getting token silently:', error);
      throw error;
    }
  }
  
  async logout(options) {
    try {
      console.log('OidcService: Starting logout process');
      const returnTo = options?.returnTo || window.location.origin + '/login';
      
      // Clear local auth state immediately
      this.authState = { user: null, isAuthenticated: false, accessToken: null };
      this._notifyStateChange();
      
      // Redirect to IdP logout endpoint
      await this.userManager.signoutRedirect({
        post_logout_redirect_uri: returnTo
      });
    } catch (error) {
      console.error('OidcService: Logout error:', error);
      // Even if logout fails, redirect to login page
      window.location.replace(options?.returnTo || window.location.origin + '/login');
      throw error;
    }
  }
  
  getAuthState() {
    return this.authState;
  }
  
  onAuthStateChanged(callback) {
    this.onAuthStateChangedCallback = callback;
  }
  
  isInCallbackFlow() {
    // Check if we're in an OAuth callback flow
    const hasCallbackParams = (window.location.search.includes("code=") && window.location.search.includes("state=")) ||
                              (window.location.hash.includes("code=") && window.location.hash.includes("state="));
    
    if (hasCallbackParams) {
      console.log('OidcService: Detected callback flow in URL');
    }
    
    return hasCallbackParams;
  }
  
  isLogoutCallback() {
    // OIDC doesn't typically have special logout callback handling
    // The logout redirect goes directly to the post_logout_redirect_uri
    return false;
  }
  
  // Private methods
  
  _updateAuthState(user) {
    if (user && !user.expired) {
      const profile = user.profile || {};
      
      // Extract user ID with multiple fallbacks (similar to other providers)
      const userId = profile.oid || 
                     profile.sub || 
                     profile.user_id || 
                     profile.preferred_username || 
                     profile.email;
      
      // Extract name with multiple fallbacks
      const userName = profile.name || 
                       profile.given_name || 
                       profile.nickname || 
                       profile.preferred_username || 
                       (profile.given_name && profile.family_name ? 
                         `${profile.given_name} ${profile.family_name}` : null) ||
                       profile.email?.split('@')[0] || 
                       'User';
      
      // Extract email with multiple fallbacks
      // Azure B2C uses 'emails' array, others use 'email' or 'preferred_username'
      const userEmail = profile.email || 
                        (Array.isArray(profile.emails) ? profile.emails[0] : null) ||
                        profile.preferred_username ||
                        profile.upn ||
                        '';
      
      // Extract picture with fallbacks
      const userPicture = profile.picture || 
                          profile.avatar || 
                          profile.photo || 
                          '';
      
      this.authState = {
        user: {
          id: userId,
          name: userName,
          email: userEmail,
          picture: userPicture,
          username: profile.preferred_username || userEmail,
          ...profile // Spread all other profile properties
        },
        isAuthenticated: true,
        accessToken: user.access_token
      };
      
      console.log('OidcService: User profile mapped:', {
        id: userId,
        name: userName,
        email: userEmail,
        picture: userPicture
      });
      
      // Debug: Warn if critical profile fields are missing
      this._debugMissingFields(profile, { name: userName, email: userEmail, picture: userPicture });
    }
  }
  
  _debugMissingFields(rawProfile, mapped) {
    const missing = [];
    if (!mapped.name || mapped.name === 'User') missing.push('name');
    if (!mapped.email) missing.push('email');
    if (!mapped.picture) missing.push('picture');
    
    if (missing.length > 0) {
      console.warn('OidcService: Missing profile fields:', missing.join(', '));
      console.warn('OidcService: Raw profile claims available:', Object.keys(rawProfile).join(', '));
      console.warn('OidcService: If using Auth0 + GitHub: ensure GitHub connection has "read:user user:email" scopes');
      console.warn('OidcService: UserInfo endpoint should auto-hydrate missing fields if provider supports it');
    }
  }
  
  _notifyStateChange() {
    if (this.onAuthStateChangedCallback) {
      this.onAuthStateChangedCallback(this.authState);
    }
  }
  
  // Event handlers
  
  async _handleUserLoaded(user) {
    console.log('OidcService: User loaded event', user.profile);
    try {
      const hydrated = await this._hydrateWithUserInfoIfNeeded(user.access_token, user.profile || {});
      user.profile = hydrated;
    } catch (e) {
      console.warn('OidcService: UserInfo hydration skipped/failed during user-loaded event:', e);
    }
    this._updateAuthState(user);
    this._notifyStateChange();
  }
  
  _handleUserUnloaded() {
    console.log('OidcService: User unloaded event');
    this.authState = { user: null, isAuthenticated: false, accessToken: null };
    this._notifyStateChange();
  }
  
  _handleTokenExpiring() {
    console.log('OidcService: Access token expiring, attempting silent renew...');
    // automaticSilentRenew handles this automatically, but we log for debugging
  }
  
  _handleTokenExpired() {
    console.log('OidcService: Access token expired');
  }
  
  _handleSilentRenewError(error) {
    console.error('OidcService: Silent renew error:', error);
    // Clear auth state if silent renew fails
    this.authState = { user: null, isAuthenticated: false, accessToken: null };
    this._notifyStateChange();
  }
}

// Private helpers for UserInfo hydration
OidcService.prototype._getUserInfoEndpoint = async function() {
  try {
    if (this._userinfoEndpoint) return this._userinfoEndpoint;
    const base = (this.config?.oidcAuthority || '').replace(/\/+$/, '');
    if (!base) return null;
    const discoveryUrl = `${base}/.well-known/openid-configuration`;
    const discovery = await fetch(discoveryUrl).then(r => r.ok ? r.json() : Promise.reject(new Error(`Discovery fetch failed: ${r.status}`)));
    this._userinfoEndpoint = discovery.userinfo_endpoint || null;
    return this._userinfoEndpoint;
  } catch (e) {
    console.warn('OidcService: Failed to resolve userinfo endpoint:', e);
    return null;
  }
};

OidcService.prototype._hydrateWithUserInfoIfNeeded = async function(accessToken, currentProfile) {
  try {
    const profile = currentProfile || {};
    const needsEmail = !(profile.email || (Array.isArray(profile.emails) && profile.emails.length > 0));
    const needsName = !(profile.name || profile.given_name || (profile.given_name && profile.family_name));
    const needsPicture = !profile.picture;
    if (!needsEmail && !needsName && !needsPicture) return profile;

    const userinfoEndpoint = await this._getUserInfoEndpoint();
    if (!userinfoEndpoint || !accessToken) return profile;

    const userInfo = await fetch(userinfoEndpoint, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }).then(r => r.ok ? r.json() : Promise.reject(new Error(`UserInfo fetch failed: ${r.status}`)));

    // Merge, preferring values from UserInfo for standard fields
    return { ...profile, ...userInfo };
  } catch (e) {
    console.warn('OidcService: UserInfo hydration failed:', e);
    return currentProfile || {};
  }
};

export default OidcService;

