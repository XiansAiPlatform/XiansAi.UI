import { Auth0Client } from '@auth0/auth0-spa-js';
import { getConfig } from '../../../../config'; // Assuming config is two levels up

class Auth0Service {
  constructor() {
    const config = getConfig();
    this.auth0Client = new Auth0Client({
      domain: config.domain,
      clientId: config.clientId,
      authorizationParams: {
        redirect_uri: window.location.origin + '/callback', // Ensure this matches your Auth0 app settings
        audience: config.audience,
      },
      cacheLocation: 'localstorage',
    });
    this.authState = {
      user: null,
      isAuthenticated: false,
      accessToken: null,
    };
    this.onAuthStateChangedCallback = () => {};
  }

  async init() {
    try {
      // Don't handle redirect callback here anymore - we do it in AuthContext
      const isAuthenticated = await this.auth0Client.isAuthenticated();
      if (isAuthenticated) {
        const auth0User = await this.auth0Client.getUser();
        const accessToken = await this.auth0Client.getTokenSilently();
        // Map to our generic user object structure
        const user = auth0User ? {
          id: auth0User.sub, // Use sub as the consistent ID
          name: auth0User.name,
          email: auth0User.email,
          picture: auth0User.picture,
          ...auth0User, // Spread other properties if needed
        } : null;
        this.authState = { user, isAuthenticated, accessToken };
      } else {
        this.authState = { user: null, isAuthenticated: false, accessToken: null };
      }
    } catch (error) {
      console.error("Error initializing Auth0Service:", error);
      this.authState = { user: null, isAuthenticated: false, accessToken: null };
    }
    this._notifyStateChange();
  }

  async login() {
    await this.auth0Client.loginWithRedirect();
  }

  async logout(options) {
    console.log("Auth0Service: Starting logout with options:", options);
    const returnTo = options?.returnTo ?? window.location.origin + '/login';
    console.log("Auth0Service: Logout returnTo URL:", returnTo);
    
    try {
      const config = getConfig();
      
      // Reset state immediately to prevent timing issues
      this.authState = { user: null, isAuthenticated: false, accessToken: null };
      this._notifyStateChange();
      
      // Clear localStorage items that Auth0 might use for caching
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('@@auth0spajs@@') || key.startsWith('auth0.') || key.includes('auth0'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      // Clear session storage as well
      sessionStorage.removeItem('auth0_logout_in_progress');
      sessionStorage.removeItem('auth0_logout_returnTo');
      
      // Construct Auth0 logout URL manually to ensure proper formatting
      const logoutUrl = new URL(`https://${config.domain}/v2/logout`);
      logoutUrl.searchParams.set('returnTo', returnTo);
      logoutUrl.searchParams.set('client_id', config.clientId);
      logoutUrl.searchParams.set('federated', 'true');
      
      console.log("Auth0Service: Redirecting to logout URL:", logoutUrl.toString());
      
      // Force immediate redirect using window.location.href instead of Auth0 SDK
      window.location.href = logoutUrl.toString();
      
    } catch (error) {
      console.error("Auth0Service: Error during logout:", error);
      // Even if logout fails, redirect to login page
      window.location.replace(returnTo);
    }
  }

  async getAccessTokenSilently(options) {
    const token = await this.auth0Client.getTokenSilently(options);
    this.authState.accessToken = token; // Update internal state as well
    this._notifyStateChange(); // Notify if you want UI to react to token refresh
    return token;
  }

  getAuthState() {
    return this.authState;
  }

  // Callback will be set by the generic AuthProvider
  onAuthStateChanged(callback) {
    this.onAuthStateChangedCallback = callback;
  }

  _notifyStateChange() {
    if (this.onAuthStateChangedCallback) {
      this.onAuthStateChangedCallback(this.authState);
    }
  }

  async handleRedirectCallback() {
    try {
        console.log("Auth0Service: Handling redirect callback");
        
        await this.auth0Client.handleRedirectCallback();
        const isAuthenticated = await this.auth0Client.isAuthenticated();
        if (isAuthenticated) {
            const auth0User = await this.auth0Client.getUser();
            const accessToken = await this.auth0Client.getTokenSilently();
            const user = auth0User ? {
              id: auth0User.sub,
              name: auth0User.name,
              email: auth0User.email,
              picture: auth0User.picture,
              ...auth0User,
            } : null;
            this.authState = { user, isAuthenticated, accessToken };
        } else {
            this.authState = { user: null, isAuthenticated: false, accessToken: null };
        }
        this._notifyStateChange();
    } catch (error) {
        console.error("Error handling redirect callback in Auth0Service:", error);
        this.authState = { user: null, isAuthenticated: false, accessToken: null };
        this._notifyStateChange();
        throw error; // Re-throw to be caught by AuthProvider
    }
  }

  // Generic method to detect if we're in a callback flow
  isInCallbackFlow() {
    return (window.location.search.includes("code=") && window.location.search.includes("state=")) || 
           (window.location.hash.includes("code=") && window.location.hash.includes("state="));
  }

  // Generic method to detect if this is a logout callback
  isLogoutCallback() {
    // Auth0 doesn't typically have logout callbacks that need special handling
    // The logout redirect goes directly to the returnTo URL
    return false;
  }
}

export default Auth0Service; 
