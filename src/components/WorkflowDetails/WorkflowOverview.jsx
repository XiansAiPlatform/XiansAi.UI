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
  Stop as TerminateIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';
import StatusChip from '../Common/StatusChip';
import { useNotification } from '../../contexts/NotificationContext';
import { useApi } from '../../services/api';
import './WorkflowDetails.css';


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
      className="overview-paper"
    >
      <Box className="header-container">
        <Box className="header-left">
          <Box className="overview-header-content">
            <Box className="overview-title-row">
              <Typography className="overview-title">
                {workflow?.workflowType?.replace(/([A-Z])/g, ' $1').trim() || 'N/A'}
              </Typography>
              <StatusChip 
                label={workflow?.status || 'N/A'}
                status={workflow?.status?.toUpperCase()}
              />
            </Box>
            <Typography className="overview-subtitle">
              {workflow?.id || 'N/A'}
            </Typography>
          </Box>
        </Box>
        
        <Button
          id="actions-button"
          aria-controls={open ? 'actions-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          onClick={handleClick}
          startIcon={<MoreVertIcon />}
          disabled={!isRunning}
          className="overview-action-button action-button"
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

      <Box className="overview-grid">
        <Box className="overview-grid-item">
          <Typography className="overview-label" variant="subtitle2">
            Workflow Type
          </Typography>
          <Typography variant="body1">
            {workflow?.workflowType || 'N/A'}
          </Typography>
        </Box>

        <Box className="overview-grid-item">
          <Typography className="overview-label" variant="subtitle2">
            Start Time
          </Typography>
          <Typography variant="body1">
            {workflow?.startTime ? new Date(workflow.startTime).toLocaleString() : 'N/A'}
          </Typography>
        </Box>
        <Box className="overview-grid-item">
          <Typography className="overview-label" variant="subtitle2">
            End Time
          </Typography>
          <Typography variant="body1">
            {workflow?.closeTime ? new Date(workflow.closeTime).toLocaleString() : 'In Progress'}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default WorkflowOverview; 