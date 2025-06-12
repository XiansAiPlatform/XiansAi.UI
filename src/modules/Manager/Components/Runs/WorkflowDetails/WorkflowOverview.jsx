import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Typography,
  Box,
  Paper,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Stop as TerminateIcon,
  MoreVert as MoreVertIcon,
  ContentCopy as CopyIcon,

} from '@mui/icons-material';
import StatusChip from '../../Common/StatusChip';
import { useNotification } from '../../../contexts/NotificationContext';
import { useWorkflowApi } from '../../../services/workflow-api';
import useInterval from '../../../utils/useInterval';
import './WorkflowDetails.css';
import { useAuth } from '../../../auth/AuthContext';
import WorkflowLogComponent from './WorkflowLogComponent';


const WorkflowOverview = ({ workflowId, runId, onActionComplete, isMobile }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [workflow, setWorkflow] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const open = Boolean(anchorEl);
  const { showSuccess, showError } = useNotification();
  const api = useWorkflowApi();
  const { user } = useAuth();


  // Add a helper function to safely convert status to string (moved this up to avoid initialization error)
  const getStatusString = (status) => {
    if (status === null || status === undefined) return '';
    return String(status);
  };

  const fetchWorkflow = useCallback(async () => {
    if (!workflowId) return;
    try {
      const workflowData = await api.getWorkflow(workflowId, runId);
      if (workflowData) {
        setWorkflow(workflowData);
      }
    } catch (error) {
      console.error('Failed to fetch workflow details:', error);
      showError('Failed to fetch workflow details');
    }
  }, [workflowId, runId, api, showError]);

  // Initial fetch
  useEffect(() => {
    fetchWorkflow();
  }, [fetchWorkflow]);

  const isRunning = workflow && getStatusString(workflow?.status).toUpperCase() === 'RUNNING';
 
  useInterval(
    () => {
      fetchWorkflow();
    },
    isRunning ? 30000 : null
  );

  // Update the refresh useEffect when an action is completed
  useEffect(() => {
    if (onActionComplete) {
      fetchWorkflow();
    }
  }, [onActionComplete, fetchWorkflow]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleAction = async (action, force = false) => {
    try {
      await api.executeWorkflowCancelAction(workflow.workflowId, force);
      showSuccess('Termination requested. It may take sometime to complete.');

      // Wait a moment before fetching updated data
      setTimeout(() => {
        fetchWorkflow();
      }, 2000);
    } catch (error) {
      showError('An unexpected error occurred. Please check if the workflow is still running. Error: ' + error.message);
      console.error(`Error executing ${action}:`, error);
    } finally {
      handleClose();
    }
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
    return workflow?.owner === user?.id;
  }, [workflow?.owner, user?.id]);

  // Get a display value that shows N/A only if workflow is null
  const getDisplayValue = (value) => {
    if (!workflow) return 'Loading...';
    return value !== undefined && value !== null ? value : 'N/A';
  };

  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopySuccess(true);
        showSuccess('Copied to clipboard');
        setTimeout(() => setCopySuccess(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
        showError('Failed to copy to clipboard');
      });
  };

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
            {getDisplayValue(workflow?.workflowType)?.replace(/([A-Z])/g, ' $1').trim()}
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
            disabled={!isRunning }
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
                label={getDisplayValue(workflow?.status)}
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
                  wordBreak: 'break-word',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5
                }}
              >
                <Box component="span" sx={{ fontWeight: 600, color: 'primary.dark' }}>Workflow Id:</Box>
                {getDisplayValue(workflow?.workflowId)}
                <Tooltip title="Copy to clipboard">
                  <IconButton
                    size="small"
                    onClick={() => handleCopyToClipboard(workflow?.workflowId)}
                    color={copySuccess ? "success" : "default"}
                    sx={{ ml: 0.5, p: 0.5 }}
                  >
                    <CopyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Typography>
              <Typography
                sx={{
                  color: 'text.secondary',
                  fontSize: 'inherit',
                  wordBreak: 'break-word',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5
                }}
              >
                <Box component="span" sx={{ fontWeight: 600, color: 'primary.dark' }}>Run Id:</Box> {getDisplayValue(workflow?.runId)}
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
                <Box component="span" sx={{ fontWeight: 600, color: 'primary.dark' }}>Owner:</Box> {getDisplayValue(workflow?.owner)}
                {isOwner && workflow && (
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
                <Box component="span" sx={{ fontWeight: 600, color: 'primary.dark' }}>Type:</Box> {getDisplayValue(workflow?.workflowType)}
              </Typography>
              <Typography
                sx={{
                  color: 'text.secondary',
                  fontSize: 'inherit',
                  wordBreak: 'break-word'
                }}
              >
                <Box component="span" sx={{ fontWeight: 600, color: 'primary.dark' }}>Workers: </Box> {getDisplayValue(workflow?.numOfWorkers)}
              </Typography>
               <Typography
                sx={{
                  color: 'text.secondary',
                  fontSize: 'inherit',
                  wordBreak: 'break-word'
                }}
              >
                <Box component="span" sx={{ fontWeight: 600, color: 'primary.dark' }}>Queue: </Box> {getDisplayValue(workflow?.taskQueue)}
              </Typography>
              {workflow?.parentId && (
                <Typography
                  sx={{
                    color: 'text.secondary',
                    fontSize: 'inherit',
                    wordBreak: 'break-word'
                  }}
                >
                  <Box component="span" sx={{ fontWeight: 600, color: 'primary.dark' }}>Parent Flow:</Box> {workflow.parentId}
                </Typography>
              )}
              {workflow?.parentRunId && (
                <Typography
                  sx={{
                    color: 'text.secondary',
                    fontSize: 'inherit',
                    wordBreak: 'break-word'
                  }}
                >
                  <Box component="span" sx={{ fontWeight: 600, color: 'primary.dark' }}>Parent Run:</Box> {workflow.parentRunId}
                </Typography>
              )}
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
            {workflow?.startTime ? new Date(workflow.startTime).toLocaleString() : (workflow ? 'N/A' : 'Loading...')}
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
            {workflow ? calculateDuration(workflow?.startTime, workflow?.closeTime) : 'Loading...'}
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
            {workflow?.closeTime ? new Date(workflow.closeTime).toLocaleString() : (workflow ? 'In Progress' : 'Loading...')}
          </Typography>
        </Box>
      </Box>
      <WorkflowLogComponent workflow={workflow} runId={workflow?.runId} onActionComplete={onActionComplete} isMobile={isMobile}/>
    </Paper>
  );
};

export default WorkflowOverview;