import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
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
  Collapse,
  IconButton
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
  const [headerExpanded, setHeaderExpanded] = useState(false);

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


  const renderRunsList = (runs, emptyMessage, emptyIcon) => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress size={40} thickness={4} />
        </Box>
      );
    }

    if (runs.length === 0) {
      return (
        <Box sx={{ 
          textAlign: 'center', 
          py: 8, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          bgcolor: 'grey.50',
          borderRadius: 2,
          border: '1px dashed',
          borderColor: 'grey.300'
        }}>
          {emptyIcon}
          <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
            {emptyMessage}
          </Typography>
        </Box>
      );
    }

    return (
      <Box sx={{ 
        bgcolor: 'background.paper', 
        borderRadius: 2,
        overflow: 'hidden'
      }}>
        {runs.map((run, index) => {
          const timeData = formatTimeForDisplay(run.scheduledTime || run.actualRunTime);
          if (!timeData) return null;
          
          return (
            <Box
              key={run.runId}
              sx={{
                p: 2.5,
                borderBottom: index < runs.length - 1 ? '1px solid' : 'none',
                borderColor: 'divider',
                transition: 'background-color 0.2s',
                '&:hover': {
                  bgcolor: 'grey.50'
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
                <Tooltip title={timeData.full} arrow placement="top">
                  <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
                    {timeData.formatted}
                  </Typography>
                </Tooltip>
                <Chip 
                  label={timeData.relative} 
                  size="small" 
                  sx={{ 
                    height: 24, 
                    fontSize: '0.75rem',
                    bgcolor: 'primary.50',
                    color: 'primary.main',
                    fontWeight: 500
                  }} 
                />
              </Box>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                {run.workflowRunId && (
                  <Box sx={{ 
                    bgcolor: 'grey.100', 
                    px: 1.5, 
                    py: 0.5, 
                    borderRadius: 1,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.5
                  }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                      ID:
                    </Typography>
                    <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: '0.7rem', fontWeight: 500 }}>
                      {run.workflowRunId}
                    </Typography>
                  </Box>
                )}
                {run.duration && (
                  <Box sx={{ 
                    bgcolor: 'grey.100', 
                    px: 1.5, 
                    py: 0.5, 
                    borderRadius: 1,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.5
                  }}>
                    <AccessTimeIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
                    <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 500 }}>
                      {run.duration}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          );
        })}
      </Box>
    );
  };

  return (
    <Box sx={{ 
      height: '100%',
      display: 'flex', 
      flexDirection: 'column',
      p: 2,
      bgcolor: 'grey.50'
    }}>
      {/* Error display */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 2,
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(211, 47, 47, 0.15)'
          }}
        >
          <Typography variant="body2">{error}</Typography>
          <Button size="small" onClick={loadScheduleData} sx={{ mt: 1 }}>
            Retry
          </Button>
        </Alert>
      )}

      {/* Header Section - Schedule Details and Configuration */}
      <Card 
        elevation={0}
        sx={{ 
          mb: 2,
          borderRadius: 2,
          border: '1px solid',
          borderColor: headerExpanded ? 'primary.main' : 'divider',
          bgcolor: 'background.paper',
          transition: 'all 0.3s ease',
          '&:hover': {
            borderColor: 'primary.main',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }
        }}
      >
        <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
          {/* Compact Header Row - Always Visible */}
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              cursor: 'pointer',
              borderRadius: 1,
              p: 0.5,
              transition: 'background-color 0.2s',
              '&:hover': {
                bgcolor: 'grey.50'
              }
            }}
            onClick={() => setHeaderExpanded(!headerExpanded)}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, minWidth: 0 }}>
              <Box sx={{ 
                p: 0.75, 
                bgcolor: headerExpanded ? 'primary.main' : 'primary.50',
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease'
              }}>
                <ScheduleIcon sx={{ fontSize: 20, color: headerExpanded ? 'white' : 'primary.main' }} />
              </Box>
              
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    fontWeight: 700, 
                    color: 'text.primary', 
                    lineHeight: 1.3,
                    fontSize: '0.95rem',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {scheduleDetails.id}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                    {scheduleDetails.workflowType}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                    •
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                    {scheduleDetails.executionCount?.toLocaleString() || 0} runs
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip 
                label={scheduleDetails.status} 
                {...getStatusChipProps(scheduleDetails.status)}
                sx={{ fontSize: '0.75rem', height: 24, fontWeight: 600 }}
              />
              <IconButton 
                size="small"
                sx={{ 
                  transition: 'transform 0.3s ease',
                  transform: headerExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
                }}
              >
                <ExpandMoreIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>

          {/* Expandable Configuration Details */}
          <Collapse in={headerExpanded} timeout={300}>
            <Box sx={{ pt: 2, mt: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
              <Grid container spacing={1.5}>
                {/* Workflow Type */}
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ 
                    p: 1.5, 
                    bgcolor: 'grey.50', 
                    borderRadius: 1.5,
                    border: '1px solid',
                    borderColor: 'grey.200',
                    height: '100%'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.75 }}>
                      <WorkflowIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        Workflow Type
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.9rem' }}>
                      {scheduleDetails.workflowType}
                    </Typography>
                  </Box>
                </Grid>

                {/* Agent Info */}
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ 
                    p: 1.5, 
                    bgcolor: 'grey.50', 
                    borderRadius: 1.5,
                    border: '1px solid',
                    borderColor: 'grey.200',
                    height: '100%'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.75 }}>
                      <AgentIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        Agent
                      </Typography>
                    </Box>
                    <Tooltip title={scheduleDetails.agentName} arrow>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 600, 
                          color: 'text.primary', 
                          fontSize: '0.9rem',
                          mb: 0.5,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {scheduleDetails.agentName}
                      </Typography>
                    </Tooltip>
                    <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace', fontSize: '0.65rem' }}>
                      {scheduleDetails.agentId}
                    </Typography>
                  </Box>
                </Grid>

                {/* Total Runs */}
                <Grid item xs={4} sm={4} md={2}>
                  <Box sx={{ 
                    p: 1.5, 
                    bgcolor: 'primary.50', 
                    borderRadius: 1.5,
                    textAlign: 'center',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                  }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', fontSize: '1.25rem', lineHeight: 1.2 }}>
                      {scheduleDetails.executionCount?.toLocaleString() || 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', fontWeight: 600 }}>
                      Total Runs
                    </Typography>
                  </Box>
                </Grid>

                {/* Next Run */}
                <Grid item xs={4} sm={4} md={2}>
                  <Box sx={{ 
                    p: 1.5, 
                    bgcolor: 'success.50', 
                    borderRadius: 1.5,
                    textAlign: 'center',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                  }}>
                    <Typography variant="body2" color="success.main" sx={{ fontWeight: 600, fontSize: '0.8rem', lineHeight: 1.3 }}>
                      {formatTimeForDisplay(scheduleDetails.nextRunTime)?.relative || 'Not scheduled'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', fontWeight: 600 }}>
                      Next Run
                    </Typography>
                  </Box>
                </Grid>

                {/* Last Run */}
                <Grid item xs={4} sm={4} md={2}>
                  <Box sx={{ 
                    p: 1.5, 
                    bgcolor: 'grey.100', 
                    borderRadius: 1.5,
                    textAlign: 'center',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                  }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.8rem', lineHeight: 1.3 }}>
                      {scheduleDetails.lastRunTime 
                        ? formatTimeForDisplay(scheduleDetails.lastRunTime)?.relative 
                        : 'Never'
                      }
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', fontWeight: 600 }}>
                      Last Run
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Collapse>
        </CardContent>
      </Card>

      {/* Runs Section */}
      <Card 
        elevation={0}
        sx={{ 
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          overflow: 'hidden',
          minHeight: 0
        }}
      >
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          sx={{ 
            px: 2,
            pt: 1.5,
            borderBottom: 1, 
            borderColor: 'divider',
            flexShrink: 0,
            '& .MuiTab-root': {
              textTransform: 'none',
              fontSize: '0.875rem',
              fontWeight: 600,
              minHeight: 42
            }
          }}
        >
          <Tab 
            label={`Upcoming (${upcomingRuns.length})`}
            icon={<AccessTimeIcon />}
            iconPosition="start"
          />
          <Tab 
            label={`Past (${recentRuns.length})`}
            icon={<HistoryIcon />}
            iconPosition="start"
          />
        </Tabs>
        
        <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', p: 2 }}>
          {activeTab === 0 && renderRunsList(
            upcomingRuns, 
            'No upcoming runs scheduled',
            <AccessTimeIcon sx={{ fontSize: 56, color: 'grey.400', mb: 2 }} />
          )}
          {activeTab === 1 && renderRunsList(
            recentRuns,
            'No execution history available',
            <HistoryIcon sx={{ fontSize: 56, color: 'grey.400', mb: 2 }} />
          )}
        </Box>
      </Card>
    </Box>
  );
};

export default ScheduleDetails;