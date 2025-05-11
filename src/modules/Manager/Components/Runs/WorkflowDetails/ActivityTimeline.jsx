import React, { useCallback, useState, useEffect } from 'react';
import { Typography, IconButton, Box, Paper } from '@mui/material';
import { Timeline } from '@mui/lab';
import RefreshIcon from '@mui/icons-material/Refresh';
import SortIcon from '@mui/icons-material/Sort';
import ActivityTimelineItem from './ActivityTimelineItem';
import ActivityDetailsView from './ActivityDetailsView';
import './WorkflowDetails.css';
import { useLoading } from '../../../contexts/LoadingContext';
import { useNotification } from '../../../contexts/NotificationContext';
import { useWorkflowApi } from '../../../services/workflow-api';

const ActivityTimeline = ({ workflowId, openSlider, onWorkflowComplete, isMobile }) => {
  const [events, setEvents] = useState([]);
  const [latestEventId, setLatestEventId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sortAscending, setSortAscending] = useState(false);
  const [shouldNotifyCompletion, setShouldNotifyCompletion] = useState(false);
  const { setLoading } = useLoading();
  const { showError } = useNotification();
  const api = useWorkflowApi();

  const startEventStream = useCallback(async () => {
    setIsLoading(true);
    setLoading(true);
    try {
      
      const abortController = new AbortController();
      console.log('workflowId', workflowId);
      
      await api.streamActivityEvents(workflowId, (newEvent) => {
        
        setEvents(currentEvents => {
          if (!newEvent.ID) {
            console.warn('Event missing ID:', newEvent);
            return currentEvents;
          }

          if (newEvent.ActivityName === 'Flow Completed') {
            setShouldNotifyCompletion(true);
          }

          // Check if event already exists
          if (currentEvents.some(e => e.ID === newEvent.ID)) {
            return currentEvents;
          }

          // Set latest event ID
          setLatestEventId(newEvent.ID);
          
          // Remove highlight after 5 seconds
          setTimeout(() => {
            setLatestEventId(null);
          }, 5000);

          return [...currentEvents, newEvent];
        });
      }, abortController.signal);

      return () => abortController.abort();
    } catch (error) {
      showError(error.message || 'Failed to connect to event stream');
      console.error('Failed to connect to event stream:', error);
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  }, [workflowId, showError, setLoading, api]);

  // Cleanup function for the stream
  useEffect(() => {
    let cleanup;

    const initStream = async () => {
      cleanup = await startEventStream();
    };

    initStream();

    return () => {
      if (cleanup) cleanup();
    };
  }, [startEventStream]);

  // Add new effect to handle completion notification
  useEffect(() => {
    if (shouldNotifyCompletion) {
      onWorkflowComplete?.();
      setShouldNotifyCompletion(false);
    }
  }, [shouldNotifyCompletion, onWorkflowComplete]);

  const sortedEventsWithIndex = React.useMemo(() => {
    // First sort by start time chronologically (ascending)
    const chronologicalOrder = [...events].sort((a, b) => {
      const timeA = a.StartedTime ? new Date(a.StartedTime).getTime() : 0;
      const timeB = b.StartedTime ? new Date(b.StartedTime).getTime() : 0;
      return timeA - timeB;
    });

    // Assign indices based on chronological order
    const withIndices = chronologicalOrder.map((event, idx) => ({
      ...event,
      chronologicalIndex: idx + 1
    }));

    // Then sort based on user's preference (ascending/descending)
    return withIndices.sort((a, b) => {
      const timeA = a.StartedTime ? new Date(a.StartedTime).getTime() : 0;
      const timeB = b.StartedTime ? new Date(b.StartedTime).getTime() : 0;
      return sortAscending ? timeA - timeB : timeB - timeA;
    });
  }, [events, sortAscending]);

  const handleShowDetails = (event) => {
    try {
      const details = {
        activityName: event.ActivityName,
        inputs: event.Inputs,
        result: typeof event.Result === 'string' ? JSON.parse(event.Result) : event.Result
      };
      openSlider(<ActivityDetailsView activityDetails={details} />, event.ActivityName);
    } catch (error) {
      console.error('Error processing event details:', error);
    }
  };

  const handleRefresh = () => {
    setEvents([]); // Clear existing events
    startEventStream(); // Restart the stream
  };

  return (
    <Paper className="paper-container">
      <Box className="header-container" sx={{ 
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? 2 : 0
      }}>
        <Box className="header-left">
          <Typography className="overview-title-small">Flow Activities</Typography>
          <Typography 
            variant="subtitle1" 
            className="activity-count"
          >
            {events.length}
          </Typography>
        </Box>
        <Box className="header-actions" sx={{ 
          width: isMobile ? '100%' : 'auto',
          justifyContent: isMobile ? 'space-between' : 'flex-end'
        }}>
          <IconButton
            onClick={() => setSortAscending(!sortAscending)}
            className="action-button"
            title={`Sort ${sortAscending ? 'newest first' : 'oldest first'}`}
            sx={{ flex: isMobile ? 1 : 'none', mr: isMobile ? 1 : 0 }}
          >
            <SortIcon 
              fontSize="small" 
              sx={{ 
                transform: sortAscending ? 'none' : 'rotate(180deg)',
                transition: 'transform 0.2s'
              }} 
            />
            <Typography variant="button" sx={{ display: { xs: 'none', sm: 'block' } }}>
              {sortAscending ? 'Oldest First' : 'Newest First'}
            </Typography>
          </IconButton>
          <IconButton
            onClick={handleRefresh}
            disabled={isLoading}
            className="action-button"
            title="Refresh activities"
            sx={{ flex: isMobile ? 1 : 'none' }}
          >
            <RefreshIcon fontSize="small" />
            <Typography variant="button" sx={{ display: { xs: 'none', sm: 'block' } }}>
              Refresh
            </Typography>
          </IconButton>
        </Box>
      </Box>

      <Timeline 
        className="timeline-root" 
        position="left"
        sx={{
          padding: isMobile ? '0 0 0 8px' : '0',
          '& .MuiTimelineItem-root': {
            minHeight: 'auto',
            '&:before': {
              display: 'none'
            }
          },
          '& .MuiTimelineContent-root': {
            padding: isMobile ? '0 0 16px 16px' : '0 16px 16px 16px'
          },
          '& .MuiTimelineDot-root': {
            margin: isMobile ? '0 8px 0 0' : '0 12px 0 0'
          }
        }}
      >
        {sortedEventsWithIndex.map((event) => (
          <ActivityTimelineItem
            workflowId={workflowId}
            key={`${event.ID}-${event.chronologicalIndex}`}
            event={event}
            onShowDetails={handleShowDetails}
            sortAscending={sortAscending}
            isHighlighted={event.ID === latestEventId}
            isMobile={isMobile}
          />
        ))}
      </Timeline>
    </Paper>
  );
};

export default ActivityTimeline;
