import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography
} from '@mui/material';

const ConfirmationDialog = ({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  severity = 'error' // 'error' | 'warning' | 'info'
}) => {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Typography>{message}</Typography>
      </DialogContent>
      <DialogActions sx={{ padding: '16px 24px', gap: 2 }}>
        <Button 
          onClick={onCancel} 
          color="inherit"
          variant="outlined"
          sx={{ minWidth: '100px' }}
        >
          {cancelLabel}
        </Button>
        <Button 
          onClick={onConfirm} 
          color={severity}
          variant="contained"
          autoFocus
          sx={{ minWidth: '100px' }}
        >
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationDialog; 