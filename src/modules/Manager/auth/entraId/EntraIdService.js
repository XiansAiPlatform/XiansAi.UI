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
        knownAuthorities : config.knownAuthorities,
        navigateToLoginRequestUrl: false // Prevent automatic navigation after login
      },
      cache: {
        cacheLocation: 'localStorage', // This configures where your cache will be stored
        storeAuthStateInCookie: false, // Set to true if you are having issues on IE11 or Edge
        claimsBasedCachingEnabled: true, // Enable claims-based caching
      },
      system: {
        allowNativeBroker: false // Disables native broker for stability
      }
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
    try {
      await this.publicClientApplication.initialize();
      
      // Check for existing accounts - this should pick up accounts cached during callback processing
      const accounts = this.publicClientApplication.getAllAccounts();
      if (accounts.length > 0) {
        this.activeAccount = accounts[0];
        this.publicClientApplication.setActiveAccount(this.activeAccount);
      }

      if (this.activeAccount) {
        this.authState.isAuthenticated = true;
        this.authState.user = {
            id: this.activeAccount.idTokenClaims?.oid|| this.activeAccount.idTokenClaims?.sub,
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
            this.authState.accessToken = null;
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

  async handleRedirectCallback() {
    try {
        console.log("EntraIdService: Handling redirect callback");
        await this.publicClientApplication.initialize();
        
        // Handle the redirect promise and get the response
        const response = await this.publicClientApplication.handleRedirectPromise();
        
        if (response) {
            // Set the active account from the response
            this.publicClientApplication.setActiveAccount(response.account);
            this.activeAccount = response.account;
            
            // Update auth state immediately
            this.authState.isAuthenticated = true;
            this.authState.user = {
                id: response.account.idTokenClaims?.oid || response.account.idTokenClaims?.sub,
                name: response.account.name,
                username: response.account.username,
                email: response.account.username,
                rawClaims: response.account.idTokenClaims,
            };
            this.authState.accessToken = null; // Will be obtained later if needed
            
            // Force MSAL to save the account data by triggering cache operations
            try {
                // Force cache operations to ensure data persists
                await this.publicClientApplication.acquireTokenSilent({
                    scopes: ['openid', 'profile'],
                    account: response.account,
                    forceRefresh: false
                });
            } catch (tokenError) {
                console.warn("EntraIdService: Token cache verification failed, but proceeding:", tokenError.message);
            }
            
        } else {
            // If no response, check for existing accounts
            // This can happen if the redirect was already processed
            const accounts = this.publicClientApplication.getAllAccounts();
            if (accounts.length > 0) {
                this.activeAccount = accounts[0];
                this.publicClientApplication.setActiveAccount(this.activeAccount);
                await this._updateStateFromActiveAccount();
            } else {
                this.authState = { user: null, isAuthenticated: false, accessToken: null };
            }
        }
        
        // Notify state change
        this._notifyStateChange();
        
    } catch (error) {
        console.error("Error handling redirect callback in EntraIdService:", error);
        this.authState = { user: null, isAuthenticated: false, accessToken: null };
        this._notifyStateChange();
        throw error;
    }
  }

  async login(options) {
    try {
      await this.publicClientApplication.loginRedirect({
        scopes: (getConfig().entraIdScopes?.length > 0) ? getConfig().entraIdScopes : ['User.Read'],
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
      // Clear local auth state immediately
      this.authState = { user: null, isAuthenticated: false, accessToken: null };
      this.activeAccount = null;
      this._notifyStateChange();
      
      const logoutUrl = options?.returnTo || (window.location.origin + '/login');

      await this.publicClientApplication.logoutRedirect({
        account: account,
        postLogoutRedirectUri: logoutUrl, // Redirect to /login page
        idTokenHint: account?.idToken,
        onRedirectNavigate: (url) => {
          return true; // Allow navigation
        },
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
            id: account.idTokenClaims?.oid || account.idTokenClaims?.sub,
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

  // Helper to consolidate updating state from active account
  async _updateStateFromActiveAccount() {
    const account = this.publicClientApplication.getActiveAccount();
    
    if (account) {
        this.activeAccount = account;
        this.authState.isAuthenticated = true;
        this.authState.user = {
            id: account.idTokenClaims?.oid || account.idTokenClaims?.sub,
            name: account.name,
            username: account.username,
            email: account.username,
            rawClaims: account.idTokenClaims,
        };
        this.authState.accessToken = null; // Will be set later when requested
    } else {
        this.activeAccount = null;
        this.authState = { user: null, isAuthenticated: false, accessToken: null };
    }
  }

  // Generic method to detect if we're in a callback flow
  isInCallbackFlow() {
    return window.location.pathname === '/callback' || 
           window.location.search.includes("code=") || 
           window.location.search.includes("error=") ||
           window.location.search.includes("admin_consent=");
  }

  // Generic method to detect if this is a logout callback
  isLogoutCallback() {
    // Entra ID doesn't typically have logout callbacks that need special handling
    // The logout redirect goes directly to the postLogoutRedirectUri
    return false;
  }
}

export default EntraIdService; 