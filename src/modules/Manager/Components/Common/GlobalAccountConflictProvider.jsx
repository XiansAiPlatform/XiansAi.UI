import React from 'react';
import AccountConflictHandler from './AccountConflictHandler';
import useAccountConflictHandler from './useAccountConflictHandler';
import AccountConflictDebugger from './AccountConflictDebugger';

/**
 * Global provider that automatically handles account conflicts anywhere in the application.
 * This ensures that users always see the account conflict dialog with recovery options
 * no matter where in the app the conflict occurs.
 */
const GlobalAccountConflictProvider = ({ children }) => {

  // Use the account conflict handler with global scope
  const { dialogProps } = useAccountConflictHandler({
    autoShow: true,
    onConflictDetected: (conflictError) => {
      console.log('Global account conflict detected:', conflictError);
    },
    onResolved: () => {
      console.log('Global account conflict resolved');
    }
  });

  return (
    <>
      {children}
      {/* Global account conflict handler - will show when needed */}
      <AccountConflictHandler {...dialogProps} />
      {/* Debug component to help troubleshoot issues */}
      <AccountConflictDebugger enabled={true} />
    </>
  );
};

export default GlobalAccountConflictProvider; 