import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';

const DefinitionActions = ({
  selectedAgentName,
  deleteDialogOpen,
  onDeleteAllCancel,
  onDeleteAllConfirm
}) => {
  return (
    <Dialog
      open={deleteDialogOpen}
      onClose={onDeleteAllCancel}
      onClick={(e) => e.stopPropagation()}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        {"Delete Agent?"}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          Are you sure you want to delete agent "{selectedAgentName}" and all its flow definitions? This action cannot be undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ padding: '16px 24px' }}>
        <Button onClick={onDeleteAllCancel}>Cancel</Button>
        <Button onClick={onDeleteAllConfirm} variant="contained" color="error" autoFocus>
          Delete Agent
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DefinitionActions; 