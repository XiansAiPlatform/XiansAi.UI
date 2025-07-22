# EntraID Account Conflict Handling

This document explains how to handle account conflicts when using EntraID authentication, particularly the `AADB2C90077` error that occurs when multiple Microsoft accounts are present in the browser.

## Problem Description

When users have multiple Microsoft accounts (work, personal, etc.) signed into their browser, EntraID authentication can encounter conflicts, resulting in errors like:

```
AADB2C90077: User does not have an existing session and request prompt parameter has a value of 'None'
```

This typically happens when:
- User has multiple Microsoft accounts in the same browser
- MSAL tries to perform silent authentication but can't determine which account to use
- The authentication flow expects a specific account but finds multiple cached sessions

## Solution Overview

We've implemented a comprehensive solution that:

1. **Detects account conflict errors** automatically
2. **Provides graceful error handling** instead of showing raw error pages
3. **Offers user-friendly recovery options** like account selection or account clearing
4. **Prevents the error from occurring** by using appropriate authentication prompts

## Implementation Details

### 1. Enhanced EntraIdService

The `EntraIdService` now includes:

#### New Error Detection Methods
```javascript
// Check if an error requires user interaction
_isInteractionRequiredError(error)

// Check if error indicates account conflict specifically  
isAccountConflictError(error)
```

#### New Recovery Methods
```javascript
// Force account selection dialog
selectAccount()

// Clear all cached accounts and start fresh
forceLogoutAndClear(returnUrl)

// Handle authentication errors with recovery options
handleAuthenticationError(error, context)
```

#### Improved Authentication Flow
- Default to `prompt: 'select_account'` in login attempts
- Better error handling in silent token acquisition
- Enhanced callback processing with conflict detection

### 2. Enhanced AuthContext

The `AuthContext` now provides:

#### New Utility Methods
```javascript
const { 
  selectAccount,           // Trigger account selection
  forceLogoutAndClear,     // Clear all accounts
  clearError,              // Clear current error state
  hasMultipleAccounts,     // Check if multiple accounts cached
  getCachedAccounts,       // Get account information
  isAccountConflictError   // Check if error is account conflict
} = useAuth();
```

#### Improved Error Handling
- Automatic detection of interaction required errors
- Graceful state clearing when conflicts occur
- Enhanced error information with recovery options

### 3. Account Conflict Handler Component

A reusable dialog component that provides a user-friendly interface for resolving account conflicts:

```jsx
import AccountConflictHandler from '../../Manager/Components/Common/AccountConflictHandler';

// Use in your component
<AccountConflictHandler 
  open={showDialog}
  onClose={handleClose}
  error={conflictError}
/>
```

Features:
- Clear explanation of the issue
- Display of cached accounts
- Options to select account or clear all accounts
- Material-UI design consistent with the application

### 4. Custom Hook for Account Conflicts

A convenient hook that automates conflict detection and handling:

```jsx
import useAccountConflictHandler from '../../Manager/Components/Common/useAccountConflictHandler';

const { 
  hasConflict,
  dialogProps,
  handleSelectAccount,
  handleForceLogout 
} = useAccountConflictHandler({
  autoShow: true,                    // Automatically show dialog on conflict
  onConflictDetected: (error) => {}, // Callback when conflict detected
  onResolved: () => {}               // Callback when resolved
});

// Use with the dialog component
<AccountConflictHandler {...dialogProps} />
```

## Usage Examples

### Basic Usage in a Component

```jsx
import { useAuth } from '../../auth/AuthContext';
import AccountConflictHandler from '../Common/AccountConflictHandler';
import useAccountConflictHandler from '../Common/useAccountConflictHandler';

function MyComponent() {
  const { error, getAccessTokenSilently } = useAuth();
  const { dialogProps } = useAccountConflictHandler();

  const handleApiCall = async () => {
    try {
      const token = await getAccessTokenSilently();
      // Make API call with token
    } catch (err) {
      // Account conflict errors are automatically handled by the hook
      console.error('API call failed:', err);
    }
  };

  return (
    <div>
      {/* Your component content */}
      <AccountConflictHandler {...dialogProps} />
    </div>
  );
}
```

### Manual Conflict Resolution

```jsx
import { useAuth } from '../../auth/AuthContext';

function MyComponent() {
  const { 
    error, 
    selectAccount, 
    forceLogoutAndClear, 
    isAccountConflictError 
  } = useAuth();

  const handleSelectAccount = async () => {
    try {
      await selectAccount();
    } catch (err) {
      console.error('Account selection failed:', err);
    }
  };

  const handleClearAccounts = async () => {
    try {
      await forceLogoutAndClear('/login?cleared=true');
    } catch (err) {
      console.error('Account clearing failed:', err);
    }
  };

  if (error && isAccountConflictError(error)) {
    return (
      <div>
        <p>Multiple accounts detected. Please choose an option:</p>
        <button onClick={handleSelectAccount}>Select Account</button>
        <button onClick={handleClearAccounts}>Clear All Accounts</button>
      </div>
    );
  }

  return <div>{/* Normal component content */}</div>;
}
```

## Configuration Options

### EntraID Service Configuration

You can customize the authentication behavior by modifying the login options:

```javascript
// Always prompt for account selection
await login({ prompt: 'select_account' });

// Force consent prompt
await login({ prompt: 'consent' });

// Specify a login hint
await login({ loginHint: 'user@domain.com' });
```

### Hook Configuration

```jsx
const conflictHandler = useAccountConflictHandler({
  autoShow: false,  // Don't automatically show dialog
  onConflictDetected: (error) => {
    // Custom handling
    console.log('Conflict detected:', error);
  },
  onResolved: () => {
    // Custom handling after resolution
    console.log('Conflict resolved');
  }
});
```

## Best Practices

1. **Always use the account conflict handler** in components that interact with authentication
2. **Provide clear user feedback** when conflicts occur
3. **Use account selection by default** to prevent conflicts
4. **Monitor for the specific error codes** in your error handling
5. **Clear error states** after successful recovery
6. **Test with multiple accounts** to ensure proper handling

## Error Codes to Watch For

- `AADB2C90077`: User does not have an existing session and request prompt parameter has a value of 'None'
- `AADB2C90118`: User interaction required
- `interaction_required`: Generic interaction required
- `consent_required`: User consent required
- `login_required`: User login required

## Testing

To test the account conflict handling:

1. Sign into multiple Microsoft accounts in your browser
2. Clear your application's localStorage (but not browser accounts)
3. Try to authenticate with the application
4. Verify that the conflict dialog appears instead of an error page
5. Test both recovery options (select account and clear accounts)

## Troubleshooting

### Common Issues

1. **Dialog doesn't appear**: Check that you're importing and using the `AccountConflictHandler` component
2. **Conflicts not detected**: Verify that the error checking logic matches your error format
3. **Infinite loops**: Ensure you're clearing error states after resolution

### Debug Information

Enable debug logging to see detailed information about account conflicts:

```javascript
// In your component
console.log('Has multiple accounts:', hasMultipleAccounts());
console.log('Cached accounts:', getCachedAccounts());
console.log('Current error:', error);
console.log('Is account conflict:', isAccountConflictError(error));
```

## Migration Guide

If you're updating existing components to use the new account conflict handling:

1. Import the required hooks and components
2. Replace manual error handling with the `useAccountConflictHandler` hook
3. Add the `AccountConflictHandler` component to your JSX
4. Test with multiple account scenarios

This solution provides a much better user experience compared to showing raw error pages, and helps users understand and resolve authentication conflicts easily. 