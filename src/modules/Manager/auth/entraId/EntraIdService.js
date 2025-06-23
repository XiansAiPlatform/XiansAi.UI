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
        allowNativeBroker: false, // Disables native broker for stability
        loggerOptions: {
          loggerCallback: (level, message, containsPii) => {
            if (!containsPii) {
              console.log(`MSAL [${level}]: ${message}`);
            }
          },
          logLevel: 'Warning'
        }
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
      console.log("EntraIdService: MSAL initialized successfully");
      
      // Check for existing accounts - this should pick up accounts cached during callback processing
      const accounts = this.publicClientApplication.getAllAccounts();
      console.log("EntraIdService: Found", accounts.length, "existing accounts");
      
      // Log account details for debugging
      if (accounts.length > 0) {
        console.log("EntraIdService: Account details:", accounts.map(acc => ({ 
          name: acc.name, 
          username: acc.username,
          localAccountId: acc.localAccountId 
        })));
      }
      
      if (accounts.length > 0) {
        this.activeAccount = accounts[0];
        this.publicClientApplication.setActiveAccount(this.activeAccount);
        console.log("EntraIdService: Set active account:", this.activeAccount.name);
      }

      if (this.activeAccount) {
        this.authState.isAuthenticated = true;
        this.authState.user = {
            id: this.activeAccount.idTokenClaims?.oid|| this.activeAccount.idTokenClaims?.sub,
            name: this.activeAccount.name,
            username: this.activeAccount.username, 
            email: this.activeAccount.username, 
            rawClaims: this.activeAccount.idTokenClaims,
        };
        try {
            const tokenResponse = await this.getAccessTokenSilently();
            this.authState.accessToken = tokenResponse;
        } catch (error) {
            console.warn("Silent token acquisition failed on init:", error);
            this.authState.accessToken = null;
        }
        console.log("EntraIdService: Init completed with authenticated user:", this.authState.user.name);
      } else {
        this.authState = { user: null, isAuthenticated: false, accessToken: null };
        console.log("EntraIdService: Init completed with no authenticated user");
        
        // Additional debugging - check localStorage directly
        const msalKeys = Object.keys(localStorage).filter(key => key.includes('msal'));
        console.log("EntraIdService: MSAL keys in localStorage:", msalKeys);
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
        console.log("EntraIdService: Calling handleRedirectPromise...");
        const response = await this.publicClientApplication.handleRedirectPromise();
        console.log("EntraIdService: handleRedirectPromise response:", response);
        
        if (response) {
            console.log("EntraIdService: Successfully processed redirect response", response);
            // Set the active account from the response
            this.publicClientApplication.setActiveAccount(response.account);
            this.activeAccount = response.account;
            
            // Verify account was set and cached properly
            const allAccounts = this.publicClientApplication.getAllAccounts();
            console.log("EntraIdService: After setting active account, total accounts:", allAccounts.length);
            const activeAccount = this.publicClientApplication.getActiveAccount();
            console.log("EntraIdService: Active account after setting:", activeAccount?.name);
            
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
            
            console.log("EntraIdService: Auth state updated from redirect response:", this.authState);
            
            // Force MSAL to save the account data by triggering cache operations
            try {
                // Force cache operations to ensure data persists
                await this.publicClientApplication.acquireTokenSilent({
                    scopes: ['openid', 'profile'],
                    account: response.account,
                    forceRefresh: false
                });
                console.log("EntraIdService: Successfully verified token cache");
            } catch (tokenError) {
                console.warn("EntraIdService: Token cache verification failed, but proceeding:", tokenError.message);
            }
            
        } else {
            // If no response, check for existing accounts
            // This can happen if the redirect was already processed
            const accounts = this.publicClientApplication.getAllAccounts();
            console.log("EntraIdService: No redirect response, checking existing accounts:", accounts.length);
            if (accounts.length > 0) {
                console.log("EntraIdService: Found existing account, setting as active");
                this.activeAccount = accounts[0];
                this.publicClientApplication.setActiveAccount(this.activeAccount);
                await this._updateStateFromActiveAccount();
            } else {
                console.log("EntraIdService: No redirect response and no existing accounts");
                this.authState = { user: null, isAuthenticated: false, accessToken: null };
            }
        }
        
        // Notify state change
        this._notifyStateChange();
        
        console.log("EntraIdService: Callback handling completed, final auth state:", this.authState);
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
    console.log("EntraIdService: _updateStateFromActiveAccount - Active account:", account);
    
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
        console.log("EntraIdService: Updated auth state - authenticated:", this.authState.isAuthenticated, "user:", this.authState.user?.name);
    } else {
        this.activeAccount = null;
        this.authState = { user: null, isAuthenticated: false, accessToken: null };
        console.log("EntraIdService: No active account found - setting state to unauthenticated");
    }
  }
}

export default EntraIdService; 