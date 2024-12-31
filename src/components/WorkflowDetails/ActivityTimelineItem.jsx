import React from 'react';
import { Typography, IconButton, Box, Tooltip } from '@mui/material';
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

const ActivityTimelineItem = ({ event, onShowDetails, sortAscending, index, isHighlighted }) => {

  // Updated helper function to format text
  const formatText = (text, maxLength = 100) => {
    if (!text) return null;
    
    // Parse the JSON string to an object
    const parsed = JSON.parse(text);
    
    // Handle different data types
    if (Array.isArray(parsed)) {
      const formatted = parsed.map(item => 
        typeof item === 'string' ? item : JSON.stringify(item)
      ).join('\n');
      return formatted.length > maxLength ? `${formatted.slice(0, maxLength)}...` : formatted;
    } else if (typeof parsed === 'string') {

      return parsed.length > maxLength ? `${parsed.slice(0, maxLength)}...` : parsed;
    } else if (typeof parsed === 'object') {
      // For objects, stringify with proper formatting and then truncate
      const formatted = JSON.stringify(parsed, null, 2);
      return formatted.length > maxLength ? `${formatted.slice(0, maxLength)}...` : formatted;
    }
    
    // For other types (numbers, booleans, etc.)
    return String(parsed);
  };

  // Get formatted inputs and outputs
  const inputs = event.Inputs ? formatText(JSON.stringify(event.Inputs)) : null;
  const outputs = event.Result ? formatText(JSON.stringify(event.Result)) : null;

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
        <Box 
          className={`timeline-item-content ${isHighlighted ? 'highlighted' : ''}`}
          data-highlighted={isHighlighted}
          data-event-id={event.ID}
        >
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

            {/* Updated Inputs display */}
            {inputs && (
              <Box sx={{ width: '100%' }}>
                <Typography variant="subtitle2" color="primary">
                  Inputs:
                </Typography>
                <Tooltip title={JSON.stringify(event.Inputs, null, 2)}>
                  <Typography 
                    variant="body2" 
                    onClick={() => onShowDetails(event)}
                    sx={{ 
                      bgcolor: 'action.hover',
                      p: 1,
                      borderRadius: 1,
                      fontFamily: 'monospace',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-all',
                      display: 'block',
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: 'action.selected'
                      }
                    }}
                  >
                    {inputs}
                  </Typography>
                </Tooltip>
              </Box>
            )}

            {/* Updated Outputs display */}
            {outputs && (
              <Box sx={{ width: '100%' }}>
                <Typography variant="subtitle2" color="primary">
                  Outputs:
                </Typography>
                <Tooltip title={JSON.stringify(event.Result, null, 2)}>
                  <Typography 
                    variant="body2" 
                    onClick={() => onShowDetails(event)}
                    sx={{ 
                      bgcolor: 'action.hover',
                      p: 1,
                      borderRadius: 1,
                      fontFamily: 'monospace',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-all',
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: 'action.selected'
                      }
                    }}
                  >
                    {outputs}
                  </Typography>
                </Tooltip>
              </Box>
            )}

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
        </Box>
      </TimelineContent>
    </TimelineItem>
  );
};

export default ActivityTimelineItem; 