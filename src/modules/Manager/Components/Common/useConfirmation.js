import { useState } from 'react';

/**
 * Custom hook for managing confirmation dialogs
 * 
 * @returns {Object} Dialog state and control functions
 * 
 * @example
 * const { confirmationState, showConfirmation, hideConfirmation } = useConfirmation();
 * 
 * // Show a confirmation dialog
 * showConfirmation({
 *   title: 'Delete User',
 *   message: 'Are you sure you want to delete this user?',
 *   onConfirm: async () => {
 *     await deleteUser(userId);
 *     hideConfirmation();
 *   },
 *   dangerLevel: 'high',
 *   confirmLabel: 'Delete User',
 * });
 * 
 * // Render the dialog
 * <ConfirmationDialog {...confirmationState} onCancel={hideConfirmation} />
 */
export const useConfirmation = () => {
  const [confirmationState, setConfirmationState] = useState({
    open: false,
    title: '',
    message: '',
    confirmLabel: 'Confirm',
    cancelLabel: 'Cancel',
    onConfirm: () => {},
    dangerLevel: 'high',
    requireConfirmText: null,
    confirmationKeyword: 'DELETE',
    loading: false,
    entityName: '',
  });

  const showConfirmation = ({
    title,
    message,
    onConfirm,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    dangerLevel = 'high',
    requireConfirmText = null,
    confirmationKeyword = 'DELETE',
    entityName = '',
  }) => {
    setConfirmationState({
      open: true,
      title,
      message,
      confirmLabel,
      cancelLabel,
      onConfirm,
      dangerLevel,
      requireConfirmText,
      confirmationKeyword,
      loading: false,
      entityName,
    });
  };

  const hideConfirmation = () => {
    setConfirmationState((prev) => ({
      ...prev,
      open: false,
      loading: false,
    }));
  };

  const setLoading = (loading) => {
    setConfirmationState((prev) => ({
      ...prev,
      loading,
    }));
  };

  return {
    confirmationState,
    showConfirmation,
    hideConfirmation,
    setLoading,
  };
};

export default useConfirmation;

