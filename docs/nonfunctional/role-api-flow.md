# Role API Flow Documentation

This document explains how user roles are obtained from the server APIs and made available throughout the application.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         User Authentication                          │
│                    (Auth0, Keycloak, EntraId, etc.)                 │
└─────────────────────────────┬───────────────────────────────────────┘
                              │ Access Token
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          TenantContext                               │
│                    (Manages tenant & role data)                      │
└──────────────┬──────────────────────────────────┬───────────────────┘
               │                                   │
               │ fetchCurrentTenant()              │ fetchUserRoles()
               ▼                                   ▼
┌──────────────────────┐              ┌────────────────────────────────┐
│   Tenants API        │              │      Roles API                  │
│  /api/tenants/...    │              │  /api/roles/current             │
└──────────────────────┘              └────────────┬───────────────────┘
                                                   │
                                                   │ Returns Array of Roles
                                                   │ e.g., ["SysAdmin"]
                                                   │      ["TenantAdmin"]
                                                   │      ["TenantUser"]
                                                   ▼
                              ┌────────────────────────────────────────┐
                              │   roleUtils.js                         │
                              │   (Centralized role checking logic)    │
                              └────────────┬───────────────────────────┘
                                           │
                                           │ Provides computed values:
                                           │ • isSysAdmin
                                           │ • isTenantAdmin
                                           │ • isAdmin
                                           ▼
                              ┌────────────────────────────────────────┐
                              │   React Components                     │
                              │   (Use roles for UI/UX decisions)      │
                              └────────────────────────────────────────┘
```

## Detailed Flow

### 1. Authentication & Token Acquisition

When a user logs in, the authentication service (Auth0, Keycloak, EntraId, or OIDC) provides an **access token**.

```javascript
// From AuthContext
const { getAccessTokenSilently } = useAuth();
const token = await getAccessTokenSilently();
```

### 2. API Client Setup

The `useApiClient` hook automatically attaches the access token to all API requests:

**File:** `/src/modules/Manager/services/api-client.js`

```javascript
const createAuthHeaders = async (endpoint) => {
  const token = await getAccessToken();
  
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
  
  // Add tenant ID header if available
  if (!isPublicRegistrationEndpoint && selectedOrg) {
    headers['X-Tenant-Id'] = selectedOrg;
  }
  
  return headers;
};
```

**Key Headers:**
- `Authorization: Bearer <token>` - JWT access token
- `X-Tenant-Id: <tenantId>` - Current organization/tenant context
- `Content-Type: application/json` - Request format

### 3. Roles API Call

The `TenantContext` fetches user roles when the component mounts or when the organization changes.

**File:** `/src/modules/Manager/contexts/TenantContext.js`

```javascript
// Fetch user roles for the current tenant
const fetchUserRoles = useCallback(async () => {
  try {
    const roles = await rolesApi.getCurrentUserRole();
    setUserRoles(roles || []);
    return roles || [];
  } catch (err) {
    console.error('Error fetching user roles:', err);
    setUserRoles([]);
    return [];
  }
}, [rolesApi, showDetailedError]);
```

**API Endpoint Called:**

**File:** `/src/modules/Manager/services/roles-api.js`

```javascript
getCurrentUserRole: async () => {
  try {
    return await apiClient.get('/api/roles/current');
  } catch (error) {
    console.log('Failed to fetch roles:', error);
    throw error;
  }
}
```

**HTTP Request:**
```
GET /api/roles/current
Headers:
  Authorization: Bearer <access_token>
  X-Tenant-Id: <tenant_id>
  Content-Type: application/json
```

### 4. Server Response

The backend returns an **array of role strings** for the current user within the current tenant context.

**Expected Response Format:**
```json
[
  "SysAdmin"
]
```

or

```json
[
  "TenantAdmin",
  "TenantUser"
]
```

or

```json
[
  "TenantUser"
]
```

**Possible Role Values:**
- `"SysAdmin"` - System administrator (full access across all tenants)
- `"TenantAdmin"` - Tenant administrator (admin access within their tenant)
- `"TenantUser"` - Regular tenant user

### 5. Role Computation

The `TenantContext` uses the centralized `roleUtils.js` to compute role-based flags:

**File:** `/src/modules/Manager/contexts/TenantContext.js`

```javascript
import { isSysAdmin, isTenantAdmin, isAdmin } from '../utils/roleUtils';

// Memoize role-based computed values for performance
const roleChecks = useMemo(() => ({
  isSysAdmin: isSysAdmin(userRoles),      // true if "SysAdmin" in userRoles
  isTenantAdmin: isTenantAdmin(userRoles), // true if "TenantAdmin" in userRoles
  isAdmin: isAdmin(userRoles),             // true if either admin role present
}), [userRoles]);
```

**File:** `/src/modules/Manager/utils/roleUtils.js`

```javascript
export const isSysAdmin = (userRoles) => {
  return userRoles && userRoles.includes('SysAdmin');
};

export const isTenantAdmin = (userRoles) => {
  return userRoles && userRoles.includes('TenantAdmin');
};

export const isAdmin = (userRoles) => {
  return isSysAdmin(userRoles) || isTenantAdmin(userRoles);
};
```

### 6. Context Value Distribution

The computed values are distributed via React Context:

```javascript
return (
  <TenantContext
    value={{
      tenant,
      isLoading,
      error,
      fetchTenant: fetchCurrentTenant,
      userRoles,        // Raw array: ["SysAdmin", "TenantAdmin", ...]
      isSysAdmin,       // Computed boolean
      isTenantAdmin,    // Computed boolean
      isAdmin,          // Computed boolean
    }}
  >
    {children}
  </TenantContext>
);
```

### 7. Component Usage

Components can now access role information easily:

```javascript
import { useTenant } from '../../contexts/TenantContext';

const MyComponent = () => {
  const { isSysAdmin, isAdmin, userRoles } = useTenant();
  
  return (
    <div>
      {isSysAdmin && <AdminPanel />}
      {isAdmin && <SettingsTab />}
    </div>
  );
};
```

## Timing & Lifecycle

### When Roles Are Fetched

Roles are fetched in the `TenantContext` `useEffect` when:

1. ✅ User is authenticated (`isAuthenticated === true`)
2. ✅ Authentication is complete (`isAuthLoading === false`)
3. ✅ Organization is selected (`selectedOrg` is available)
4. ✅ Organization loading is complete (`isOrgLoading === false`)
5. ✅ Not on a public route (like `/login`, `/register`)

**Code:**
```javascript
useEffect(() => {
  const loadTenantData = async () => {
    // Validation checks...
    if (!isAuthLoading && !isOrgLoading && isAuthenticated && selectedOrg) {
      // Fetch tenant data
      const tenantData = await fetchCurrentTenant();
      
      // Fetch roles after tenant is available
      if (user && selectedOrg) {
        await fetchUserRoles();
      }
    }
  };
  
  // Small delay to ensure auth context is ready
  const timer = setTimeout(() => {
    loadTenantData();
  }, 1000);
  
  return () => clearTimeout(timer);
}, [isAuthenticated, isAuthLoading, isOrgLoading, selectedOrg, location.pathname]);
```

### Re-fetching Roles

Roles are re-fetched when:
- Organization/tenant changes (`selectedOrg` changes)
- Page navigation (if the location changes significantly)
- Manual refresh via `fetchTenant()` method (if exposed)

## Error Handling

### API Errors

```javascript
const fetchUserRoles = useCallback(async () => {
  try {
    const roles = await rolesApi.getCurrentUserRole();
    setUserRoles(roles || []);
  } catch (err) {
    console.error('Error fetching user roles:', err);
    setUserRoles([]); // Default to empty array on error
    
    // Only show error notification for non-auth errors
    if (err.status !== 401 && err.status !== 403) {
      await handleApiError(err, 'Failed to load user roles', showDetailedError);
    }
  }
}, [rolesApi, showDetailedError]);
```

### Default Behavior

If role fetching fails:
- `userRoles` is set to `[]` (empty array)
- All role checks return `false`:
  - `isSysAdmin = false`
  - `isTenantAdmin = false`
  - `isAdmin = false`
- This ensures **fail-safe behavior** - no access granted by default

## Security Considerations

### 1. Server-Side Validation

**Important:** Role checks on the frontend are for **UI/UX purposes only**. The backend **must** validate all permissions before performing sensitive operations.

### 2. Token-Based Security

The access token contains claims that the backend validates. The roles returned by `/api/roles/current` are based on the authenticated user's token.

### 3. Tenant Context

The `X-Tenant-Id` header ensures roles are scoped to the current organization/tenant context.

### 4. No Client-Side Manipulation

Roles cannot be manipulated on the client side because:
- They're fetched fresh from the server on each session
- The server validates the JWT token
- The server checks the tenant context

## Testing Role-Based Features

### Simulating Different Roles

To test different role scenarios, the backend needs to return different role arrays:

**SysAdmin:**
```json
["SysAdmin"]
```

**TenantAdmin:**
```json
["TenantAdmin"]
```

**Regular User:**
```json
["TenantUser"]
```

**Multiple Roles:**
```json
["TenantAdmin", "TenantUser"]
```

## Common Issues & Debugging

### Roles Not Loading

Check:
1. Network tab - Is `/api/roles/current` being called?
2. Response - What is the server returning?
3. Console - Are there any errors in `TenantContext`?
4. Organization selected - Is `selectedOrg` set?
5. Authentication - Is the user authenticated?

### Roles Showing as Empty Array

Check:
1. Server response - Is it returning the expected format?
2. Token validity - Is the access token still valid?
3. Tenant context - Is `X-Tenant-Id` header being sent?
4. Backend logs - Are there server-side errors?

### Role Checks Not Working

Check:
1. Exact role string - Is it `"SysAdmin"` (case-sensitive)?
2. Context usage - Are you using `useTenant()` hook?
3. Component mounting - Is the component rendered after roles are loaded?
4. Loading state - Is `isLoading` still `true`?

## Summary

The role flow is:

1. **User authenticates** → Gets access token
2. **TenantContext mounts** → Waits for auth & organization
3. **Calls `/api/roles/current`** → With token & tenant ID headers
4. **Server returns role array** → e.g., `["SysAdmin"]`
5. **Roles computed** → `isSysAdmin`, `isAdmin`, etc.
6. **Context provides values** → Available to all components
7. **Components use roles** → For conditional rendering & access control

