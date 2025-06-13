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
      await this.keycloakInstance.logout({
        redirectUri: options?.returnTo || `${window.location.origin}/login`,
      });
      this.authState = {
        user: null,
        isAuthenticated: false,
        accessToken: null,
      };
      this._notifyStateChange();
    } catch (error) {
      console.error(
        "Keycloak logout error:",
        error?.message || "Unknown logout error"
      );
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
      // Keycloak handles the callback automatically in the init method
      return await this.init();
    } catch (error) {
      console.error(
        "Error handling redirect callback in KeycloakService:",
        error?.message || "Unknown callback error"
      );
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
