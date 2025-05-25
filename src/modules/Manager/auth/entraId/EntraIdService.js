import { PublicClientApplication } from '@azure/msal-browser';
import { getConfig } from '../../../../config'; // Assuming config is two levels up

class EntraIdService {
  constructor() {
    const config = getConfig(); // We'll need to add Entra ID specific config here
    this.msalConfig = {
      auth: {
        clientId: config.entraIdClientId, // e.g., 'YOUR_ENTRA_CLIENT_ID'
        authority: config.entraIdAuthority, // e.g., 'https://login.microsoftonline.com/YOUR_TENANT_ID'
        redirectUri: window.location.origin + '/callback', // Must match redirect URI in Azure App Registration
      },
      cache: {
        cacheLocation: 'localStorage', // This configures where your cache will be stored
        storeAuthStateInCookie: false, // Set to true if you are having issues on IE11 or Edge
      },
    };
    this.publicClientApplication = new PublicClientApplication(this.msalConfig);
    this.authState = {
      user: null,
      isAuthenticated: false,
      accessToken: null,
    };
    this.onAuthStateChangedCallback = () => {};
    this.activeAccount = null;
  }

  async init() {
    await this.publicClientApplication.initialize();
    try {
      // Don't handle redirect here anymore - we do it in AuthContext
      // Just check for active accounts
      const accounts = this.publicClientApplication.getAllAccounts();
      if (accounts.length > 0) {
        this.activeAccount = accounts[0];
        this.publicClientApplication.setActiveAccount(this.activeAccount);
      }

      if (this.activeAccount) {
        this.authState.isAuthenticated = true;
        this.authState.user = {
            id: this.activeAccount.idTokenClaims?.oid, 
            name: this.activeAccount.name,
            username: this.activeAccount.username, 
            email: this.activeAccount.username, 
            // Ensure all desired claims are mapped here
            rawClaims: this.activeAccount.idTokenClaims, // Keep raw claims if needed
        };
        try {
            const tokenResponse = await this.getAccessTokenSilently();
            this.authState.accessToken = tokenResponse;
        } catch (error) {
            console.warn("Silent token acquisition failed on init:", error);
        }
      } else {
        this.authState = { user: null, isAuthenticated: false, accessToken: null };
      }
    } catch (error) {
      console.error("Error initializing EntraIdService:", error);
      this.authState = { user: null, isAuthenticated: false, accessToken: null };
    }
    this._notifyStateChange();
  }

  async login(options) {
    try {
      await this.publicClientApplication.loginRedirect({
        scopes: getConfig().entraIdScopes || ['User.Read'],
        ...(options || {}),
      });
    } catch (error) {
      console.error("Entra ID login error:", error);
      throw error;
    }
  }

  async logout(options) {
    const account = this.publicClientApplication.getActiveAccount() || this.publicClientApplication.getAllAccounts()[0];
    try {
      await this.publicClientApplication.logoutRedirect({
        account: account,
        postLogoutRedirectUri: (options?.returnTo || window.location.origin), // Use returnTo from options if provided
        ...(options || {}),
      });
    } catch (error) {
      console.error("Entra ID logout error:", error);
      throw error;
    }
  }

  async getAccessTokenSilently(requestOptions) {
    const account = this.activeAccount || this.publicClientApplication.getActiveAccount();
    if (!account) {
      throw new Error("No active account! Cannot acquire token.");
    }
    const tokenRequest = {
      scopes: getConfig().entraIdScopes || ['User.Read'], 
      account: account,
      ...(requestOptions || {}),
    };
    try {
      const response = await this.publicClientApplication.acquireTokenSilent(tokenRequest);
      this.authState.accessToken = response.accessToken;
      this._notifyStateChange();
      return response.accessToken;
    } catch (error) {
      console.error("Silent token acquisition failed:", error);
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
    const account = this.publicClientApplication.getActiveAccount();
    if (account) {
        this.activeAccount = account;
        this.authState.isAuthenticated = true;
        this.authState.user = {
            id: account.idTokenClaims?.oid,
            name: account.name,
            username: account.username,
            email: account.username,
            rawClaims: account.idTokenClaims,
        };
    } else {
        this.activeAccount = null;
        this.authState = { user: null, isAuthenticated: false, accessToken: null };
    }

    if (this.onAuthStateChangedCallback) {
      this.onAuthStateChangedCallback(this.authState);
    }
  }

  async handleRedirectCallback() {
    try {
        console.log("EntraIdService: Handling redirect callback");
        const response = await this.publicClientApplication.handleRedirectPromise();
        if (response) {
            this.activeAccount = this.publicClientApplication.getActiveAccount();
        }
        // Refresh state regardless of whether response was processed, to pick up active account
        await this._updateStateFromActiveAccount(); 
        this._notifyStateChange();
    } catch (error) {
        console.error("Error handling redirect callback in EntraIdService:", error);
        this.authState = { user: null, isAuthenticated: false, accessToken: null };
        this._notifyStateChange();
        throw error;
    }
  }

  // Helper to consolidate updating state from active account
  async _updateStateFromActiveAccount() {
    const account = this.publicClientApplication.getActiveAccount();
    if (account) {
        this.activeAccount = account;
        this.authState.isAuthenticated = true;
        this.authState.user = {
            id: account.idTokenClaims?.oid,
            name: account.name,
            username: account.username,
            email: account.username,
            rawClaims: account.idTokenClaims,
        };
        try {
            const token = await this.getAccessTokenSilently();
            this.authState.accessToken = token;
        } catch (error) {
            console.warn("Failed to get access token during state update:", error);
            // Decide if failing to get a token here should de-authenticate or just leave token as null
            this.authState.accessToken = null; 
        }
    } else {
        this.activeAccount = null;
        this.authState = { user: null, isAuthenticated: false, accessToken: null };
    }
  }
}

export default EntraIdService; 