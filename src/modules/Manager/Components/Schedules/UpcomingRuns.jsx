import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Divider,
  Alert,
  CircularProgress,
  Tooltip
} from '@mui/material';
import { format, formatDistanceToNow } from 'date-fns';
import ScheduleIcon from '@mui/icons-material/Schedule';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useScheduleApi } from '../../services';
import { useNotification } from '../../contexts/NotificationContext';
import { handleApiError } from '../../utils/errorHandler';

const UpcomingRuns = ({ schedule, onClose }) => {
  const [upcomingRuns, setUpcomingRuns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { showError } = useNotification();
  const api = useScheduleApi();

  const loadUpcomingRuns = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const runs = await api.getUpcomingRuns(schedule.id, 10);
      setUpcomingRuns(runs);
    } catch (error) {
      console.error('Failed to load upcoming runs:', error);
      const errorMessage = handleApiError(error, 'loading upcoming runs');
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [schedule.id, api, showError]);

  useEffect(() => {
    if (schedule) {
      loadUpcomingRuns();
    }
  }, [schedule, loadUpcomingRuns]);

  const getRunStatusColor = (status) => {
    switch (status) {
      case 'Scheduled': return 'info';
      case 'Running': return 'warning';
      case 'Completed': return 'success';
      case 'Failed': return 'error';
      default: return 'default';
    }
  };

  const getRunStatusIcon = (status) => {
    switch (status) {
      case 'Scheduled': return <AccessTimeIcon fontSize="small" />;
      case 'Running': return <PlayArrowIcon fontSize="small" />;
      case 'Completed': return <CheckCircleIcon fontSize="small" />;
      case 'Failed': return <ErrorIcon fontSize="small" />;
      default: return <ScheduleIcon fontSize="small" />;
    }
  };

  const formatTimeForDisplay = (dateString) => {
    try {
      const date = new Date(dateString);
      return {
        formatted: format(date, 'MMM dd, HH:mm'),
        relative: formatDistanceToNow(date, { addSuffix: true }),
        full: format(date, 'PPP p')
      };
    } catch (error) {
      return {
        formatted: 'Invalid date',
        relative: 'Unknown',
        full: 'Invalid date'
      };
    }
  };

  const getStatusChipProps = (status) => {
    const props = {
      size: 'small',
      icon: getRunStatusIcon(status)
    };
    
    switch (status) {
      case 'Active': return { ...props, color: 'success', variant: 'filled' };
      case 'Paused': return { ...props, color: 'warning', variant: 'filled' };
      case 'Failed': return { ...props, color: 'error', variant: 'filled' };
      case 'Completed': return { ...props, color: 'info', variant: 'filled' };
      default: return { ...props, color: 'default', variant: 'outlined' };
    }
  };

  return (
    <Box sx={{ 
      height: '100%',
      display: 'flex', 
      flexDirection: 'column' 
    }}>
      {/* Schedule Information */}
      <Box sx={{ mb: 3, flexShrink: 0 }}>
        <Typography variant="h6" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ScheduleIcon />
          Schedule Information
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Schedule ID
            </Typography>
            <Typography variant="body1" sx={{ fontFamily: 'monospace', wordBreak: 'break-word', fontWeight: 500 }}>
              {schedule.id}
            </Typography>
          </Box>
          
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Status
            </Typography>
            <Chip 
              label={schedule.status} 
              {...getStatusChipProps(schedule.status)}
              sx={{ mt: 0.5 }}
            />
          </Box>
          
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Agent
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {schedule.agentName}
            </Typography>
          </Box>
          
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Workflow Type
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {schedule.workflowType}
            </Typography>
          </Box>
          
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Schedule Specification
            </Typography>
            <Typography variant="body1" sx={{ fontFamily: 'monospace', fontSize: '0.875rem', wordBreak: 'break-word', bgcolor: 'grey.50', p: 1, borderRadius: 1 }}>
              {schedule.scheduleSpec}
            </Typography>
          </Box>
          
          {schedule.description && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary"> 
                Description
              </Typography>
              <Typography variant="body1">
                {schedule.description}
              </Typography>
            </Box>
          )}
          
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 1 }}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Total Executions
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                {schedule.executionCount.toLocaleString()}
              </Typography>
            </Box>
            
            {schedule.lastRunTime && (
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Last Run
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {formatTimeForDisplay(schedule.lastRunTime).relative}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
      
      <Divider sx={{ my: 2, flexShrink: 0 }} />
      
      {/* Upcoming Runs Section */}
      <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
          <AccessTimeIcon />
          Upcoming Runs
        </Typography>
        
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress size={32} />
          </Box>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mb: 2, flexShrink: 0 }}>
            <Typography variant="body2">{error}</Typography>
          </Alert>
        )}
        
        {!loading && !error && (
          <>
            {upcomingRuns.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                <InfoOutlinedIcon color="disabled" sx={{ fontSize: 64, mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No upcoming runs scheduled
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  This schedule may be paused or completed
                </Typography>
              </Box>
            ) : (
              <List sx={{ flex: 1, overflow: 'auto', bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                {upcomingRuns.map((run, index) => {
                  const timeData = formatTimeForDisplay(run.scheduledTime);
                  return (
                    <ListItem 
                      key={run.runId} 
                      divider={index < upcomingRuns.length - 1}
                      sx={{ py: 2 }}
                    >
                      <ListItemIcon sx={{ minWidth: 48 }}>
                        <Chip
                          icon={getRunStatusIcon(run.status)}
                          color={getRunStatusColor(run.status)}
                          size="small"
                          sx={{ 
                            height: 24,
                            '& .MuiChip-label': { px: 1 },
                            '& .MuiChip-icon': { fontSize: 16 }
                          }}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Tooltip title={timeData.full} arrow>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {timeData.formatted}
                            </Typography>
                          </Tooltip>
                        }
                        secondary={
                          <Typography variant="body2" color="text.secondary">
                            {timeData.relative}
                          </Typography>
                        }
                      />
                    </ListItem>
                  );
                })}
              </List>
            )}
          </>
        )}
      </Box>
    </Box>
  );
};

export default UpcomingRuns;