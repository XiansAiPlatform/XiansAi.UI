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
      
      // Store logout flag in sessionStorage to detect logout callbacks
      sessionStorage.setItem('keycloak_logout_in_progress', 'true');
      
      // Clear local auth state first
      this.authState = {
        user: null,
        isAuthenticated: false,
        accessToken: null,
      };
      this._notifyStateChange();

      // Perform logout with proper redirect URI - avoid callback URL
      const logoutUrl = options?.returnTo || `${window.location.origin}/login`;
      console.log("KeycloakService: Logout redirect URL:", logoutUrl);
      
      // Use window.location to directly navigate to logout URL to avoid callback
      const keycloakLogoutUrl = this.keycloakInstance.createLogoutUrl({
        redirectUri: logoutUrl,
      });
      console.log("KeycloakService: Keycloak logout URL:", keycloakLogoutUrl);
      
      // Directly navigate to logout URL
      window.location.href = keycloakLogoutUrl;
      
    } catch (error) {
      console.error(
        "Keycloak logout error:",
        error?.message || "Unknown logout error"
      );
      this.isLoggingOut = false;
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
      
      // Check if we were in the middle of a logout
      const wasLoggingOut = sessionStorage.getItem('keycloak_logout_in_progress') === 'true';
      
      if (wasLoggingOut) {
        console.log("KeycloakService: Detected logout callback based on session flag");
        sessionStorage.removeItem('keycloak_logout_in_progress');
        this.isLoggingOut = false;
        
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
      
      // Check if this might be a logout callback by URL pattern
      const isLogoutCallback = (window.location.hash.includes("session_state=") || window.location.search.includes("session_state=")) &&
                              !window.location.hash.includes("code=") && !window.location.search.includes("code=");
      
      if (isLogoutCallback) {
        console.log("KeycloakService: Detected logout callback by URL pattern, clearing auth state");
        this.authState = {
          user: null,
          isAuthenticated: false,
          accessToken: null,
        };
        this._notifyStateChange();
        // Don't try to initialize, just return false
        return false;
      }
      
      // Normal login callback - proceed with initialization
      console.log("KeycloakService: Processing login callback");
      return await this.init();
    } catch (error) {
      console.error(
        "Error handling redirect callback in KeycloakService:",
        error?.message || "Unknown callback error"
      );
      
      // Clean up logout flag if there was an error
      sessionStorage.removeItem('keycloak_logout_in_progress');
      this.isLoggingOut = false;
      
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
        id: userInfo.sub || "",
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
}

export default KeycloakService;
