import { useState, useEffect } from 'react';
import { useAuth } from '../../auth/AuthContext';

/**
 * Custom hook to handle account conflict errors automatically
 * 
 * @param {Object} options - Configuration options
 * @param {boolean} options.autoShow - Whether to automatically show the conflict dialog
 * @param {Function} options.onConflictDetected - Callback when conflict is detected
 * @param {Function} options.onResolved - Callback when conflict is resolved
 * @returns {Object} - Hook utilities
 */
const useAccountConflictHandler = (options = {}) => {
  const { 
    autoShow = true, 
    onConflictDetected,
    onResolved 
  } = options;

  const { 
    error, 
    isAccountConflictError, 
    selectAccount, 
    forceLogoutAndClear, 
    clearError,
    getCachedAccounts,
    hasMultipleAccounts
  } = useAuth();

  const [showDialog, setShowDialog] = useState(false);
  const [conflictError, setConflictError] = useState(null);

  // Check for account conflicts
  useEffect(() => {
    if (error) {
      try {
        if (isAccountConflictError(error)) {
          setConflictError(error);
          
          if (autoShow) {
            setShowDialog(true);
          }
          
          if (onConflictDetected) {
            onConflictDetected(error);
          }
        }
      } catch (err) {
        console.warn('useAccountConflictHandler: Error checking conflict error:', err.message);
        // If we can't check the error type, don't treat it as a conflict
      }
    } else if (conflictError && !error) {
      // Error was cleared, conflict resolved
      setConflictError(null);
      setShowDialog(false);
      
      if (onResolved) {
        onResolved();
      }
    }
  }, [error, conflictError, autoShow, onConflictDetected, onResolved, isAccountConflictError]); // Removed isAccountConflictError from deps to avoid stale closure

  // Handle account selection
  const handleSelectAccount = async () => {
    try {
      clearError();
      setShowDialog(false);
      await selectAccount();
      return true;
    } catch (err) {
      console.error('Failed to select account:', err);
      return false;
    }
  };

  // Handle force logout
  const handleForceLogout = async (returnUrl) => {
    try {
      clearError();
      setShowDialog(false);
      await forceLogoutAndClear(returnUrl);
      return true;
    } catch (err) {
      console.error('Failed to force logout:', err);
      return false;
    }
  };

  // Manually show the dialog
  const showConflictDialog = () => {
    if (conflictError) {
      setShowDialog(true);
    }
  };

  // Hide the dialog
  const hideConflictDialog = () => {
    setShowDialog(false);
  };

  // Clear the conflict
  const clearConflict = () => {
    clearError();
    setConflictError(null);
    setShowDialog(false);
  };

  // Check if there's currently a conflict
  const hasConflict = Boolean(conflictError);

  // Check if multiple accounts are detected (with error handling)
  let multipleAccountsDetected = false;
  try {
    multipleAccountsDetected = hasMultipleAccounts();
  } catch (err) {
    console.warn('useAccountConflictHandler: Error checking multiple accounts:', err.message);
  }

  // Get cached account information (with error handling)
  let cachedAccounts = [];
  try {
    cachedAccounts = getCachedAccounts();
  } catch (err) {
    console.warn('useAccountConflictHandler: Error getting cached accounts:', err.message);
  }

  return {
    // State
    hasConflict,
    conflictError,
    showDialog,
    multipleAccountsDetected,
    cachedAccounts,
    
    // Actions
    handleSelectAccount,
    handleForceLogout,
    showConflictDialog,
    hideConflictDialog,
    clearConflict,
    
    // For use with AccountConflictHandler component
    dialogProps: {
      open: showDialog,
      onClose: hideConflictDialog,
      error: conflictError
    }
  };
};

export default useAccountConflictHandler; 