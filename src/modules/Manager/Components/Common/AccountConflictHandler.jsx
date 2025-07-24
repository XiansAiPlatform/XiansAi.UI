import React from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Typography, 
  Box,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import { 
  AccountCircle as AccountIcon,
  Warning as WarningIcon,
  Logout as LogoutIcon,
  Login as LoginIcon
} from '@mui/icons-material';
import { useAuth } from '../../auth/AuthContext';

const AccountConflictHandler = ({ open, onClose, error }) => {
  const { 
    selectAccount, 
    forceLogoutAndClear, 
    clearError, 
    getCachedAccounts,
    isAccountConflictError
  } = useAuth();

  // Check if this is an account conflict error
  const isConflictError = isAccountConflictError(error);
  
  if (!isConflictError) {
    return null;
  }

  // Safely get cached accounts with error handling
  let cachedAccounts = [];
  try {
    cachedAccounts = getCachedAccounts();
  } catch (err) {
    console.warn('AccountConflictHandler: Error getting cached accounts:', err.message);
  }

  const handleSelectAccount = async () => {
    try {
      clearError();
      onClose();
      await selectAccount();
    } catch (err) {
      console.error('Failed to select account:', err);
    }
  };

  const handleForceLogout = async () => {
    try {
      clearError();
      onClose();
      await forceLogoutAndClear(window.location.origin + '/login?cleared=true');
    } catch (err) {
      console.error('Failed to force logout:', err);
    }
  };

  const handleClose = () => {
    clearError();
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <WarningIcon color="warning" />
        Multiple Microsoft Accounts Detected
      </DialogTitle>
      
      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2 }}>
          {error?.userMessage || 'There are multiple Microsoft accounts signed in to your browser. Please choose how you would like to proceed.'}
        </Alert>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          This usually happens when you have multiple Microsoft accounts (work, personal, etc.) signed in to your browser. 
          You can either select which account to use or clear all accounts and start fresh.
        </Typography>

        {cachedAccounts.length > 0 && (
          <Box sx={{ mt: 2, mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Cached Accounts:
            </Typography>
            <List dense>
              {cachedAccounts.map((account, index) => (
                <ListItem key={index} sx={{ py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <AccountIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={account.name || account.username}
                    secondary={account.email}
                    primaryTypographyProps={{ variant: 'body2' }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          <strong>Recommended:</strong> Use "Select Account" to choose which account you want to use for this session.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 1 }}>
        <Button 
          onClick={handleSelectAccount}
          variant="contained"
          startIcon={<LoginIcon />}
          color="primary"
        >
          Select Account
        </Button>
        
        <Button 
          onClick={handleForceLogout}
          variant="outlined"
          startIcon={<LogoutIcon />}
          color="warning"
        >
          Clear All & Start Fresh
        </Button>
        
        <Button onClick={handleClose} color="inherit">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AccountConflictHandler; 