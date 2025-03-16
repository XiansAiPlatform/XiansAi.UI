import React, { useState, useMemo } from 'react';
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
import { useApi } from '../../services/workflow-api';
import './WorkflowDetails.css';
import { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';


const WorkflowOverview = ({ workflowId, runId, onActionComplete, isMobile }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [workflow, setWorkflow] = useState(null);
  const open = Boolean(anchorEl);
  const { showSuccess, showError } = useNotification();
  const api = useApi();
  const { user } = useAuth0();
  
  // Replace the old useEffect with a new one to fetch workflow data
  useEffect(() => {
    const fetchWorkflow = async () => {
      if (!workflowId) return;
      
      try {
        const workflowData = await api.getWorkflow(workflowId, runId);
        setWorkflow(workflowData);
      } catch (error) {
        showError('Failed to fetch workflow details');
      }
    };

    fetchWorkflow();
  }, [workflowId, runId, api, showError]);

  // Update the refresh useEffect
  useEffect(() => {
    if (onActionComplete && workflowId) {
      const refreshWorkflow = async () => {
        try {
          const updatedWorkflow = await api.getWorkflow(workflowId);
          setWorkflow(updatedWorkflow);
        } catch (error) {
          showError('Failed to refresh workflow details');
        }
      };

      refreshWorkflow();
    }
  }, [onActionComplete, workflowId, api, showError]);

  // Add a helper function to safely convert status to string
  const getStatusString = (status) => {
    if (status === null || status === undefined) return '';
    return String(status);
  };

  const isRunning = getStatusString(workflow?.status).toUpperCase() === 'RUNNING';

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleAction = async (action, force = false) => {
    try {
      await api.executeWorkflowCancelAction(workflow.id, force);
      
      // Fetch updated workflow data
      const updatedWorkflow = await api.getWorkflow(workflow.id);
      setWorkflow(updatedWorkflow);
      
      showSuccess('Termination requested. it may take a few minutes to complete.');
    } catch (error) {
      showError('An unexpected error occurred. Please check if the workflow is still running. Error: ' + error.message);
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

  // Add helper function to calculate duration
  const calculateDuration = (startTime, endTime) => {
    if (!startTime) return 'N/A';
    
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const diff = end - start;
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    }
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    if (minutes > 1) {
      return `${minutes} minutes`;
    }
    if (minutes === 1) {
      return '1 minute';
    }
    if (seconds >= 0) {
      return 'Less than a minute';
    }
    return 'Just now';
  };

  const isOwner = useMemo(() => {
    return workflow?.owner === user?.sub;
  }, [workflow?.owner, user?.sub]);

  return (
    <Paper 
      elevation={0} 
      className="overview-paper"
      sx={{
        padding: isMobile ? 2 : 3,
        borderRadius: 2,
        background: 'linear-gradient(to right bottom, #ffffff, #fafafa)'
      }}
    >
      <Box 
        className="header-container"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'stretch',
          marginBottom: isMobile ? 2 : 3,
          gap: isMobile ? 2 : 0
        }}
      >
        {/* Top row with title and actions button */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          width: '100%',
          mb: 1
        }}>
          <Typography 
            className="overview-title"
            variant="h5"
            sx={{ 
              fontWeight: 600,
              fontSize: isMobile ? '1.25rem' : '1.5rem'
            }}
          >
            {workflow?.workflowType?.replace(/([A-Z])/g, ' $1').trim() || 'N/A'}
          </Typography>
          
          <Button
            id="actions-button"
            variant="outlined"
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              minWidth: isMobile ? 'auto' : 100,
              padding: isMobile ? '4px 12px' : '6px 16px',
              ml: 2
            }}
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
        </Box>

        {/* Status and details section */}
        <Box className="header-left" sx={{ width: '100%' }}>
          <Box 
            className="overview-header-content"
            sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
          >
            <Box 
              className="overview-title-row"
              sx={{ 
                display: 'flex', 
                flexDirection: isMobile ? 'column' : 'row',
                alignItems: isMobile ? 'flex-start' : 'center', 
                gap: isMobile ? 1 : 2 
              }}
            >
              <StatusChip 
                label={workflow?.status || 'N/A'}
                status={getStatusString(workflow?.status).toUpperCase()}
              />
            </Box>
            
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 0.5,
              fontSize: isMobile ? '0.8125rem' : '0.875rem'
            }}>
              <Typography 
                sx={{ 
                  color: 'text.secondary', 
                  fontSize: 'inherit',
                  wordBreak: 'break-word'
                }}
              >
                <Box component="span" sx={{ fontWeight: 600, color: 'primary.dark' }}>ID:</Box> {workflow?.id || 'N/A'}
              </Typography>
              <Typography 
                sx={{ 
                  color: 'text.secondary', 
                  fontSize: 'inherit',
                  wordBreak: 'break-word'
                }}
              >
                <Box component="span" sx={{ fontWeight: 600, color: 'primary.dark' }}>Run ID:</Box> {workflow?.runId || 'N/A'}
              </Typography>
              <Typography 
                sx={{ 
                  fontSize: 'inherit',
                  color: isOwner ? 'primary.main' : 'text.secondary',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  fontWeight: isOwner ? 500 : 400,
                  flexWrap: 'wrap'
                }}
              >
                <Box component="span" sx={{ fontWeight: 600, color: 'primary.dark' }}>Owner:</Box> {workflow?.owner || 'N/A'}
                {isOwner && (
                  <Typography
                    component="span"
                    sx={{
                      fontSize: '0.75rem',
                      bgcolor: 'primary.main',
                      color: 'white',
                      px: 1,
                      py: 0.25,
                      borderRadius: 1,
                      ml: 1
                    }}
                  >
                    Me
                  </Typography>
                )}
              </Typography>
              <Typography 
                sx={{ 
                  color: 'text.secondary', 
                  fontSize: 'inherit',
                  wordBreak: 'break-word'
                }}
              >
                <Box component="span" sx={{ fontWeight: 600, color: 'primary.dark' }}>Type:</Box> {workflow?.workflowType || 'N/A'}
              </Typography>
            </Box>
          </Box>
        </Box>
        
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

      <Box 
        className="overview-grid"
        sx={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: isMobile ? 1.5 : 3,
          '& .overview-grid-item': {
            background: '#f5f5f5',
            padding: isMobile ? 1 : 2,
            borderRadius: 2,
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              background: '#f0f0f0',
              transform: 'translateY(-2px)'
            }
          }
        }}
      >
        <Box className="overview-grid-item" sx={{ gridColumn: isMobile ? 'span 2' : 'auto' }}>
          <Typography 
            className="overview-label" 
            variant="subtitle2"
            sx={{ 
              color: 'text.secondary', 
              marginBottom: isMobile ? 0.5 : 1,
              fontSize: isMobile ? '0.7rem' : '0.875rem'
            }}
          >
            Start Time
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              fontWeight: 500,
              fontSize: isMobile ? '0.8rem' : '1rem'
            }}
          >
            {workflow?.startTime ? new Date(workflow.startTime).toLocaleString() : 'N/A'}
          </Typography>
        </Box>

        <Box className="overview-grid-item">
          <Typography 
            className="overview-label" 
            variant="subtitle2"
            sx={{ 
              color: 'text.secondary', 
              marginBottom: isMobile ? 0.5 : 1,
              fontSize: isMobile ? '0.7rem' : '0.875rem'
            }}
          >
            Duration
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              fontWeight: 500,
              fontSize: isMobile ? '0.8rem' : '1rem'
            }}
          >
            {calculateDuration(workflow?.startTime, workflow?.closeTime)}
          </Typography>
        </Box>

        <Box className="overview-grid-item">
          <Typography 
            className="overview-label" 
            variant="subtitle2"
            sx={{ 
              color: 'text.secondary', 
              marginBottom: isMobile ? 0.5 : 1,
              fontSize: isMobile ? '0.7rem' : '0.875rem'
            }}
          >
            End Time
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              fontWeight: 500,
              fontSize: isMobile ? '0.8rem' : '1rem'
            }}
          >
            {workflow?.closeTime ? new Date(workflow.closeTime).toLocaleString() : 'In Progress'}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default WorkflowOverview; 