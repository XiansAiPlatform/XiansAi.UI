import { Typography, Box, Tooltip, Button } from '@mui/material';
import { TimelineItem, TimelineSeparator, TimelineConnector, TimelineContent } from '@mui/lab';
import { useTheme } from '@mui/material/styles';
import './WorkflowDetails.css';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

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

const ActivityTimelineItem = ({ event, onShowDetails, sortAscending, isHighlighted, workflowId, isMobile }) => {

  // Helper function to format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    const date = new Date(timestamp);
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Updated helper function to format text
  const formatText = (text, maxLength = 100) => {
    if (!text) return null;
    
    // Parse the JSON string to an object
    const parsed = JSON.parse(text);
    
    // Handle different data types
    if (Array.isArray(parsed)) {
      const formatted = parsed.map(item => {
        if (typeof item === 'string') {
          return item === '' ? '-empty-' : item;
        }
        return JSON.stringify(item);
      }).join('\n');
      return formatted.length > maxLength ? `${formatted.slice(0, maxLength)}...` : formatted;
    } else if (typeof parsed === 'string') {
      // Check for empty string
      if (parsed === '') return '-empty-';
      return parsed.length > maxLength ? `${parsed.slice(0, maxLength)}...` : parsed;
    } else if (typeof parsed === 'object') {
      // For objects, stringify with proper formatting and then truncate
      const formatted = JSON.stringify(parsed, null, 2);
      return formatted.length > maxLength ? `${formatted.slice(0, maxLength)}...` : formatted;
    }
    
    // For other types (numbers, booleans, etc.)
    return String(parsed);
  };

  const formatName = (name) => {
    return name
      .replace(/([A-Z])/g, ' $1')
      .trim();
  };

  // Get formatted inputs and outputs
  // Check for undefined/null, but allow empty strings to be formatted
  const inputs = event.Inputs !== undefined && event.Inputs !== null 
    ? formatText(JSON.stringify(event.Inputs)) 
    : null;
  const outputs = event.Result !== undefined && event.Result !== null 
    ? formatText(JSON.stringify(event.Result)) 
    : null;

  // Render the timeline item with mobile optimizations
  return (
    <>
      <TimelineItem className="timeline-item">
        <TimelineSeparator>
          <Box className="arrow-dot-container">
            <ArrowDot ascending={sortAscending} />
          </Box>
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent 
          className={`timeline-item-content ${isHighlighted ? 'highlighted' : ''}`}
          sx={{ 
            padding: isMobile ? '12px 8px' : '16px',
            margin: isMobile ? '4px 0' : '8px 0'
          }}
        >
          <Box className="timeline-item-container">
            <Box 
              className="timeline-item-header"
              sx={{ 
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                alignItems: isMobile ? 'flex-start' : 'center',
                gap: isMobile ? 1 : 2,
                width: '100%',
                justifyContent: 'space-between',
                marginTop: isMobile ? 1 : 3,
              }}
            >
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  fontWeight: 500,
                  fontSize: isMobile ? '0.9rem' : '1rem',
                  flex: isMobile ? '1 1 100%' : '0 1 auto',
                  marginRight: isMobile ? 0 : 2,
                  wordBreak: 'break-word'
                }}
              >
                {formatName(event.ActivityName) || 'Unknown Activity'}
              </Typography>
              
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                flexWrap: isMobile ? 'wrap' : 'nowrap',
                width: isMobile ? '100%' : 'auto',
                justifyContent: isMobile ? 'space-between' : 'flex-end',
                alignSelf: isMobile ? 'stretch' : 'center',
                flex: isMobile ? '1 1 100%' : '0 0 auto'
              }}>
                
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: 'text.secondary',
                    fontSize: isMobile ? '0.7rem' : '0.75rem',
                    whiteSpace: 'nowrap',
                    minWidth: isMobile ? 'auto' : '140px',
                    textAlign: isMobile ? 'left' : 'right'
                  }}
                >
                  {formatTimestamp(event.StartedTime)}
                </Typography>
              </Box>
            </Box>

            {/* Input and output data */}
            {inputs && (
              <Box className="timeline-data-container" sx={{ mt: 1 }}>
                <Tooltip title="View inputs">
                  <Box 
                    onClick={() => onShowDetails(event)}
                    sx={{ display: 'flex', alignItems: 'center', mb: 0.5, cursor: 'pointer' }}
                  >
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                      Inputs
                    </Typography>
                  </Box>
                </Tooltip>
                <Typography 
                  className="timeline-data-content"
                  variant="body2"
                  onClick={() => onShowDetails(event)}
                  sx={{ 
                    fontSize: isMobile ? '0.75rem' : '0.8125rem',
                    maxHeight: isMobile ? '100px' : '150px',
                    overflowY: 'auto',
                    cursor: 'pointer'
                  }}
                >
                  {inputs}
                </Typography>
              </Box>
            )}

            {outputs && (
              <Box className="timeline-data-container" sx={{ mt: 1 }}>
                <Tooltip title="View outputs">
                  <Box 
                    onClick={() => onShowDetails(event)}
                    sx={{ display: 'flex', alignItems: 'center', mb: 0.5, cursor: 'pointer' }}
                  >
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                      Outputs
                    </Typography>
                  </Box>
                </Tooltip>
                <Typography 
                  className="timeline-data-content"
                  variant="body2"
                  onClick={() => onShowDetails(event)}
                  sx={{ 
                    fontSize: isMobile ? '0.75rem' : '0.8125rem',
                    maxHeight: isMobile ? '100px' : '150px',
                    overflowY: 'auto',
                    cursor: 'pointer'
                  }}
                >
                  {outputs}
                </Typography>
              </Box>
            )}

            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'flex-end', 
                mt: 1,
                gap: 1,
                flexWrap: isMobile ? 'wrap' : 'nowrap',
                width: isMobile ? '100%' : 'auto'
              }}
            >
              <Button
                onClick={() => onShowDetails(event)}
                size={isMobile ? "small" : "medium"}
                startIcon={<InfoOutlinedIcon fontSize={isMobile ? "small" : "medium"} />}
                sx={{ 
                  padding: isMobile ? '4px 8px' : '6px 12px',
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  textTransform: 'none',
                  borderRadius: '4px',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.08)'
                  }
                }}
              >
                In/Out
              </Button>
            </Box>
          </Box>
        </TimelineContent>
      </TimelineItem>
    </>
  );
};

export default ActivityTimelineItem; 