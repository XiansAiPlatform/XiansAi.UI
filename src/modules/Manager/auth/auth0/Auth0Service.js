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
    await this.auth0Client.logout({ returnTo: options?.returnTo || window.location.origin + '/login' });
    this.authState = { user: null, isAuthenticated: false, accessToken: null }; // Reset state on logout
    this._notifyStateChange();
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
}

export default Auth0Service; 