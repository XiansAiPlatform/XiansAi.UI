import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  Alert,
  useMediaQuery,
  IconButton,
  Tooltip
} from '@mui/material';
import { formatDistanceToNow, format } from 'date-fns';
import RefreshIcon from '@mui/icons-material/Refresh';
import ScheduleIcon from '@mui/icons-material/Schedule';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ScheduleFilters from './ScheduleFilters';
import UpcomingRuns from './UpcomingRuns';
import { useScheduleApi } from '../../services';
import { useNotification } from '../../contexts/NotificationContext';
import { useLoading } from '../../contexts/LoadingContext';
import { useSlider } from '../../contexts/SliderContext';
import { handleApiError } from '../../utils/errorHandler';
import PageLayout from '../Common/PageLayout';
import EmptyState from '../Common/EmptyState';

const ScheduleList = () => {
  const [schedules, setSchedules] = useState([]);
  const [error, setError] = useState(null);
  const isMobile = useMediaQuery('(max-width:768px)');

  const { setLoading, isLoading } = useLoading();
  const { showError, showSuccess } = useNotification();
  const { openSlider, closeSlider } = useSlider();
  const api = useScheduleApi();

  const [filters, setFilters] = useState({
    agentName: '',
    workflowType: '',
    status: '',
    searchTerm: ''
  });

  useEffect(() => {
    loadSchedules();
  }, [filters]); // React to filter changes

  const loadSchedules = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Pass filters directly to API - server handles filtering
      const data = await api.getSchedules(filters);
      setSchedules(data);
      
      if (data.length === 0) {
        const hasFilters = Object.values(filters).some(value => value !== '');
        if (hasFilters) {
          showSuccess('No schedules match your current filters.');
        } else {
          showSuccess('No schedules found. Schedules will appear here when agents create them.');
        }
      }
    } catch (error) {
      console.error('Failed to load schedules:', error);
      const errorMessage = handleApiError(error, 'loading schedules');
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleScheduleClick = (schedule) => {
    openSlider(
      <UpcomingRuns 
        schedule={schedule} 
        onClose={closeSlider}
      />,
      `Schedule: ${schedule.id}`
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'success';
      case 'Paused': return 'warning';
      case 'Failed': return 'error';
      case 'Completed': return 'info';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Active': return <PlayArrowIcon fontSize="small" />;
      case 'Paused': return <PauseIcon fontSize="small" />;
      case 'Failed': return <ErrorIcon fontSize="small" />;
      case 'Completed': return <CheckCircleIcon fontSize="small" />;
      default: return <ScheduleIcon fontSize="small" />;
    }
  };

  const formatScheduleSpec = (spec) => {
    // Simple formatting for cron expressions and intervals
    if (!spec) return 'Unknown';
    
    // Common cron patterns
    if (spec.includes('* * * * *')) return 'Every minute';
    if (spec.includes('0 * * * *')) return 'Every hour';
    if (spec.includes('0 0 * * *')) return 'Daily';
    if (spec.includes('0 0 * * 0')) return 'Weekly';
    if (spec.includes('0 0 1 * *')) return 'Monthly';
    
    // Return the original spec if no pattern matches
    return spec;
  };

  const formatTimeAgo = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return 'Unknown';
    }
  };

  const formatDateTime = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    } catch (error) {
      return 'Unknown';
    }
  };

  if (error && schedules.length === 0) {
    return (
      <PageLayout 
        title="Schedules"
        description="Manage and monitor your workflow schedules"
      >
        <Box sx={{ p: 3 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Button 
            variant="contained" 
            onClick={loadSchedules}
            startIcon={<RefreshIcon />}
            disabled={isLoading}
          >
            Retry
          </Button>
        </Box>
      </PageLayout>
    );
  }

  return (
    <PageLayout 
      title="Schedules"
      description="Manage and monitor your workflow schedules"
      action={
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={loadSchedules}
          disabled={isLoading}
          size="small"
        >
          Refresh
        </Button>
      }
    >
      <Box sx={{ p: 3 }}>
        <ScheduleFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onRefresh={loadSchedules}
          isLoading={isLoading}
        />

        {error && schedules.length > 0 && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box>
            {schedules.length === 0 ? (
              <EmptyState
                icon={<ScheduleIcon sx={{ fontSize: 64, color: 'text.secondary' }} />}
                title="No schedules found"
                description={
                  Object.values(filters).some(v => v) 
                    ? "Try adjusting your filters to see more schedules."
                    : "Schedules will appear here when agents create scheduled workflows."
                }
                action={
                  Object.values(filters).some(v => v) && (
                    <Button 
                      variant="outlined" 
                      onClick={() => setFilters({ agentName: '', workflowType: '', status: '', searchTerm: '' })}
                    >
                      Clear Filters
                    </Button>
                  )
                }
              />
            ) : (
              <Grid container spacing={2}>
                {schedules.map((schedule) => (
                  <Grid item xs={12} sm={6} lg={4} key={schedule.id}>
                    <Card
                      sx={{
                        cursor: 'pointer',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': { 
                          elevation: 4,
                          transform: 'translateY(-2px)'
                        },
                        border: 1,
                        borderColor: 'divider',
                        position: 'relative'
                      }}
                      onClick={() => handleScheduleClick(schedule)}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Typography variant="h6" noWrap sx={{ fontWeight: 600 }}>
                            {schedule.id}
                          </Typography>
                          <Tooltip title={`Status: ${schedule.status}`}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              {getStatusIcon(schedule.status)}
                            </Box>
                          </Tooltip>
                        </Box>
                        
                        <Box sx={{ mb: 2 }}>
                          <Chip
                            label={schedule.status}
                            color={getStatusColor(schedule.status)}
                            size="small"
                            sx={{ mr: 1, mb: 1 }}
                            icon={getStatusIcon(schedule.status)}
                          />
                          <Chip
                            label={schedule.agentName}
                            variant="outlined"
                            size="small"
                            sx={{ mb: 1 }}
                          />
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          <strong>Workflow:</strong> {schedule.workflowType}
                        </Typography>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          <strong>Schedule:</strong> {formatScheduleSpec(schedule.scheduleSpec)}
                        </Typography>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          <strong>Next run:</strong> {formatTimeAgo(schedule.nextRunTime)}
                        </Typography>
                        
                        {schedule.description && (
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            <strong>Description:</strong> {schedule.description}
                          </Typography>
                        )}
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                          <Typography variant="caption" color="text.secondary">
                            Executions: {schedule.executionCount}
                          </Typography>
                          
                          {schedule.lastRunTime && (
                            <Typography variant="caption" color="text.secondary">
                              Last run: {formatTimeAgo(schedule.lastRunTime)}
                            </Typography>
                          )}
                        </Box>
                        
                        <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
                          Created: {formatDateTime(schedule.createdAt)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
        </Box>
      </Box>
    </PageLayout>
  );
};

export default ScheduleList;