import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  Alert,
  CircularProgress,
  Tooltip,
  Tabs,
  Tab,
  Card,
  CardContent,
  Grid,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns';
import ScheduleIcon from '@mui/icons-material/Schedule';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import HistoryIcon from '@mui/icons-material/History';
import AgentIcon from '@mui/icons-material/SmartToy';
import WorkflowIcon from '@mui/icons-material/AccountTree';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SettingsIcon from '@mui/icons-material/Settings';
import { useScheduleApi } from '../../services';
import { useNotification } from '../../contexts/NotificationContext';
import { handleApiError } from '../../utils/errorHandler';

const ScheduleDetails = ({ schedule, onUpdate }) => {
  const [scheduleDetails, setScheduleDetails] = useState(schedule);
  const [upcomingRuns, setUpcomingRuns] = useState([]);
  const [recentRuns, setRecentRuns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  const { showError } = useNotification();
  const api = useScheduleApi();

  const loadScheduleData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load schedule details, upcoming runs, and history
      const [details, upcoming, history] = await Promise.all([
        // Use getScheduleById instead of getSchedule, with fallback to existing schedule
        api.getScheduleById ? api.getScheduleById(schedule.id).catch(() => schedule) : Promise.resolve(schedule),
        api.getUpcomingRuns(schedule.id, 10),
        api.getScheduleHistory(schedule.id, 20)
      ]);
      
      setScheduleDetails(details);
      setUpcomingRuns(upcoming);
      setRecentRuns(history);
    } catch (error) {
      console.error('Failed to load schedule data:', error);
      const errorMessage = handleApiError(error, 'loading schedule details');
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [schedule, api, showError]);

  useEffect(() => {
    if (schedule) {
      loadScheduleData();
    }
  }, [schedule, loadScheduleData]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
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

  const getStatusChipProps = (status) => {
    const props = {
      size: 'small',
      icon: getStatusIcon(status)
    };
    
    switch (status) {
      case 'Active': return { ...props, color: 'success', variant: 'filled' };
      case 'Paused': return { ...props, color: 'warning', variant: 'filled' };
      case 'Failed': return { ...props, color: 'error', variant: 'filled' };
      case 'Completed': return { ...props, color: 'info', variant: 'filled' };
      default: return { ...props, color: 'default', variant: 'outlined' };
    }
  };

  const formatTimeForDisplay = (dateString) => {
    try {
      if (!dateString) return null;
      const date = parseISO(dateString);
      if (!isValid(date)) {
        // Fallback to regular Date parsing
        const fallbackDate = new Date(dateString);
        if (isNaN(fallbackDate.getTime())) return null;
        return {
          formatted: format(fallbackDate, 'MMM dd, HH:mm'),
          relative: formatDistanceToNow(fallbackDate, { addSuffix: true }),
          full: format(fallbackDate, 'PPP p'),
          date: fallbackDate
        };
      }
      
      return {
        formatted: format(date, 'MMM dd, HH:mm'),
        relative: formatDistanceToNow(date, { addSuffix: true }),
        full: format(date, 'PPP p'),
        date: date
      };
    } catch (error) {
      return null;
    }
  };

  const formatScheduleSpec = (spec) => {
    if (!spec) return 'Unknown';
    
    // Try to parse common patterns and make them more readable
    const cleanSpec = spec.toString().toLowerCase();
    
    // Interval patterns
    if (cleanSpec.includes('every')) {
      return spec; // Already formatted
    }
    
    // Common cron patterns
    const cronPatterns = {
      '* * * * *': 'Every minute',
      '0 * * * *': 'Every hour',
      '0 0 * * *': 'Every day at midnight',
      '0 9 * * *': 'Every day at 9:00 AM',
      '0 0 * * 0': 'Every Sunday at midnight',
      '0 0 1 * *': 'First day of every month',
      '0 0 * * 1-5': 'Every weekday at midnight'
    };
    
    const matchedPattern = Object.entries(cronPatterns).find(([pattern]) => 
      spec.includes(pattern)
    );
    
    if (matchedPattern) {
      return matchedPattern[1];
    }
    
    // If no pattern matches, try to format it nicely
    if (spec.length > 50) {
      return spec.substring(0, 50) + '...';
    }
    
    return spec;
  };

  const renderRunsList = (runs, emptyMessage, emptyIcon) => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
          <CircularProgress size={32} />
        </Box>
      );
    }

    if (runs.length === 0) {
      return (
        <Box sx={{ 
          textAlign: 'center', 
          py: 4, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}>
          {emptyIcon}
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {emptyMessage}
          </Typography>
        </Box>
      );
    }

    return (
      <List sx={{ 
        bgcolor: 'background.paper', 
        border: '1px solid', 
        borderColor: 'divider', 
        borderRadius: 1,
        maxHeight: 400,
        overflow: 'auto'
      }}>
        {runs.map((run, index) => {
          const timeData = formatTimeForDisplay(run.scheduledTime || run.actualRunTime);
          if (!timeData) return null;
          
          return (
            <ListItem 
              key={run.runId} 
              divider={index < runs.length - 1}
              sx={{ py: 2 }}
            >
             
              <ListItemText
                primary={
                  <Tooltip title={timeData.full} arrow>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {timeData.formatted}
                    </Typography>
                  </Tooltip>
                }
                secondary={
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {timeData.relative}
                    </Typography>
                    {run.workflowRunId && (
                      <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                        Run ID: {run.workflowRunId}
                      </Typography>
                    )}
                    {run.duration && (
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                        Duration: {run.duration}
                      </Typography>
                    )}
                  </Box>
                }
              />
            </ListItem>
          );
        })}
      </List>
    );
  };

  return (
    <Box sx={{ 
      height: '100%',
      display: 'flex', 
      flexDirection: 'column',
    }}>

      {/* Header with schedule info and actions */}
      <Box sx={{ mb: 5, flexShrink: 0 }}>
        

        {/* Key schedule information cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent sx={{ p: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <AgentIcon color="primary" fontSize="small" />
                  <Typography variant="subtitle2" color="text.secondary">
                    Agent
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    minWidth: 0
                  }}>
                    {scheduleDetails.agentName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    minWidth: 0
                  }}>
                    ID: {scheduleDetails.agentId || scheduleDetails.id}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent sx={{ p: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <WorkflowIcon color="primary" fontSize="small" />
                  <Typography variant="subtitle2" color="text.secondary">
                    Workflow
                  </Typography>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {scheduleDetails.workflowType}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        {/* Tabs for upcoming runs and history */}
        <Box sx={{ mb: 5 }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
          >
            <Tab 
              label={`Upcoming (${upcomingRuns.length})`}
              icon={<AccessTimeIcon sx={{ color: 'inherit' }} />}
              iconPosition="start"
              sx={{ minHeight: 48 }}
            />
            <Tab 
              label={`Recent (${recentRuns.length})`}
              icon={<HistoryIcon sx={{ color: 'inherit' }} />}
              iconPosition="start"
              sx={{ minHeight: 48 }}
            />
          </Tabs>
          
          <Box sx={{ maxHeight: 300, overflow: 'hidden' }}>
            {activeTab === 0 && renderRunsList(
              upcomingRuns, 
              'No upcoming runs scheduled',
              <AccessTimeIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            )}
            {activeTab === 1 && renderRunsList(
              recentRuns,
              'No execution history available',
              <HistoryIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            )}
          </Box>
        </Box>
        
        {/* Schedule Configuration */}
        <Accordion sx={{ mb: 5 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SettingsIcon fontSize="small" />
              <Typography variant="subtitle1">Schedule Configuration</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Status
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Chip 
                    label={scheduleDetails.status} 
                    {...getStatusChipProps(scheduleDetails.status)}
                  />
                  
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Schedule Pattern
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    fontFamily: 'monospace', 
                    fontSize: '0.875rem', 
                    bgcolor: 'grey.50', 
                    p: 1, 
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'grey.300'
                  }}
                >
                  {formatScheduleSpec(scheduleDetails.scheduleSpec)}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  Raw: {scheduleDetails.scheduleSpec}
                </Typography>
              </Grid>
              
              {scheduleDetails.description && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Description
                  </Typography>
                  <Typography variant="body1">
                    {scheduleDetails.description}
                  </Typography>
                </Grid>
              )}
              
              <Grid item xs={6} md={3}>
                <Typography variant="subtitle2" color="text.secondary">
                  Total Executions
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                  {scheduleDetails.executionCount?.toLocaleString() || 0}
                </Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="subtitle2" color="text.secondary">
                  Created
                </Typography>
                <Typography variant="body1">
                  {formatTimeForDisplay(scheduleDetails.createdAt)?.relative || 'Unknown'}
                </Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="subtitle2" color="text.secondary">
                  Next Run
                </Typography>
                <Typography variant="body1" color="success.main" sx={{ fontWeight: 500 }}>
                  {formatTimeForDisplay(scheduleDetails.nextRunTime)?.relative || 'Not scheduled'}
                </Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="subtitle2" color="text.secondary">
                  Last Run
                </Typography>
                <Typography variant="body1">
                  {scheduleDetails.lastRunTime 
                    ? formatTimeForDisplay(scheduleDetails.lastRunTime)?.relative 
                    : 'Never executed'
                  }
                </Typography>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      </Box>
      
      {/* Error display */}
      {error && (
        <Alert severity="error" sx={{ mb: 2, flexShrink: 0 }}>
          <Typography variant="body2">{error}</Typography>
          <Button size="small" onClick={loadScheduleData} sx={{ mt: 1 }}>
            Retry
          </Button>
        </Alert>
      )}
    </Box>
  );
};

export default ScheduleDetails;