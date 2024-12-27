import React, { useState } from 'react';
import { 
  Typography, 
  Box, 
  Paper, 
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText 
} from '@mui/material';
import {
  Cancel as CancelIcon,
  Stop as TerminateIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';
import StatusChip from '../Common/StatusChip';
import { useNotification } from '../../contexts/NotificationContext';
import { useApi } from '../../services/api';


const WorkflowOverview = ({ workflow, onActionComplete }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const { showSuccess, showError } = useNotification();
  const api = useApi();

  const isRunning = workflow?.status?.toUpperCase() === 'RUNNING';

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleAction = async (action, force = false) => {
    try {
      await api.executeWorkflowCancelAction(workflow.id, force);
      if (onActionComplete) onActionComplete();
      showSuccess('Action requested. it may take a few minutes to complete.');
    } catch (error) {
      showError(error.message || 'An unexpected error occurred');
      console.error(`Error executing ${action}:`, error);
    }
    handleClose();
  };

  const menuItems = isRunning ? [
    <MenuItem key="cancel" onClick={() => handleAction('cancel')}>
      <ListItemIcon>
        <CancelIcon fontSize="small" />
      </ListItemIcon>
      <ListItemText>Cancel</ListItemText>
    </MenuItem>,
    <MenuItem key="terminate" onClick={() => handleAction('cancel', true)}>
      <ListItemIcon>
        <TerminateIcon fontSize="small" />
      </ListItemIcon>
      <ListItemText>Terminate</ListItemText>
    </MenuItem>
  ] : [];

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 3, 
        mb: 4, 
        backgroundColor: 'rgba(0, 0, 0, 0.02)',
        borderRadius: 2
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box>
          <Typography variant="h4">{workflow?.workflowType?.replace(/([A-Z])/g, ' $1').trim() || 'N/A'}</Typography>
          <Typography variant="subtitle1" color="text.secondary">{workflow?.id || 'N/A'}</Typography>
        </Box>
        
        <Button
          id="actions-button"
          aria-controls={open ? 'actions-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          onClick={handleClick}
          startIcon={<MoreVertIcon />}
          disabled={!isRunning}
          sx={{
            '&.Mui-disabled': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
            }
          }}
        >
          Actions
        </Button>
        
        <Menu
          id="actions-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          MenuListProps={{
            'aria-labelledby': 'actions-button',
          }}
        >
          {menuItems}
        </Menu>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3 }}>
      <Box>
          <StatusChip 
            label={workflow?.status || 'N/A'}
            status={workflow?.status?.toUpperCase()}
          />
        </Box>
        <Box>
          <Typography variant="subtitle2" color="text.secondary">Workflow Type</Typography>
          <Typography variant="body1">{workflow?.workflowType || 'N/A'}</Typography>
        </Box>

        <Box>
          <Typography variant="subtitle2" color="text.secondary">Start Time</Typography>
          <Typography variant="body1">
            {workflow?.startTime ? new Date(workflow.startTime).toLocaleString() : 'N/A'}
          </Typography>
        </Box>
        <Box>
          <Typography variant="subtitle2" color="text.secondary">End Time</Typography>
          <Typography variant="body1">
            {workflow?.closeTime ? new Date(workflow.closeTime).toLocaleString() : 'In Progress'}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default WorkflowOverview; 