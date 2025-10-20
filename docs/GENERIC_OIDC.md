## Generic OIDC in XiansAi.UI

This guide explains how the UI integrates with a generic OpenID Connect (OIDC) provider. It covers the login flow, configuration, redirects, silent token renewal, and how to use the auth APIs in the app.

### What you’ll use
- Library: `oidc-client-ts` (UI dependency: ^3.3.0)
- Silent renew page uses a CDN script (`oidc-client-ts` 3.1.0) embedded in `public/silent-redirect.html`

### High-level flow
1) App boots and selects the auth provider from config.
2) When `REACT_APP_AUTH_PROVIDER=oidc`, the app uses an OIDC-specific service (`OidcService`) through a generic `AuthContext`.
3) If a valid session exists, the user is considered authenticated. Otherwise, calling `login()` sends the browser to your Identity Provider (IdP).
4) The IdP redirects back to your app with `?code=...&state=...` (Authorization Code Flow). The UI exchanges the code for tokens, normalizes the profile, and updates React state.
5) API calls obtain tokens via `getAccessTokenSilently()`. When access tokens expire, a silent renew flow refreshes them in the background using an invisible iframe.
6) `logout()` clears local state and redirects to the IdP’s logout endpoint, then returns to your app.

### Where things live in the UI
- Provider selection: `src/App.jsx`
- Generic auth context: `src/modules/Manager/auth/AuthContext.js`
- OIDC service (login, callbacks, tokens): `src/modules/Manager/auth/oidc/OidcService.js`
- Token helpers (claims/orgs): `src/modules/Manager/auth/oidc/OidcTokenService.js`
- Runtime config: `public/config.js` (overrides), `src/config.js` (reader)
- Silent renew page: `public/silent-redirect.html`

### Configuration
Set the following keys via runtime (`public/config.js`) or build-time env vars. Make sure `REACT_APP_AUTH_PROVIDER` is `oidc`.

```bash
# Required
REACT_APP_AUTH_PROVIDER=oidc
REACT_APP_OIDC_AUTHORITY=https://your-idp-issuer-or-authority
REACT_APP_OIDC_CLIENT_ID=your-client-id

# Optional (recommended)
REACT_APP_OIDC_SCOPES=openid profile email

# Optional (IdP-specific)
# Some providers (e.g., Auth0 APIs) require an audience
REACT_APP_OIDC_AUDIENCE=https://your-api-identifier

# Optional (token claims)
# Name of the claim that lists organizations/tenants (array or single value)
REACT_APP_OIDC_ORGANIZATION_CLAIM=organizations
```

Notes:
- Redirect URIs are built dynamically by the UI using `window.location.origin`, so you don’t set them via env.
- You must still register these URIs in your IdP app configuration (see below).

### Redirect URIs to register in your IdP
- Login redirect URI: `<your-app-origin>/callback`
- Silent renew redirect URI: `<your-app-origin>/silent-redirect`
- Post-logout redirect URI: `<your-app-origin>/login` (or `/` if you prefer)

These must match exactly (scheme, host, port, and path) in your IdP application settings.

### How the app wires the provider
When `authProvider` is `oidc`, the app wraps the UI with an OIDC provider wrapper that creates one `OidcService` instance and passes it to the generic `AuthContext`.

### What `OidcService` handles for you
- Creates an `oidc-client-ts` `UserManager` with your authority, client ID, and scopes.
- Uses dynamic redirect URIs based on the current origin.
- Handles login redirects and the authorization code exchange.
- Maps profile claims into a simple `user` object.
- Attempts to hydrate missing fields (name/email/picture) via the OIDC UserInfo endpoint when available.
- Maintains `isAuthenticated` and `accessToken` in an internal auth state, exposed via the generic context.
- Performs silent token renewal automatically when enabled and possible.

### Using auth in React components
Import the `useAuth` hook from the generic context to access common auth operations.

```jsx
import { useAuth } from 'src/modules/Manager/auth/AuthContext';

export default function Example() {
  const { user, isAuthenticated, login, logout, getAccessTokenSilently } = useAuth();

  const callApi = async () => {
    const token = await getAccessTokenSilently();
    if (!token) return; // handle expired/interaction-required case
    await fetch('/api/protected', { headers: { Authorization: `Bearer ${token}` } });
  };

  return (
    <div>
      {isAuthenticated ? (
        <>
          <div>Hello, {user?.name || 'User'}</div>
          <button onClick={callApi}>Call API</button>
          <button onClick={() => logout({ returnTo: window.location.origin + '/login' })}>Logout</button>
        </>
      ) : (
        <button onClick={() => login()}>Login</button>
      )}
    </div>
  );
}
```

### Reading claims and organizations from the token
When `REACT_APP_AUTH_PROVIDER=oidc`, `createTokenService()` returns `OidcTokenService`, which provides helpers to read claims from the JWT access token.

```js
import { createTokenService } from 'src/modules/Manager/auth/createTokenService';

const tokenService = createTokenService();
const organizations = tokenService.getOrganizations(accessToken);
const customClaim = tokenService.getClaim(accessToken, 'my_custom_claim');
```

The organization claim name defaults to `organizations` but can be customized with `REACT_APP_OIDC_ORGANIZATION_CLAIM`.

### Silent token renewal
- The UI loads `public/silent-redirect.html` in a hidden iframe to complete the silent renewal flow.
- Ensure `<your-app-origin>/silent-redirect` is allowed in your IdP’s app settings.
- Some browsers or IdP configurations can block third‑party cookies; if silent renew fails, the UI will clear auth state and you may need to trigger an interactive login again.

### Common issues and troubleshooting
- Callback not handled (stuck after login)
  - Verify your IdP has `<origin>/callback` whitelisted.
  - Check for `code` and `state` in the URL; the UI only handles the callback when both are present.

- Silent renew fails repeatedly
  - Verify `<origin>/silent-redirect` is registered and reachable.
  - Third‑party cookies may be blocked; consider falling back to an interactive login when `getAccessTokenSilently()` returns `null` or throws.

- Missing `name`, `email`, or `picture`
  - Add `profile` and `email` scopes if your IdP requires them.
  - Confirm the IdP supports the UserInfo endpoint and that it’s enabled; the UI will attempt to hydrate missing fields from there.

- Audience errors (e.g., calling a protected API)
  - Some providers (Auth0) require an `audience` to mint API-ready access tokens. Set `REACT_APP_OIDC_AUDIENCE` accordingly and ensure the API accepts that token.

- Time skew / token just expired
  - If tokens appear to expire immediately, check server and client clock skew; consider a small leeway in your API.

### IdP-specific notes
- Auth0
  - Often requires `audience` to get API tokens.
  - Standard scopes: `openid profile email`. Add more as needed.

- Keycloak
  - Typically works with standard OIDC discovery and scopes.

- Entra ID / Entra ID B2C
  - Claims may differ (e.g., `emails` array). The UI maps several common claim names and will try to hydrate via UserInfo.

### Related backend docs
- Web API OIDC notes live under the server repo: `XiansAi.Server.Src/docs/webapi/GENERIC_OIDC.md`
- User API OIDC notes: `XiansAi.Server.Src/docs/user-api/GENERIC_OIDC.md`

### Quick checklist
- [ ] `REACT_APP_AUTH_PROVIDER=oidc`
- [ ] Authority, Client ID, and scopes set
- [ ] IdP allowed redirect URIs: `/callback`, `/silent-redirect`
- [ ] IdP post-logout redirect: `/login` (or `/`)
- [ ] (If needed) `REACT_APP_OIDC_AUDIENCE` configured


