import React from 'react';
import { Typography, IconButton, Box, Paper } from '@mui/material';
import { Timeline } from '@mui/lab';
import RefreshIcon from '@mui/icons-material/Refresh';
import SortIcon from '@mui/icons-material/Sort';
import ActivityTimelineItem from './ActivityTimelineItem';
import ActivityDetailsView from './ActivityDetailsView';
import './WorkflowDetails.css';

const ActivityTimeline = ({ events, isLoading, loadEvents, openSlider }) => {
  const [sortAscending, setSortAscending] = React.useState(false);

  const sortedEventsWithIndex = React.useMemo(() => {
    // First sort by start time chronologically (ascending)
    const chronologicalOrder = [...events].sort((a, b) => {
      const timeA = a.startedTime ? new Date(a.startedTime).getTime() : 0;
      const timeB = b.startedTime ? new Date(b.startedTime).getTime() : 0;
      return timeA - timeB;
    });

    // Assign indices based on chronological order
    const withIndices = chronologicalOrder.map((event, idx) => ({
      ...event,
      chronologicalIndex: idx + 1
    }));

    // Then sort based on user's preference (ascending/descending)
    return withIndices.sort((a, b) => {
      const timeA = a.startedTime ? new Date(a.startedTime).getTime() : 0;
      const timeB = b.startedTime ? new Date(b.startedTime).getTime() : 0;
      return sortAscending ? timeA - timeB : timeB - timeA;
    });
  }, [events, sortAscending]);

  const handleShowDetails = (event) => {
    try {
      const details = {
        activityName: event.activityName,
        inputs: event.inputs,
        result: typeof event.result === 'string' ? JSON.parse(event.result) : event.result
      };
      openSlider(<ActivityDetailsView activityDetails={details} />);
    } catch (error) {
      console.error('Error processing event details:', error);
    }
  };

  return (
    <Paper className="paper-container">
      <Box className="header-container">
        <Box className="header-left">
          <Typography variant="h4">Workflow Activities</Typography>
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
            onClick={loadEvents}
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
            key={`${event.completedEventId || event.id}-${event.chronologicalIndex}`}
            event={event}
            index={event.chronologicalIndex}
            onShowDetails={handleShowDetails}
            sortAscending={sortAscending}
          />
        ))}
      </Timeline>
    </Paper>
  );
};

export default ActivityTimeline;
