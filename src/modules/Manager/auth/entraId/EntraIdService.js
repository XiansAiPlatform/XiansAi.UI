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
    this._isInitialized = false; // Track initialization status
  }

  // Helper method to check if error requires interaction
  _isInteractionRequiredError(error) {
    const interactionRequiredCodes = [
      'interaction_required',
      'consent_required', 
      'login_required',
      'INTERACTION_REQUIRED', // Our enhanced error code
      'AADB2C90077', // User does not have an existing session and request prompt parameter has a value of 'None'
      'AADB2C90118', // User interaction required
      'authority_mismatch', // Authority mismatch error - requires account selection
    ];
    
    return error && (
      interactionRequiredCodes.some(code => 
        error.errorCode === code ||     // Original MSAL error field
        error.code === code ||          // Our enhanced error field
        error.type === code ||          // Our enhanced error type field  
        error.message?.includes(code) ||
        error.errorDesc?.includes(code)
      )
    );
  }

  // Helper method to handle multiple account scenarios
  async _handleAccountConflict(error = null) {
    console.warn("EntraIdService: Multiple accounts detected or account selection required");
    
    // Check if this is specifically an authority mismatch error
    const isAuthorityMismatch = error && (
      error.message?.includes('authority_mismatch') ||
      error.errorCode?.includes('authority_mismatch') ||
      error.errorDesc?.includes('authority_mismatch')
    );
    
    if (isAuthorityMismatch) {
      console.warn("EntraIdService: Authority mismatch detected, forcing logout and clear");
      // For authority mismatch, we must clear all accounts and force logout
      // Don't try to login again as that will just hit the same error
      return this.forceLogoutAndClear(window.location.origin + '/login?error=authority_mismatch');
    }
    
    // Clear any existing cached state to avoid conflicts
    await this._clearAuthState();
    
    // For other interaction required errors, try account selection
    // Option 1: Force logout to clear all sessions
    // Uncomment this if you prefer to always logout on conflicts
    // return this.logout({ returnTo: window.location.origin + '/login?error=account_conflict' });
    
    // Option 2: Force interactive login with account selection
    return this.login({ 
      prompt: 'select_account',
      loginHint: undefined // Clear any login hints that might cause conflicts
    });
  }

  // Helper method to clear auth state
  async _clearAuthState() {
    this.authState = { user: null, isAuthenticated: false, accessToken: null };
    this.activeAccount = null;
    this._notifyStateChange();
  }

  async init() {
    try {
      await this.publicClientApplication.initialize();
      this._isInitialized = true; // Mark as initialized after successful init
      
      // Check for existing accounts - this should pick up accounts cached during callback processing
      const accounts = this.publicClientApplication.getAllAccounts();
      if (accounts.length > 0) {
        this.activeAccount = accounts[0];
        this.publicClientApplication.setActiveAccount(this.activeAccount);
      }

      if (this.activeAccount) {
        this.authState.isAuthenticated = true;
        this.authState.user = {
            id: this.activeAccount.idTokenClaims?.sub|| this.activeAccount.idTokenClaims?.oid,
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
            
            // Check if this is an interaction required error
            if (this._isInteractionRequiredError(error)) {
              console.warn("EntraIdService: Interaction required error detected during init, clearing auth state");
              await this._clearAuthState();
              // Don't auto-redirect during init, let the app handle it
            } else {
              this.authState.accessToken = null;
            }
        }
      } else {
        this.authState = { user: null, isAuthenticated: false, accessToken: null };
      }
    } catch (error) {
      console.error("Error initializing EntraIdService:", error);
      this._isInitialized = false; // Reset flag on initialization failure
      
      // Handle specific initialization errors
      if (this._isInteractionRequiredError(error)) {
        console.warn("EntraIdService: Interaction required error during initialization");
        await this._clearAuthState();
      } else {
        this.authState = { user: null, isAuthenticated: false, accessToken: null };
      }
    }
    this._notifyStateChange();
  }

  async handleRedirectCallback() {
    try {
        console.log("EntraIdService: Handling redirect callback");
        await this.publicClientApplication.initialize();
        this._isInitialized = true; // Mark as initialized after successful init
        
        // Handle the redirect promise and get the response
        const response = await this.publicClientApplication.handleRedirectPromise();
        
        if (response) {
            // Check if the response contains an error
            if (response.errorCode) {
                console.error("EntraIdService: Redirect callback returned error:", response);
                
                if (this._isInteractionRequiredError(response)) {
                    console.warn("EntraIdService: Interaction required error in callback");
                    await this._clearAuthState();
                    throw new Error("Account selection or re-authentication required. Please try logging in again.");
                }
                
                throw new Error(`Authentication failed: ${response.errorDesc || response.errorCode}`);
            }
            
            // Set the active account from the response
            this.publicClientApplication.setActiveAccount(response.account);
            this.activeAccount = response.account;
            
            // Update auth state immediately
            this.authState.isAuthenticated = true;
            this.authState.user = {
                id: response.account.idTokenClaims?.sub || response.account.idTokenClaims?.oid,
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
                
                // If this is an interaction required error, handle it
                if (this._isInteractionRequiredError(tokenError)) {
                    console.warn("EntraIdService: Interaction required during token verification");
                    // Don't fail here, just proceed without the token
                }
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
        this._isInitialized = false; // Reset flag on callback error
        
        // Handle interaction required errors even in callback
        if (this._isInteractionRequiredError(error)) {
            console.warn("EntraIdService: Interaction required error in callback flow");
            await this._clearAuthState();
        } else {
            this.authState = { user: null, isAuthenticated: false, accessToken: null };
            this._notifyStateChange();
        }
        
        throw error;
    }
  }

  async login(options) {
    // Check if MSAL is initialized before attempting login
    if (!this.publicClientApplication || !this._isInitialized) {
      throw new Error("MSAL not initialized! Cannot initiate login.");
    }
    
    try {
      // Default to select_account prompt to handle multiple account scenarios
      const loginOptions = {
        scopes: (getConfig().entraIdScopes?.length > 0) ? getConfig().entraIdScopes : ['User.Read'],
        prompt: 'select_account', // This allows users to choose which account to use
        ...(options || {}),
      };
      
      console.log("EntraIdService: Initiating login with options:", loginOptions);
      await this.publicClientApplication.loginRedirect(loginOptions);
    } catch (error) {
      console.error("Entra ID login error:", error);
      
      // Handle specific login errors
      if (this._isInteractionRequiredError(error)) {
        console.warn("EntraIdService: Interaction required during login, attempting account conflict resolution");
        return this._handleAccountConflict(error);
      }
      
      throw error;
    }
  }

  async logout(options) {
    // Clear local auth state immediately
    this.authState = { user: null, isAuthenticated: false, accessToken: null };
    this.activeAccount = null;
    this._notifyStateChange();
    
    // If MSAL is not initialized, just redirect to login
    if (!this.publicClientApplication || !this._isInitialized) {
      console.warn("EntraIdService: MSAL not initialized during logout, redirecting to login");
      const logoutUrl = options?.returnTo || (window.location.origin + '/login');
      window.location.href = logoutUrl;
      return;
    }
    
    let account = null;
    try {
      account = this.publicClientApplication.getActiveAccount() || this.publicClientApplication.getAllAccounts()[0];
    } catch (error) {
      console.warn("EntraIdService: Error getting account for logout, proceeding without account:", error);
    }
    
    try {
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
      // Fallback: just redirect to login page
      const fallbackUrl = options?.returnTo || (window.location.origin + '/login');
      window.location.href = fallbackUrl;
    }
  }

  async getAccessTokenSilently(requestOptions) {
    // Check if MSAL is initialized before attempting token acquisition
    if (!this.publicClientApplication || !this._isInitialized) {
      throw new Error("MSAL not initialized! Cannot acquire token.");
    }
    
    let account;
    try {
      account = this.activeAccount || this.publicClientApplication.getActiveAccount();
    } catch (error) {
      console.error("Error getting active account:", error);
      throw new Error("Failed to get active account! Cannot acquire token.");
    }
    
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
      
      // Handle interaction required errors gracefully
      if (this._isInteractionRequiredError(error)) {
        console.warn("EntraIdService: Interaction required error during silent token acquisition");
        
        // Clear the current auth state since the token is no longer valid
        await this._clearAuthState();
        
        // Create a properly structured error using handleAuthenticationError
        const errorInfo = await this.handleAuthenticationError(error, 'getAccessTokenSilently');
        
        // Convert the error info to a throwable error with proper structure
        const enhancedError = new Error(errorInfo.message);
        enhancedError.code = errorInfo.type; // This will be 'INTERACTION_REQUIRED'
        enhancedError.type = errorInfo.type;
        enhancedError.userMessage = 'Your session has expired or there is an account conflict. Please login again.';
        enhancedError.recoveryOptions = errorInfo.recoveryOptions;
        enhancedError.originalError = error;
        throw enhancedError;
      }
      
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
    // Only try to get account info if MSAL is initialized
    if (this.publicClientApplication && this._isInitialized) {
      try {
        const account = this.publicClientApplication.getActiveAccount();
        if (account) {
            this.activeAccount = account;
            this.authState.isAuthenticated = true;
            this.authState.user = {
                id: account.idTokenClaims?.sub || account.idTokenClaims?.oid,
                name: account.name,
                username: account.username,
                email: account.username,
                rawClaims: account.idTokenClaims,
            };
        } else {
            this.activeAccount = null;
            this.authState = { user: null, isAuthenticated: false, accessToken: null };
        }
      } catch (error) {
        console.warn("EntraIdService: Error getting active account in _notifyStateChange:", error);
        this.activeAccount = null;
        this.authState = { user: null, isAuthenticated: false, accessToken: null };
      }
    } else {
      // If MSAL not initialized, use current state or clear it
      if (!this.authState) {
        this.authState = { user: null, isAuthenticated: false, accessToken: null };
      }
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
            id: account.idTokenClaims?.sub || account.idTokenClaims?.oid,
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

  // Method to check if MSAL is properly initialized and ready for use
  isReady() {
    return Boolean(this.publicClientApplication && this._isInitialized);
  }

  // Method to check if authentication error indicates account conflict
  isAccountConflictError(error) {
    // Any interaction required error should be treated as a potential account conflict
    // since it indicates the user needs to interact to resolve the authentication state
    return this._isInteractionRequiredError(error);
  }

  // Method to force logout and clear all cached accounts
  async forceLogoutAndClear(returnUrl) {
    try {
      console.log("EntraIdService: Force logout and clear all accounts");
      
      // Clear all accounts from MSAL cache only if initialized
      if (this.publicClientApplication && this._isInitialized) {
        try {
          const accounts = this.publicClientApplication.getAllAccounts();
          for (const account of accounts) {
            await this.publicClientApplication.clearCache(account);
          }
        } catch (msalError) {
          console.warn("EntraIdService: Error clearing MSAL cache, proceeding with local clear:", msalError);
        }
      } else {
        console.warn("EntraIdService: MSAL not initialized, skipping cache clear");
      }
      
      // Clear local state
      await this._clearAuthState();
      
      // Navigate to logout URL or default login page
      const logoutUrl = returnUrl || (window.location.origin + '/login?cleared=true');
      window.location.href = logoutUrl;
      
    } catch (error) {
      console.error("EntraIdService: Error during force logout:", error);
      // Fallback: just clear local state and redirect
      await this._clearAuthState();
      const fallbackUrl = returnUrl || (window.location.origin + '/login?error=logout_failed');
      window.location.href = fallbackUrl;
    }
  }

  // Method to initiate account selection flow
  async selectAccount() {
    try {
      console.log("EntraIdService: Initiating account selection");
      await this._clearAuthState();
      return this.login({ 
        prompt: 'select_account',
        loginHint: undefined
      });
    } catch (error) {
      console.error("EntraIdService: Error during account selection:", error);
      throw error;
    }
  }

  // Method to check if there are multiple cached accounts
  hasMultipleAccounts() {
    try {
      // Check if MSAL is initialized before calling getAllAccounts
      if (!this.publicClientApplication || !this._isInitialized) {
        console.warn("EntraIdService: MSAL not initialized, cannot check multiple accounts");
        return false;
      }
      const accounts = this.publicClientApplication.getAllAccounts();
      return accounts.length > 1;
    } catch (error) {
      console.warn("EntraIdService: Error checking multiple accounts:", error);
      return false;
    }
  }

  // Method to get all cached account information
  getCachedAccounts() {
    try {
      // Check if MSAL is initialized before calling getAllAccounts
      if (!this.publicClientApplication || !this._isInitialized) {
        console.warn("EntraIdService: MSAL not initialized, cannot get cached accounts");
        return [];
      }
      const accounts = this.publicClientApplication.getAllAccounts();
      return accounts.map(account => ({
        id: account.idTokenClaims?.sub || account.idTokenClaims?.oid,
        name: account.name,
        username: account.username,
        email: account.username
      }));
    } catch (error) {
      console.warn("EntraIdService: Error getting cached accounts:", error);
      return [];
    }
  }

  // Method to handle authentication errors and provide recovery options
  async handleAuthenticationError(error, context = 'unknown') {
    console.warn(`EntraIdService: Handling authentication error in context: ${context}`, error);
    
    if (this._isInteractionRequiredError(error)) {
      // Clear current state
      await this._clearAuthState();
      
      // Return recovery options for the application to handle
      return {
        type: 'INTERACTION_REQUIRED',
        message: 'Authentication session expired or account conflict detected',
        recoveryOptions: {
          selectAccount: () => this.selectAccount(),
          forceLogout: (returnUrl) => this.forceLogoutAndClear(returnUrl),
          retry: () => this.login()
        },
        context,
        originalError: error
      };
    }
    
    // For other errors, just return the error info
    return {
      type: 'AUTH_ERROR',
      message: error.message || 'Authentication failed',
      context,
      originalError: error
    };
  }
}

export default EntraIdService; 