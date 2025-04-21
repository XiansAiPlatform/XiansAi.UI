import React, { useState, useMemo, useCallback, useEffect } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  Stop as TerminateIcon,
  MoreVert as MoreVertIcon,
  ContentCopy as CopyIcon,
  Description as LogsIcon,
  Close as CloseIcon,
  ErrorOutline as ErrorOutlineIcon
} from '@mui/icons-material';
import StatusChip from '../../Common/StatusChip';
import { useNotification } from '../../../contexts/NotificationContext';
import { useWorkflowApi } from '../../../services/workflow-api';
import useInterval from '../../../utils/useInterval';
import './WorkflowDetails.css';
import { useAuth0 } from '@auth0/auth0-react';


const WorkflowOverview = ({ workflowId, runId, onActionComplete, isMobile }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [workflow, setWorkflow] = useState(null);
  const [workflowLogs, setWorkflowLogs] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [skip, setSkip] = useState(0);
  const limit = 4;
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [logsModalOpen, setLogsModalOpen] = useState(false);
  const open = Boolean(anchorEl);
  const { showSuccess, showError } = useNotification();
  const api = useWorkflowApi();
  const { user } = useAuth0();
  const [selectedLogLevel, setSelectedLogLevel] = useState('');
  const [filteredLogs, setFilteredLogs] = useState([]);

  // Microsoft Log Levels
  const LOG_LEVELS = [
    { value: '', label: 'All Levels' },
    { value: 0, label: 'Trace' },
    { value: 1, label: 'Debug' },
    { value: 2, label: 'Information' },
    { value: 3, label: 'Warning' },
    { value: 4, label: 'Error' },
    { value: 5, label: 'Critical' },
    { value: 6, label: 'None' }
  ];

  // Helper function to convert UI value to API value
  const getApiLogLevel = useCallback((level) => level === '' ? null : level, []);

  // Update filtered logs when logs or level change
  useEffect(() => {
    if (selectedLogLevel === '') {
      setFilteredLogs(workflowLogs);
    } else {
      setFilteredLogs(workflowLogs.filter(log => log.level === selectedLogLevel));
    }
  }, [workflowLogs, selectedLogLevel]);

  // Reset skip and fetch logs when log level changes
  useEffect(() => {
    const fetchLogsWithNewLevel = async () => {
      try {
        setIsLoading(true);
        setSkip(0);
        setHasMore(true);
        const logs = await api.fetchWorkflowRunLogs(runId, 0, limit, getApiLogLevel(selectedLogLevel));
        setWorkflowLogs(logs);
        setSkip(logs.length);
        if (logs.length < limit) setHasMore(false);
      } catch (error) {
        console.error('Failed to fetch logs with new level:', error);
        showError('Failed to fetch workflow logs');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogsWithNewLevel();
  }, [selectedLogLevel, runId, api, showError, getApiLogLevel]);

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

  const fetchLatestLogs = useCallback(async () => {
    if (isLoading) return;
    const currentWorkflow = workflow;
    if (!currentWorkflow || getStatusString(currentWorkflow?.status).toUpperCase() !== 'RUNNING') return;
    
    try {
      // Always fetch latest logs from the beginning
      const newLogs = await api.fetchWorkflowRunLogs(runId, 0, limit, getApiLogLevel(selectedLogLevel));
      if (newLogs?.length) {
        // Only add logs that aren't already in the list
        setWorkflowLogs((prev) => {
          const existingIds = new Set(prev.map(log => log.id));
          const uniqueNewLogs = newLogs.filter(log => !existingIds.has(log.id));
          // If we got new logs, increase skip by the number of new logs
          if (uniqueNewLogs.length > 0) {
            setSkip(prevSkip => prevSkip + uniqueNewLogs.length);
          }
          return [...uniqueNewLogs, ...prev];
        });
      }
    } catch (error) {
      console.error('Failed to fetch logs on interval:', error);
    }
  }, [runId, api, limit, isLoading, workflow, selectedLogLevel, getApiLogLevel]);

  const fetchInitialLogs = useCallback(async () => {
    try {
      setIsLoading(true);
      const logs = await api.fetchWorkflowRunLogs(runId, 0, limit, getApiLogLevel(selectedLogLevel));
      setWorkflowLogs(logs);
      setSkip(logs.length);
      if (logs.length < limit) setHasMore(false);
    } catch (error) {
      console.error('Failed to fetch initial logs:', error);
      showError('Failed to fetch workflow logs');
    } finally {
      setIsLoading(false);
    }
  }, [runId, api, limit, selectedLogLevel, showError, getApiLogLevel]);

  // Initial fetch
  useEffect(() => {
    fetchWorkflow();
    fetchInitialLogs();
  }, [fetchWorkflow, fetchInitialLogs]);

  const isRunning = workflow && getStatusString(workflow?.status).toUpperCase() === 'RUNNING';
 
  useInterval(
    () => {
      fetchWorkflow();
      fetchLatestLogs();
    },
    isRunning ? 30000 : null
  );

  // Update the refresh useEffect when an action is completed
  useEffect(() => {
    if (onActionComplete) {
      fetchWorkflow();
      fetchLatestLogs();
    }
  }, [onActionComplete, fetchWorkflow, fetchLatestLogs]);

  // Append logs manually (e.g. "Load more" button)
  const loadMoreLogs = async () => {
    if (isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const newLogs = await api.fetchWorkflowRunLogs(runId, skip, limit, getApiLogLevel(selectedLogLevel));
      if (newLogs.length < limit) setHasMore(false);
      setWorkflowLogs((prev) => [...prev, ...newLogs]);
      setSkip(skip + newLogs.length);
    } catch (error) {
      console.error('Failed to load more logs:', error);
      showError('Failed to load more logs');
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleAction = async (action, force = false) => {
    try {
      await api.executeWorkflowCancelAction(workflow.workflowId, force);
      showSuccess('Termination requested. It may take a few minutes to complete.');

      // Wait a moment before fetching updated data
      setTimeout(() => {
        fetchWorkflow();
        fetchLatestLogs();
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
    return workflow?.owner === user?.sub;
  }, [workflow?.owner, user?.sub]);

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

  const handleLogsClick = () => {
    setLogsModalOpen(true);
  };

  const handleLogsClose = () => {
    setLogsModalOpen(false);
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
            disabled={!isRunning || isLoading}
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
      <Box className="overview-current-activity">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Box>
            <Typography
              className="overview-label"
              variant="subtitle2"
              sx={{
                color: 'text.secondary',
                fontSize: isMobile ? '0.7rem' : '0.875rem'
              }}
            >
              Current activity:
            </Typography>

            <Typography
              color='black'
              variant="body1"
              sx={{
                fontWeight: 500,
                fontSize: isMobile ? '0.8rem' : '1rem'
              }}
            >
              {workflow?.currentActivity?.activityType.name || 'No Pending Activities'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {workflowLogs[0]?.level === 4 && (
              <ErrorOutlineIcon 
                sx={{ 
                  color: '#d32f2f',
                  fontSize: isMobile ? '16px' : '20px'
                }} 
                titleAccess="Error occurred"
              />
            )}
            <Button
              variant="outlined"
              size="small"
              startIcon={<LogsIcon />}
              onClick={handleLogsClick}
              sx={{
                textTransform: 'none',
                borderRadius: 2,
                padding: '4px 12px'
              }}
            >
              Show Logs
            </Button>
          </Box>
        </Box>

      </Box>

      {/* Logs Modal */}
      <Dialog
        open={logsModalOpen}
        onClose={handleLogsClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxHeight: '80vh'
          }
        }}
      >
        <DialogTitle sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
          pb: 2
        }}>
          Workflow Logs
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Log Level</InputLabel>
              <Select
                value={selectedLogLevel}
                label="Log Level"
                onChange={(e) => setSelectedLogLevel(e.target.value)}
              >
                {LOG_LEVELS.map((level) => (
                  <MenuItem key={level.value} value={level.value}>
                    {level.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <IconButton
              aria-label="close"
              onClick={handleLogsClose}
              sx={{ color: 'text.secondary' }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent
          sx={{
            p: 3,
            overflow: 'hidden',
            '& pre': {
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              backgroundColor: 'rgba(0, 0, 0, 0.02)',
              padding: 2,
              borderRadius: 1,
              maxHeight: '60vh',
              overflow: 'auto',
              fontFamily: 'monospace',
              fontSize: '0.875rem',
              margin: 0
            }
          }}
        >
          {isLoading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress size={24} />
            </Box>
          ) : filteredLogs.length > 0 ? (
            <>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: 2,
                maxHeight: '60vh',
                overflow: 'auto',
                mt: 2,
                '& .log-entry': {
                  p: 2,
                  borderRadius: 1,
                  backgroundColor: 'rgba(0, 0, 0, 0.02)',
                  '&.error': {
                    backgroundColor: 'rgba(211, 47, 47, 0.08)',
                    borderLeft: '4px solid #d32f2f'
                  },
                  '&.warning': {
                    backgroundColor: 'rgba(255, 152, 0, 0.08)',
                    borderLeft: '4px solid #ff9800'
                  },
                  '&.info': {
                    backgroundColor: 'rgba(33, 150, 243, 0.08)',
                    borderLeft: '4px solid #2196f3'
                  }
                },
                '& .log-header': {
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 1,
                  '& .log-level': {
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    fontSize: '0.75rem',
                    padding: '2px 8px',
                    borderRadius: 1
                  },
                  '& .log-time': {
                    color: 'text.secondary',
                    fontSize: '0.75rem'
                  }
                },
                '& .log-message': {
                  fontFamily: 'monospace',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  fontSize: '0.875rem',
                  mb: 1
                },
                '& .log-exception': {
                  fontFamily: 'monospace',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  fontSize: '0.75rem',
                  color: '#d32f2f',
                  backgroundColor: 'rgba(211, 47, 47, 0.08)',
                  p: 1,
                  borderRadius: 1,
                  mt: 1
                }
              }}>
                {filteredLogs.map((log, index) => {
                  const getLogLevelClass = (level) => {
                    switch (level) {
                      case 4: return 'error';
                      case 3: return 'warning';
                      case 2: return 'info';
                      default: return '';
                    }
                  };

                  const getLogLevelLabel = (level) => {
                    switch (level) {
                      case 0: return 'TRACE';
                      case 1: return 'DEBUG';
                      case 2: return 'INFO';
                      case 3: return 'WARNING';
                      case 4: return 'ERROR';
                      case 5: return 'CRITICAL';
                      case 6: return 'NONE';
                      default: return 'UNKNOWN';
                    }
                  };

                  const getLogLevelColor = (level) => {
                    switch (level) {
                      case 4: return '#d32f2f';
                      case 3: return '#ff9800';
                      case 2: return '#2196f3';
                      default: return '#757575';
                    }
                  };

                  return (
                    <Box key={log.id || index} className={`log-entry ${getLogLevelClass(log.level)}`}>
                      <Box className="log-header">
                        <Box 
                          className="log-level"
                          sx={{ 
                            backgroundColor: `${getLogLevelColor(log.level)}20`,
                            color: getLogLevelColor(log.level)
                          }}
                        >
                          {getLogLevelLabel(log.level)}
                        </Box>
                        <Box className="log-time">
                          {new Date(log.createdAt).toLocaleString()}
                        </Box>
                      </Box>
                      <Box className="log-message">
                        {log.message}
                      </Box>
                      {log.exception && (
                        <Box className="log-exception">
                          {log.exception}
                        </Box>
                      )}
                    </Box>
                  );
                })}
              </Box>
              {hasMore && (
                <Box 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'center',
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: 'background.paper',
                    py: 2,
                    borderTop: '1px solid',
                    borderColor: 'divider'
                  }}
                >
                  <Button 
                    onClick={loadMoreLogs} 
                    disabled={isLoadingMore}
                    startIcon={isLoadingMore ? <CircularProgress size={16} /> : null}
                    variant="outlined"
                  >
                    {isLoadingMore ? 'Loading...' : 'Show More'}
                  </Button>
                </Box>
              )}
            </>
          ) : (
            <Typography variant="body1" color="text.secondary" textAlign="center" mt={3}>
              No logs available
            </Typography>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2, borderTop: '1px solid rgba(0, 0, 0, 0.12)' }}>
          <Button onClick={handleLogsClose} variant="outlined">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default WorkflowOverview;