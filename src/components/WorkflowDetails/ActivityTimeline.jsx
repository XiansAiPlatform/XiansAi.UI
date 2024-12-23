import React from 'react';
import { Typography, IconButton, Box, Paper } from '@mui/material';
import { Timeline } from '@mui/lab';
import RefreshIcon from '@mui/icons-material/Refresh';
import SortIcon from '@mui/icons-material/Sort';
import ActivityTimelineItem from './ActivityTimelineItem';
import ActivityDetailsView from './ActivityDetailsView';

const ActivityTimeline = ({ events, isLoading, loadEvents, openSlider }) => {
  const [sortAscending, setSortAscending] = React.useState(false);

  const sortedEvents = React.useMemo(() => {
    return [...events].sort((a, b) => {
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
    <Paper
      elevation={0}
      sx={{
        p: 3,
        mb: 4,
        backgroundColor: 'rgba(0, 0, 0, 0.02)',
        borderRadius: 2
      }}
    >
      <Box sx={{ 
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 3
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h4">Workflow Activities</Typography>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              bgcolor: 'action.hover',
              px: 1.5,
              py: 0.5,
              borderRadius: 1,
              color: 'text.secondary'
            }}
          >
            {events.length}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            onClick={() => setSortAscending(!sortAscending)}
            sx={{
              display: 'flex',
              gap: 0.5,
              bgcolor: 'action.hover',
              borderRadius: 1
            }}
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
            sx={{
              display: 'flex',
              gap: 0.5,
              bgcolor: 'action.hover',
              borderRadius: 1
            }}
            title="Refresh activities"
          >
            <RefreshIcon fontSize="small" />
            <Typography variant="button">Refresh</Typography>
          </IconButton>
        </Box>
      </Box>

      <Timeline
        sx={{
          [`& .MuiTimelineItem-root:before`]: {
            flex: 0,
            padding: 0
          }
        }}
      >
        {sortedEvents.map((event, index) => (
          <ActivityTimelineItem
            key={`${event.completedEventId || event.id}-${index}`}
            event={event}
            onShowDetails={handleShowDetails}
            sortAscending={sortAscending}
          />
        ))}
      </Timeline>
    </Paper>
  );
};

export default ActivityTimeline;
