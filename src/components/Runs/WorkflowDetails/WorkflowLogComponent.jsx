import React, { useState, useCallback, useEffect } from 'react';
import {
  Typography,
  Box,
  Button,
  MenuItem,
  IconButton,
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
  Description as LogsIcon,
  Close as CloseIcon,
  ErrorOutline as ErrorOutlineIcon
} from '@mui/icons-material';
import { useNotification } from '../../../contexts/NotificationContext';
import { useWorkflowApi } from '../../../services/workflow-api';
import useInterval from '../../../utils/useInterval';
import './WorkflowDetails.css';


const WorkflowLogComponent = ({ workflow, runId, onActionComplete, isMobile }) => {
  const [workflowLogs, setWorkflowLogs] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [skip, setSkip] = useState(0);
  const limit = 4;
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [logsModalOpen, setLogsModalOpen] = useState(false);
  const { showError } = useNotification();
  const api = useWorkflowApi();
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

  // Helper function to detect errors in log messages
  const hasErrorInLogs = useCallback(() => {
    if (!workflowLogs.length) return false;
    
    // Check by log level
    if (workflowLogs[0]?.level === 4) return true;
    
    // Check last log message for error information in JSON format
    const lastLog = workflowLogs[0]; // First log is the latest
    if (lastLog?.message) {
      return lastLog.message.includes('"failed":') && 
             lastLog.message.includes('"failure":') && 
             lastLog.message.includes('"message":');
    }
    
    return false;
  }, [workflowLogs]);

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
      if (!runId || !workflow) return;
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
  }, [selectedLogLevel, runId, workflow, api, showError, getApiLogLevel]);

  // Add a helper function to safely convert status to string (moved this up to avoid initialization error)
  const getStatusString = (status) => {
    if (status === null || status === undefined) return '';
    return String(status);
  };

  const fetchLatestLogs = useCallback(async () => {
    if (isLoading || !runId || !workflow) return;
    const currentWorkflow = workflow;
    if (!currentWorkflow || getStatusString(currentWorkflow?.status).toUpperCase() !== 'RUNNING') return;
    
    try {
      // Always fetch latest logs from the beginning
      const newLogs = await api.fetchWorkflowRunLogs(runId, 0, limit, getApiLogLevel(selectedLogLevel));
      if (newLogs?.length) {
        setWorkflowLogs((prev) => {
          const updatedLogs = [...newLogs, ...prev];
          // Update skip to match the total count
          setSkip(updatedLogs.length);
          
          return updatedLogs;
        });
      }
    } catch (error) {
      console.error('Failed to fetch logs on interval:', error);
    }
  }, [runId, api, limit, isLoading, workflow, selectedLogLevel, getApiLogLevel]);

  const fetchInitialLogs = useCallback(async () => {
    if (!runId || !workflow) return;
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
  }, [runId, api, limit, selectedLogLevel, showError, getApiLogLevel, workflow]);

  // Initial fetch: wait for runId and workflow before fetching logs
  useEffect(() => {
    if (runId && workflow) {
      fetchInitialLogs();
    }
  }, [runId, workflow, fetchInitialLogs]);

  const isRunning = workflow && getStatusString(workflow?.status).toUpperCase() === 'RUNNING';
 
  useInterval(
    () => {
      fetchLatestLogs();
    },
    isRunning ? 30000 : null
  );

  // Update the refresh useEffect when an action is completed
  useEffect(() => {
    if (onActionComplete) {
   fetchLatestLogs();
    }
  }, [onActionComplete, fetchLatestLogs]);

  const loadMoreLogs = async () => {
    if (isLoadingMore || !runId || !workflow) return;
    setIsLoadingMore(true);
    try {
      const newLogs = await api.fetchWorkflowRunLogs(runId, skip, limit, getApiLogLevel(selectedLogLevel));
      if (newLogs.length < limit) setHasMore(false);
      
      setWorkflowLogs((prev) => {
        const updatedLogs = [...prev, ...newLogs];
        return updatedLogs;
      });
      setSkip(skip + newLogs.length);
    } catch (error) {
      console.error('Failed to load more logs:', error);
      showError('Failed to load more logs');
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleLogsClick = () => {
    setLogsModalOpen(true);
  };

  const handleLogsClose = () => {
    setLogsModalOpen(false);
  };

  return (
    <>
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
            {hasErrorInLogs() && (
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
                      case 5: return '#9c27b0'; // Critical - purple
                      case 4: return '#d32f2f'; // Error - red
                      case 3: return '#ff9800'; // Warning - orange
                      case 2: return '#2196f3'; // Info - blue
                      case 1: return '#00bcd4'; // Debug - cyan
                      case 0: return '#8bc34a'; // Trace - light green
                      default: return '#757575'; // None/Unknown - grey
                    }
                  };

                  // Check if this log contains error information in the message
                  const hasErrorMessage = log.message && 
                    log.message.includes('"failed":') && 
                    log.message.includes('"failure":') && 
                    log.message.includes('"message":');

                  const logLevelClass = hasErrorMessage ? 'error' : getLogLevelClass(log.level);

                  return (
                    <Box key={log.id || index} className={`log-entry ${logLevelClass}`}>
                      <Box className="log-header">
                        <Box 
                          className="log-level"
                          sx={{ 
                            backgroundColor: `${getLogLevelColor(log.level)}20`,
                            color: getLogLevelColor(log.level)
                          }}
                        >
                          {hasErrorMessage ? 'FAILED' : getLogLevelLabel(log.level)}
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
    </>
  );
};

export default WorkflowLogComponent;