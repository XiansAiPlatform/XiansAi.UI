import Keycloak from "keycloak-js";
import { getConfig } from "../../../../config";

class KeycloakService {
  constructor() {
    const config = getConfig();

    this.keycloakInstance = new Keycloak({
      url: config.keycloakUrl,
      realm: config.keycloakRealm,
      clientId: config.keycloakClientId,
    });

    this.authState = {
      user: null,
      isAuthenticated: false,
      accessToken: null,
    };

    this.onAuthStateChangedCallback = () => {};
    this.isLoggingOut = false;
  }

  async init() {
    try {
      // Add better error handling for Keycloak initialization
      if (!this.keycloakInstance) {
        console.log("Keycloak instance is not initialized WTF");
        throw new Error("Keycloak instance not properly initialized");
      }

      console.log(this.keycloakInstance, { depth: null });
      console.log(`${window.location.origin}/silent-check-sso.html`);
      const authenticated = await this.keycloakInstance.init({
        onLoad: "check-sso",
        silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
        pkceMethod: "S256",
        enableLogging: true, // Enable logging for debugging
      });

      console.log("Keycloak initialized:", authenticated);
      if (authenticated) {
        this.authState.isAuthenticated = true;
        this.authState.accessToken = this.keycloakInstance.token;
        this.authState.user = this._getUserFromKeycloak();
      } else {
        this.authState = {
          user: null,
          isAuthenticated: false,
          accessToken: null,
        };
      }

      this._setupTokenRefresh();
      this._notifyStateChange();

      return authenticated;
    } catch (error) {
      console.log(error, { depth: null });
      // More robust error handling
      const errorMessage =
        error?.message || "Unknown error during Keycloak initialization";
      console.error("Error initializing KeycloakService:", errorMessage);

      // Reset auth state
      this.authState = {
        user: null,
        isAuthenticated: false,
        accessToken: null,
      };
      this._notifyStateChange();

      // Re-throw with better information
      throw new Error(`Keycloak initialization failed: ${errorMessage}`);
    }
  }

  async login() {
    try {
      await this.keycloakInstance.login({
        redirectUri: `${window.location.origin}/callback`,
      });
    } catch (error) {
      console.error(
        "Keycloak login error:",
        error?.message || "Unknown login error"
      );
      throw error;
    }
  }

  async logout(options) {
    try {
      console.log("KeycloakService: Starting logout process");
      this.isLoggingOut = true;
      
      // Set a flag to indicate logout is in progress
      sessionStorage.setItem('keycloak_logout_in_progress', 'true');
      
      // Clear local auth state first
      this.authState = {
        user: null,
        isAuthenticated: false,
        accessToken: null,
      };
      this._notifyStateChange();

      // Use Keycloak's built-in logout method instead of createLogoutUrl
      const logoutUrl = options?.returnTo || `${window.location.origin}/login`;
      console.log("KeycloakService: Logout redirect URL:", logoutUrl);
      
      // Use the Keycloak instance's logout method which properly handles the logout flow
      await this.keycloakInstance.logout({
        redirectUri: logoutUrl,
      });
      
    } catch (error) {
      console.error(
        "Keycloak logout error:",
        error?.message || "Unknown logout error"
      );
      this.isLoggingOut = false;
      
      // Clear the logout flag on error
      sessionStorage.removeItem('keycloak_logout_in_progress');
      
      // Even if logout fails, we should clear local state
      this.authState = {
        user: null,
        isAuthenticated: false,
        accessToken: null,
      };
      this._notifyStateChange();
      
      // If logout fails, redirect manually
      setTimeout(() => {
        window.location.href = options?.returnTo || `${window.location.origin}/login`;
      }, 1000);
      
      throw error;
    }
  }

  async getAccessTokenSilently(options) {
    try {
      if (!this.keycloakInstance || !this.keycloakInstance.token) {
        throw new Error("Login required");
      }

      // Check if token is about to expire and refresh it
      if (this.keycloakInstance.isTokenExpired(30)) {
        // 30 seconds threshold
        await this.keycloakInstance.updateToken(60);
      }

      this.authState.accessToken = this.keycloakInstance.token;
      this._notifyStateChange();
      return this.keycloakInstance.token;
    } catch (error) {
      console.error(
        "Error getting token silently:",
        error?.message || "Unknown token error"
      );
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
    if (typeof this.onAuthStateChangedCallback === "function") {
      this.onAuthStateChangedCallback(this.authState);
    }
  }

  async handleRedirectCallback() {
    try {
      console.log("KeycloakService: Handling redirect callback");
      console.log("KeycloakService: Current URL:", window.location.href);
      
      // Check if this is a logout callback using multiple detection methods
      const wasLoggingOut = sessionStorage.getItem('keycloak_logout_in_progress') === 'true';
      const hasLogoutIndicators = this.isLogoutCallback();
      
      if (wasLoggingOut || hasLogoutIndicators) {
        console.log("KeycloakService: Detected logout callback, clearing auth state");
        this.isLoggingOut = false;
        
        // Clear the logout flag
        sessionStorage.removeItem('keycloak_logout_in_progress');
        
        this.authState = {
          user: null,
          isAuthenticated: false,
          accessToken: null,
        };
        this._notifyStateChange();
        
        // Redirect to login page instead of trying to initialize
        setTimeout(() => {
          window.location.replace('/login');
        }, 100);
        return false;
      }
      
      // Check if URL contains error parameters that might indicate a failed callback
      const urlParams = new URLSearchParams(window.location.search);
      const urlHash = new URLSearchParams(window.location.hash.substring(1));
      
      const hasError = urlParams.get('error') || urlHash.get('error');
      if (hasError) {
        console.error("KeycloakService: Error in callback URL:", hasError);
        throw new Error(`Authentication failed: ${hasError}`);
      }
      
      // Normal login callback - proceed with initialization
      console.log("KeycloakService: Processing login callback");
      return await this.init();
    } catch (error) {
      console.error(
        "Error handling redirect callback in KeycloakService:",
        error?.message || "Unknown callback error"
      );
      
      this.isLoggingOut = false;
      
      // Clear logout flag on error
      sessionStorage.removeItem('keycloak_logout_in_progress');
      
      this.authState = {
        user: null,
        isAuthenticated: false,
        accessToken: null,
      };
      this._notifyStateChange();
      throw error;
    }
  }

  _getUserFromKeycloak() {
    try {
      const userInfo = this.keycloakInstance.idTokenParsed || {};

      return {
        id: userInfo.preferred_username || userInfo.sub || "",
        name: userInfo.name || userInfo.preferred_username || "",
        email: userInfo.email || "",
        picture: userInfo.picture || "",
        ...userInfo, // Include all other available properties
      };
    } catch (error) {
      console.error(
        "Error extracting user info:",
        error?.message || "Unknown user info error"
      );
      return {
        id: "",
        name: "",
        email: "",
        picture: "",
      };
    }
  }

  _setupTokenRefresh() {
    if (!this.keycloakInstance) return;

    this.keycloakInstance.onTokenExpired = () => {
      console.log("Token expired, refreshing...");
      this.keycloakInstance
        .updateToken(90)
        .then((refreshed) => {
          if (refreshed) {
            console.log("Token refreshed");
            this.authState.accessToken = this.keycloakInstance.token;
            this._notifyStateChange();
          }
        })
        .catch((error) => {
          console.error(
            "Failed to refresh token",
            error?.message || "Unknown refresh error"
          );
          // Session might be expired, redirect to login
          this.login();
        });
    };
  }

  // Generic method to detect if we're in a callback flow
  isInCallbackFlow() {
    // Only return true for LOGIN callbacks, not logout callbacks
    // Logout callbacks should be handled separately by isLogoutCallback()
    const hasLoginCallback = (window.location.hash.includes("code=") && window.location.hash.includes("state=")) ||
                            (window.location.search.includes("code=") && window.location.search.includes("state="));
    return hasLoginCallback;
  }

  // Generic method to detect if this is a logout callback
  isLogoutCallback() {
    const hash = window.location.hash;
    const search = window.location.search;
    const currentUrl = window.location.href;
    
    // Check for Keycloak-specific logout callback parameters
    const hasLogoutParams = currentUrl.includes('post_logout_redirect_u') || 
                           currentUrl.includes('client_id=') && !currentUrl.includes('code=');
    
    // Check for explicit logout completion indicators
    const hasSessionState = hash.includes("session_state=") || search.includes("session_state=");
    const hasNoCode = !hash.includes("code=") && !search.includes("code=");
    
    // Check if we're coming from a logout URL (indicating logout completion)
    const referrer = document.referrer;
    const isFromLogoutUrl = referrer.includes('/logout') || referrer.includes('protocol/openid-connect/logout');
    
    // Check session storage flag
    const wasLoggingOut = sessionStorage.getItem('keycloak_logout_in_progress') === 'true';
    
    // Special case: if we're on the login page and were logging out, this is the final destination
    // Clear the flag and only treat as logout callback if we haven't processed it yet
    if (wasLoggingOut && window.location.pathname === '/login') {
      const alreadyProcessed = sessionStorage.getItem('keycloak_logout_processed') === 'true';
      if (!alreadyProcessed) {
        // Mark as processed to prevent infinite loops
        sessionStorage.setItem('keycloak_logout_processed', 'true');
        // Clear the logout flag
        sessionStorage.removeItem('keycloak_logout_in_progress');
        console.log("KeycloakService: Processing logout completion, clearing flags");
        return true;
      } else {
        // Already processed, don't treat as logout callback anymore
        sessionStorage.removeItem('keycloak_logout_processed');
        sessionStorage.removeItem('keycloak_logout_in_progress');
        return false;
      }
    }
    
    // Logout callback indicators:
    // 1. Coming from a logout URL
    // 2. Has session_state but no authorization code (typical of logout completion)
    // 3. Has logout-specific parameters like post_logout_redirect_u
    const isLogout = isFromLogoutUrl || (hasSessionState && hasNoCode) || hasLogoutParams;
    
    if (isLogout) {
      console.log("KeycloakService: Logout callback detected - isFromLogoutUrl:", isFromLogoutUrl, 
                  "hasSessionState:", hasSessionState,
                  "hasNoCode:", hasNoCode,
                  "hasLogoutParams:", hasLogoutParams);
      // Clear logout flags when we detect a proper logout callback
      sessionStorage.removeItem('keycloak_logout_in_progress');
      sessionStorage.removeItem('keycloak_logout_processed');
    }
    
    return isLogout;
  }
}

export default KeycloakService;
