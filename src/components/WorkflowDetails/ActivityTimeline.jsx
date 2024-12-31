import React, { useCallback, useState, useEffect } from 'react';
import { Typography, IconButton, Box, Paper } from '@mui/material';
import { Timeline } from '@mui/lab';
import RefreshIcon from '@mui/icons-material/Refresh';
import SortIcon from '@mui/icons-material/Sort';
import ActivityTimelineItem from './ActivityTimelineItem';
import ActivityDetailsView from './ActivityDetailsView';
import './WorkflowDetails.css';
import { useLoading } from '../../contexts/LoadingContext';
import { useNotification } from '../../contexts/NotificationContext';
import { useApi } from '../../services/api';

const ActivityTimeline = ({ workflowId, openSlider }) => {
  const [events, setEvents] = useState([]);
  const [latestEventId, setLatestEventId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sortAscending, setSortAscending] = useState(false);
  const { setLoading } = useLoading();
  const { showError } = useNotification();
  const api = useApi();

  const startEventStream = useCallback(async () => {
    setIsLoading(true);
    setLoading(true);
    try {
      
      const abortController = new AbortController();
      
      await api.streamActivityEvents(workflowId, (newEvent) => {
        
        setEvents(currentEvents => {
          if (!newEvent.ID) {
            console.warn('Event missing ID:', newEvent);
            return currentEvents;
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
  }, [workflowId, showError, setLoading]);

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
      openSlider(<ActivityDetailsView activityDetails={details} />);
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
      <Box className="header-container">
        <Box className="header-left">
          <Typography className="overview-title-small">Flow Activities</Typography>
          <Typography 
            variant="subtitle1" 
            className="activity-count"
          >
            {events.length}
          </Typography>
        </Box>
        <Box className="header-actions">
          <IconButton
            onClick={() => setSortAscending(!sortAscending)}
            className="action-button"
            title={`Sort ${sortAscending ? 'newest first' : 'oldest first'}`}
          >
            <SortIcon 
              fontSize="small" 
              sx={{ 
                transform: sortAscending ? 'none' : 'rotate(180deg)',
                transition: 'transform 0.2s'
              }} 
            />
            <Typography variant="button">
              {sortAscending ? 'Oldest First' : 'Newest First'}
            </Typography>
          </IconButton>
          <IconButton
            onClick={handleRefresh}
            disabled={isLoading}
            className="action-button"
            title="Refresh activities"
          >
            <RefreshIcon fontSize="small" />
            <Typography variant="button">Refresh</Typography>
          </IconButton>
        </Box>
      </Box>

      <Timeline 
        className="timeline-root" 
        position="left"
      >
        {sortedEventsWithIndex.map((event) => (
          <ActivityTimelineItem
            key={`${event.ID}-${event.chronologicalIndex}`}
            event={event}
            index={event.chronologicalIndex}
            onShowDetails={handleShowDetails}
            sortAscending={sortAscending}
            isHighlighted={event.ID === latestEventId}
          />
        ))}
      </Timeline>
    </Paper>
  );
};

export default ActivityTimeline;
