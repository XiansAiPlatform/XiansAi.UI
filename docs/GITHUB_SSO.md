# GitHub SSO in XiansAi.UI

This guide explains how the UI integrates with GitHub OAuth for authentication. It covers the login flow, configuration, OAuth callback handling, and how to use the GitHub auth provider in the app.

## What you'll use
- GitHub OAuth Apps (create at: [GitHub Developer Settings](https://github.com/settings/developers))
- Backend API endpoint for OAuth code-to-JWT exchange
- No external library dependencies (native fetch API)

## High-level flow
1. App boots and selects the auth provider from config.
2. When `REACT_APP_AUTH_PROVIDER=github`, the app uses GitHub-specific service (`GitHubService`) through a generic `AuthContext`.
3. If a valid session exists (JWT in sessionStorage), the user is authenticated. Otherwise, calling `login()` redirects to GitHub's authorization page.
4. GitHub redirects back to your app with `?code=...&state=...` (Authorization Code Flow). The UI sends the code to your backend API, which exchanges it for a JWT token.
5. API calls use the JWT token via `getAccessTokenSilently()`. Tokens are refreshed by the backend on subsequent API calls.
6. `logout()` clears sessionStorage and local state, then redirects to the login page.

## Where things live in the UI
- Provider selection: `src/App.jsx`
- Generic auth context: `src/modules/Manager/auth/AuthContext.js`
- GitHub service (login, callbacks, tokens): `src/modules/Manager/auth/github/GitHubService.js`
- Token helpers (claims/orgs): `src/modules/Manager/auth/github/GitHubTokenService.js`
- OAuth callback handler: `src/modules/Manager/auth/github/GitHubCallback.jsx`
- Runtime config: `public/config.js` (overrides), `src/config.js` (reader)

## Configuration

### UI Environment Variables
Set the following keys via runtime (`public/config.js`) or build-time env vars. Make sure `REACT_APP_AUTH_PROVIDER` is `github`.

```bash
# Required
REACT_APP_AUTH_PROVIDER=github
REACT_APP_API_URL=http://localhost:5000
REACT_APP_GITHUB_CLIENT_ID=your-github-oauth-app-client-id

# Optional (defaults shown)
REACT_APP_GITHUB_REDIRECT_URI=http://localhost:3000/callback
REACT_APP_GITHUB_SCOPES=read:user user:email
REACT_APP_GITHUB_ORGANIZATION_CLAIM=organizations
```

**Notes:**
- The redirect URI defaults to `{window.location.origin}/callback` if not specified
- You must register the redirect URI in your GitHub OAuth App settings
- The backend API must support the GitHub OAuth flow

### GitHub OAuth App Setup

1. **Create OAuth App:**
   - Go to [GitHub Developer Settings → OAuth Apps](https://github.com/settings/developers)
   - Click "New OAuth App"
   - Fill in the application details

2. **Configure URLs:**
   - **Homepage URL**: Your app's base URL (e.g., `http://localhost:3000`)
   - **Authorization callback URL**: Must match `REACT_APP_GITHUB_REDIRECT_URI` (e.g., `http://localhost:3000/callback`)

3. **Save Client ID:**
   - Copy the generated **Client ID** to `REACT_APP_GITHUB_CLIENT_ID`
   - **DO NOT** commit the Client Secret to your frontend code
   - The Client Secret should only be used by your backend API

### Backend API Requirements

Your backend API must implement a GitHub OAuth endpoint that:

1. **Accepts the OAuth callback:**
   - Endpoint: `POST /api/auth/github/callback`
   - Body: `{ code, state, redirectUri }`

2. **Exchanges code for access token:**
   - Uses GitHub's token endpoint: `POST https://github.com/login/oauth/access_token`
   - Requires: Client ID, Client Secret, authorization code

3. **Fetches user profile:**
   - Gets user info from: `GET https://api.github.com/user`
   - Gets user email from: `GET https://api.github.com/user/emails` (if needed)
   - Gets user orgs from: `GET https://api.github.com/user/orgs` (if needed)

4. **Returns JWT token:**
   - Response: `{ access_token: "your-jwt-token", user: {...} }`
   - JWT should include user claims and organization info

## OAuth Scopes

The `REACT_APP_GITHUB_SCOPES` controls what information the app can access:

| Scope | Description |
|-------|-------------|
| `read:user` | Read basic user profile information |
| `user:email` | Access user email addresses |
| `read:org` | Read organization membership (optional) |

**Default scopes:** `read:user user:email`

## Login Flow Details

### 1. User initiates login
```javascript
authService.login({ returnTo: '/manager/dashboard' });
```

### 2. Redirect to GitHub
```
https://github.com/login/oauth/authorize?
  client_id={CLIENT_ID}
  &redirect_uri={REDIRECT_URI}
  &scope=read:user user:email
  &state={RANDOM_STATE}
  &prompt=login
```

**CSRF Protection:** A random `state` parameter is generated and stored in `sessionStorage` to prevent CSRF attacks.

### 3. GitHub callback
After authentication, GitHub redirects to:
```
http://localhost:3000/callback?code=OAUTH_CODE&state=STATE_VALUE
```

### 4. Code exchange
The `GitHubCallback` component:
- Validates the `state` parameter
- Sends the `code` to your backend API
- Receives JWT token and user profile
- Stores token in `sessionStorage`
- Redirects to the return URL or dashboard

### 5. Authenticated state
- JWT token is stored in `sessionStorage` as `github_jwt_token`
- User profile is stored in `sessionStorage` as `github_user`
- All API calls include the JWT in the `Authorization: Bearer {token}` header

## Using Authentication in Components

### Check authentication status
```javascript
import { useAuth } from '../../../Manager/auth/AuthContext';

function MyComponent() {
  const { isAuthenticated, user, isLoading } = useAuth();
  
  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Please log in</div>;
  
  return <div>Welcome, {user.name}!</div>;
}
```

### Get access token for API calls
```javascript
import { useAuth } from '../../../Manager/auth/AuthContext';

function MyComponent() {
  const { providerInstance } = useAuth();
  
  const fetchData = async () => {
    const token = await providerInstance.getAccessTokenSilently();
    const response = await fetch('/api/data', {
      headers: { Authorization: `Bearer ${token}` }
    });
  };
}
```

### Logout
```javascript
const { logout } = useAuth();

<button onClick={() => logout()}>Logout</button>
```

## Token Management

### Access Token Retrieval
```javascript
const token = await authService.getAccessTokenSilently();
```

### User Claims
```javascript
import { createTokenService } from './createTokenService';

const tokenService = createTokenService();
const userId = tokenService.getUserId();
const email = tokenService.getEmail();
const organizations = tokenService.getOrganizations();
```

### Token Structure
The JWT token from your backend should include:
```json
{
  "sub": "github|12345678",
  "email": "user@example.com",
  "name": "John Doe",
  "picture": "https://avatars.githubusercontent.com/u/12345678",
  "organizations": ["org1", "org2"],
  "iat": 1234567890,
  "exp": 1234571490
}
```

## Environment-Specific Configuration

### Development
```bash
REACT_APP_AUTH_PROVIDER=github
REACT_APP_API_URL=http://localhost:5000
REACT_APP_GITHUB_CLIENT_ID=Iv1.dev_client_id
REACT_APP_GITHUB_REDIRECT_URI=http://localhost:3000/callback
```

### Production
```bash
REACT_APP_AUTH_PROVIDER=github
REACT_APP_API_URL=https://api.yourdomain.com
REACT_APP_GITHUB_CLIENT_ID=Iv1.prod_client_id
REACT_APP_GITHUB_REDIRECT_URI=https://yourdomain.com/callback
```

**Important:** Create separate GitHub OAuth Apps for development and production environments.

## Docker Deployment

When deploying with Docker, pass environment variables at runtime:

```bash
docker run -d \
  --name xiansai-ui \
  -p 3000:80 \
  -e REACT_APP_AUTH_PROVIDER=github \
  -e REACT_APP_API_URL=https://api.yourdomain.com \
  -e REACT_APP_GITHUB_CLIENT_ID=your-client-id \
  -e REACT_APP_GITHUB_REDIRECT_URI=https://yourdomain.com/callback \
  --restart unless-stopped \
  99xio/xiansai-ui:latest
```

Or use an environment file:
```bash
docker run -d \
  --name xiansai-ui \
  -p 3000:80 \
  --env-file .env.github \
  99xio/xiansai-ui:latest
```

## Troubleshooting

### Common Issues

**1. "Invalid redirect_uri" error**
- Ensure the redirect URI in your `.env` matches exactly what's registered in GitHub OAuth App
- Check for trailing slashes and protocol (http vs https)

**2. "state mismatch" error**
- This indicates a CSRF attack or session issue
- Clear sessionStorage and try again
- Ensure cookies are enabled

**3. "Unable to exchange code for token" error**
- Check that your backend API is running and accessible
- Verify the backend has the correct GitHub Client Secret
- Check backend logs for detailed error messages

**4. User logged out immediately after login**
- Check that the JWT token is being stored correctly in sessionStorage
- Verify the JWT token is valid and not expired
- Check browser console for errors

**5. CORS errors when calling backend**
- Ensure your backend API has CORS configured to allow requests from your UI domain
- Check that the `REACT_APP_API_URL` is correct

### Debug Logging

Enable debug logging in the browser console:
```javascript
localStorage.setItem('debug', 'GitHubService:*');
```

The GitHub service logs all authentication steps to help with debugging.

## Security Considerations

1. **Client Secret:** Never expose your GitHub OAuth App Client Secret in the frontend code. It should only be used by your backend API.

2. **State Parameter:** Always validate the `state` parameter to prevent CSRF attacks. The UI handles this automatically.

3. **HTTPS:** Use HTTPS in production to prevent token interception.

4. **Token Storage:** JWTs are stored in sessionStorage (not localStorage) to reduce XSS risk. They are cleared when the browser tab is closed.

5. **Prompt for Login:** The UI includes `prompt=login` in the OAuth URL to prevent automatic re-authentication after logout.

## Comparison with Other Auth Providers

| Feature | GitHub | Auth0 | Entra ID | OIDC |
|---------|--------|-------|----------|------|
| External library | No | Yes | Yes | Yes |
| Token type | JWT (custom) | JWT (standard) | JWT (standard) | JWT (standard) |
| Silent refresh | Backend-managed | Automatic | Automatic | Iframe-based |
| Organization support | Yes | Yes | Yes | Configurable |
| MFA support | Via GitHub | Via Auth0 | Native | Provider-specific |

## Checklist

Before deploying with GitHub SSO, ensure:

- [ ] GitHub OAuth App created with correct redirect URI
- [ ] `REACT_APP_AUTH_PROVIDER=github` set
- [ ] `REACT_APP_GITHUB_CLIENT_ID` configured
- [ ] Backend API endpoint `/api/auth/github/callback` implemented
- [ ] Backend has GitHub Client Secret (not in frontend)
- [ ] Backend returns JWT token with required claims
- [ ] Callback route `/callback` is accessible
- [ ] CORS configured on backend API
- [ ] HTTPS enabled in production
- [ ] Separate OAuth Apps for dev/staging/production

## Additional Resources

- [GitHub OAuth Documentation](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps)
- [GitHub API Documentation](https://docs.github.com/en/rest)
- [OAuth 2.0 Authorization Code Flow](https://oauth.net/2/grant-types/authorization-code/)
