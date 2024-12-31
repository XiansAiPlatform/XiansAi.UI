import React from 'react';
import { Typography, IconButton, Box } from '@mui/material';
import { TimelineItem, TimelineSeparator, TimelineConnector, TimelineContent } from '@mui/lab';
import InputIcon from '@mui/icons-material/Input';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import { useTheme } from '@mui/material/styles';
import './WorkflowDetails.css';

const ArrowDot = ({ ascending }) => {
  const theme = useTheme();
  const connectorColor = theme.palette.mode === 'light' 
    ? 'rgba(0, 0, 0, 0.12)' 
    : 'rgba(255, 255, 255, 0.12)';

  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 10"
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: `translate(-50%, -50%) ${ascending ? 'rotate(180deg)' : ''}`,
        zIndex: 1
      }}
    >
      <path
        d="M10 0 L5 8 L15 8 Z"
        fill={connectorColor}
      />
    </svg>
  );
};

const ActivityTimelineItem = ({ event, onShowDetails, sortAscending, index }) => {
  return (
    <TimelineItem sx={{
      '&.MuiTimelineItem-root': {
        '&::before': {
          display: 'none'
        }
      }
    }}>
      <TimelineSeparator>
        <Box className="arrow-dot-container">
          <ArrowDot ascending={sortAscending} />
        </Box>
        <TimelineConnector />
      </TimelineSeparator>
      <TimelineContent sx={{ 
        py: '12px', 
        px: 2,
        textAlign: 'left'
      }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 1,
          alignItems: 'flex-start'
        }}>
          <Box sx={{ width: '100%' }}>
            <Typography variant="h6">
              {index}. {event.ActivityName}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Started: {new Date(event.StartedTime).toLocaleString()}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Ended: {new Date(event.EndedTime).toLocaleString()}
            </Typography>
          </Box>
          <Box sx={{ 
            display: 'flex', 
            gap: 1,
            justifyContent: 'flex-start'
          }}>
            <IconButton
              onClick={() => onShowDetails(event)}
              size="small"
              sx={{ display: 'flex', gap: 0.5, bgcolor: 'action.hover', borderRadius: 1 }}
              title="View Inputs & Outputs"
            >
              <InputIcon fontSize="small" />
              <Typography variant="button">View Inputs & Outputs</Typography>
            </IconButton>
            <IconButton
              size="small"
              sx={{ display: 'flex', gap: 0.5, bgcolor: 'action.hover', borderRadius: 1 }}
              title="View Agents"
            >
              <SmartToyOutlinedIcon fontSize="small" />
              <Typography variant="button">View Agents</Typography>
            </IconButton>
          </Box>
        </Box>
      </TimelineContent>
    </TimelineItem>
  );
};

export default ActivityTimelineItem; 