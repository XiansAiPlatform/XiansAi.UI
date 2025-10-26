import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  TextField,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';

/**
 * Enhanced Confirmation Dialog with danger levels
 * 
 * Danger Levels:
 * - 'critical': Requires text confirmation, destructive red theme (e.g., delete tenant)
 * - 'high': Strong warning, red theme (e.g., delete user, disable tenant)
 * - 'warning': Caution, orange theme (e.g., remove from list)
 * - 'info': Informational, blue theme (e.g., general confirmations)
 */
const ConfirmationDialog = ({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  dangerLevel = 'high', // 'critical' | 'high' | 'warning' | 'info'
  requireConfirmText = null, // Text user must type to confirm (for critical actions)
  confirmationKeyword = 'DELETE', // Default keyword for text confirmation
  loading = false, // Show loading state on confirm button
  entityName = '', // Name of entity being acted upon (for display in messages)
}) => {
  const [confirmText, setConfirmText] = useState('');
  const [textError, setTextError] = useState(false);

  // Determine if text confirmation is required
  const needsTextConfirm = dangerLevel === 'critical' || requireConfirmText !== null;
  const expectedText = requireConfirmText || confirmationKeyword;

  // Get configuration based on danger level
  const getConfig = () => {
    switch (dangerLevel) {
      case 'critical':
        return {
          color: 'error',
          icon: <ErrorOutlineIcon sx={{ fontSize: 48, color: 'error.main' }} />,
          bgColor: 'error.lighter',
          borderColor: 'error.main',
          alertSeverity: 'error',
        };
      case 'high':
        return {
          color: 'error',
          icon: <WarningAmberIcon sx={{ fontSize: 48, color: 'error.main' }} />,
          bgColor: 'error.lighter',
          borderColor: 'error.light',
          alertSeverity: 'error',
        };
      case 'warning':
        return {
          color: 'warning',
          icon: <ReportProblemIcon sx={{ fontSize: 48, color: 'warning.main' }} />,
          bgColor: 'warning.lighter',
          borderColor: 'warning.main',
          alertSeverity: 'warning',
        };
      case 'info':
      default:
        return {
          color: 'info',
          icon: <InfoOutlinedIcon sx={{ fontSize: 48, color: 'info.main' }} />,
          bgColor: 'info.lighter',
          borderColor: 'info.main',
          alertSeverity: 'info',
        };
    }
  };

  const config = getConfig();

  const handleConfirm = () => {
    if (needsTextConfirm && confirmText !== expectedText) {
      setTextError(true);
      return;
    }
    onConfirm();
  };

  const handleClose = () => {
    setConfirmText('');
    setTextError(false);
    onCancel();
  };

  const isConfirmDisabled = loading || (needsTextConfirm && confirmText !== expectedText);

  return (
    <Dialog 
      open={open} 
      onClose={loading ? undefined : handleClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: 24,
        }
      }}
    >
      <DialogTitle sx={{ pb: 2 }}>
        <Box display="flex" alignItems="center" gap={2}>
          {config.icon}
          <Typography variant="h6" component="div" fontWeight={600}>
            {title}
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1" color="text.primary" sx={{ mb: 2 }}>
            {message}
          </Typography>

          {dangerLevel === 'critical' && (
            <Alert severity={config.alertSeverity} sx={{ mb: 2 }}>
              <Box>
                <Typography variant="body2" fontWeight={700} sx={{ color: 'error.dark' }}>
                  This action cannot be undone!
                </Typography>
                {entityName && (
                  <Typography variant="body2" sx={{ mt: 0.5, color: 'error.dark' }}>
                    All data associated with "{entityName}" will be permanently deleted.
                  </Typography>
                )}
              </Box>
            </Alert>
          )}

          {dangerLevel === 'high' && (
            <Alert severity={config.alertSeverity} sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ color: 'error.dark' }}>
                This action cannot be undone. Please confirm before proceeding.
              </Typography>
            </Alert>
          )}

          {needsTextConfirm && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Please type <strong>{expectedText}</strong> to confirm:
              </Typography>
              <TextField
                fullWidth
                value={confirmText}
                onChange={(e) => {
                  setConfirmText(e.target.value);
                  setTextError(false);
                }}
                placeholder={expectedText}
                error={textError}
                helperText={textError ? `Please type "${expectedText}" exactly to confirm` : ''}
                disabled={loading}
                autoFocus
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !isConfirmDisabled) {
                    handleConfirm();
                  }
                }}
              />
            </Box>
          )}
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ padding: '16px 24px', gap: 1 }}>
        <Button 
          onClick={handleClose} 
          color="inherit"
          variant="outlined"
          disabled={loading}
          sx={{ minWidth: '100px', textTransform: 'none' }}
        >
          {cancelLabel}
        </Button>
        <Button 
          onClick={handleConfirm} 
          color={config.color}
          variant="contained"
          disabled={isConfirmDisabled}
          startIcon={loading ? <CircularProgress size={16} /> : null}
          sx={{ minWidth: '100px', textTransform: 'none' }}
        >
          {loading ? 'Processing...' : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationDialog; 