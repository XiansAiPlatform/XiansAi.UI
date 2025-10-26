# Role-Based Access Control (RBAC)

## Overview

This document describes the unified approach for role-based access control in the application.

## Role Utilities

All role checks are centralized in `/src/modules/Manager/utils/roleUtils.js` which provides the following utility functions:

### Available Functions

```javascript
import { isSysAdmin, isTenantAdmin, isAdmin, hasRole } from '../utils/roleUtils';

// Check if user has SysAdmin role
isSysAdmin(userRoles) // returns boolean

// Check if user has TenantAdmin role
isTenantAdmin(userRoles) // returns boolean

// Check if user has SysAdmin OR TenantAdmin role
isAdmin(userRoles) // returns boolean

// Check if user has a specific role
hasRole(userRoles, 'RoleName') // returns boolean
```

## TenantContext Integration

The `TenantContext` automatically provides pre-computed role checks:

```javascript
import { useTenant } from '../../contexts/TenantContext';

const MyComponent = () => {
  const { 
    userRoles,      // Array of role strings
    isSysAdmin,     // Boolean: user has SysAdmin role
    isTenantAdmin,  // Boolean: user has TenantAdmin role
    isAdmin         // Boolean: user has SysAdmin OR TenantAdmin role
  } = useTenant();

  // Use the pre-computed values directly
  if (isSysAdmin) {
    // Show admin-only features
  }
};
```

## Best Practices

### ✅ DO: Use TenantContext values directly (Recommended)

```javascript
const { isSysAdmin } = useTenant();

if (isSysAdmin) {
  // Allow access
}
```

### ✅ DO: Use utility functions when needed

```javascript
import { isSysAdmin } from '../utils/roleUtils';

const hasAccess = isSysAdmin(userRoles);
```

### ❌ DON'T: Manually check roles inline

```javascript
// ❌ Bad - inconsistent pattern
const isSysAdmin = userRoles.includes('SysAdmin');

// ❌ Bad - case sensitivity issues
const isSysAdmin = userRoles.some(role => role.toLowerCase() === 'sysadmin');
```

## Role Types

| Role | Description | Access Level |
|------|-------------|--------------|
| `SysAdmin` | System Administrator | Full system access, can manage all tenants and users |
| `TenantAdmin` | Tenant Administrator | Can manage users and settings within their tenant |
| `TenantUser` | Tenant User | Standard user access within their tenant |

## Common Use Cases

### 1. Conditional Rendering Based on Role

```javascript
const MyComponent = () => {
  const { isSysAdmin, isAdmin } = useTenant();

  return (
    <div>
      {isSysAdmin && <SystemAdminPanel />}
      {isAdmin && <AdminSettings />}
    </div>
  );
};
```

### 2. Filtering Navigation Items

```javascript
const filteredNavItems = NAV_ITEMS.filter(item => {
  if (item.requiresSysAdmin) {
    return isSysAdmin;
  }
  if (item.requiresAdmin) {
    return isAdmin;
  }
  return true;
});
```

### 3. Enabling/Disabling Actions

```javascript
const MyComponent = () => {
  const { isSysAdmin, isAdmin } = useTenant();

  return (
    <Button 
      onClick={handleDelete}
      disabled={!isAdmin}
    >
      Delete
    </Button>
  );
};
```

## Migration Guide

If you have existing code that checks roles manually, update it to use the unified approach:

### Before:
```javascript
const { userRoles } = useTenant();
const isSysAdmin = userRoles.includes('SysAdmin');
const hasAccess = userRoles.includes('SysAdmin') || userRoles.includes('TenantAdmin');
```

### After:
```javascript
const { isSysAdmin, isAdmin } = useTenant();
// Use isSysAdmin and isAdmin directly
```

## Files Updated

The following files have been updated to use the unified approach:

- ✅ `AdminDashboardRoute.jsx` - Admin dashboard access control
- ✅ `LeftNav.jsx` - Navigation filtering
- ✅ `Settings.jsx` - Settings tab visibility
- ✅ `ApiKeySettings.jsx` - API key management access
- ✅ `BrandingSettings.jsx` - Branding settings access
- ✅ `TemplatesList.jsx` - Template deletion access
- ✅ `AgentGroup.jsx` - Agent share/delete permissions
- ✅ `definitionUtils.js` - Workflow ownership checks

