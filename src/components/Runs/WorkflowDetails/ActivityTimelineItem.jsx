import React from 'react';
import { Typography, IconButton, Box, Tooltip, Dialog, DialogTitle, DialogContent, List, ListItem, ListItemText, Button } from '@mui/material';
import { TimelineItem, TimelineSeparator, TimelineConnector, TimelineContent } from '@mui/lab';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import { useTheme } from '@mui/material/styles';
import './WorkflowDetails.css';
import { useSlider } from '../../../contexts/SliderContext';
import { useActivitiesApi } from '../../../services/activities-api';
import { useInstructionsApi } from '../../../services/instructions-api';
import InstructionViewer from '../../Instructions/InstructionViewer';
import { styled } from '@mui/material/styles';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useLoading } from '../../../contexts/LoadingContext';
import CloseIcon from '@mui/icons-material/Close';

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

const ModernDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: 12,
    padding: theme.spacing(1),
    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
  }
}));

const ModernDialogTitle = styled(DialogTitle)(({ theme }) => ({
  padding: theme.spacing(2),
  '& .MuiTypography-root': {
    fontSize: '1.25rem',
    fontWeight: 600,
  }
}));

const ModernDialogContent = styled(DialogContent)(({ theme }) => ({
  padding: theme.spacing(1),
  '& .MuiList-root': {
    padding: 0,
  },
  '& .MuiListItem-root': {
    borderRadius: 8,
    marginBottom: theme.spacing(0.5),
    '&:hover': {
      backgroundColor: theme.palette.mode === 'dark' 
        ? 'rgba(255, 255, 255, 0.08)'
        : 'rgba(0, 0, 0, 0.04)',
    }
  }
}));

const ModernListItem = styled(ListItem)(({ theme }) => ({
  padding: theme.spacing(1.5, 2),
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'translateX(4px)',
  }
}));

const NoInstructionsBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4),
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  color: theme.palette.text.secondary,
  backgroundColor: theme.palette.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.03)'
    : 'rgba(0, 0, 0, 0.02)',
  borderRadius: 8,
  margin: theme.spacing(1),
}));

const ActivityTimelineItem = ({ event, onShowDetails, sortAscending, isHighlighted, workflowId, isMobile }) => {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [instructions, setInstructions] = React.useState([]);
  const { openSlider } = useSlider();
  const activitiesApi = useActivitiesApi();
  const instructionsApi = useInstructionsApi();
  const { setLoading } = useLoading();

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

  const handleInstructionClick = async () => {
    setLoading(true);
    try {
      const activity = await activitiesApi.getWorkflowActivity(
        workflowId,
        event.ActivityId
      );

      const instructionIds = activity?.instructionIds || [];
      if (instructionIds.length === 0) {
        setInstructions([]);
        setIsDialogOpen(true);
      } else if (instructionIds.length === 1) {
        const instruction = await instructionsApi.getInstruction(instructionIds[0]);
        showInstruction(instruction);
      } else {
        const instructionPromises = instructionIds.map(id => 
          instructionsApi.getInstruction(id)
        );
        const fetchedInstructions = await Promise.all(instructionPromises);
        setInstructions(fetchedInstructions);
        setIsDialogOpen(true);
      }
    } catch (error) {
      console.error('Error fetching instructions:', error);
      setInstructions([]);
      setIsDialogOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const showInstruction = (instruction) => {
    const instructionsContent = (
      <InstructionViewer
        instruction={instruction}
        hideActions={true}
      />
    );
    openSlider(instructionsContent, instruction.name);
    setIsDialogOpen(false);
  };

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

  const formatName = (name) => {
    return name
      .replace(/([A-Z])/g, ' $1')
      .trim();
  };

  // Get formatted inputs and outputs
  const inputs = event.Inputs ? formatText(JSON.stringify(event.Inputs)) : null;
  const outputs = event.Result ? formatText(JSON.stringify(event.Result)) : null;

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
                onClick={handleInstructionClick}
                size={isMobile ? "small" : "medium"}
                startIcon={<DescriptionOutlinedIcon fontSize={isMobile ? "small" : "medium"} />}
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
                Knowledge
              </Button>
              
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
      
      {/* Instructions Dialog */}
      <ModernDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <ModernDialogTitle>
          Instructions
          <IconButton
            aria-label="close"
            onClick={() => setIsDialogOpen(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        </ModernDialogTitle>
        <ModernDialogContent>
          {instructions.length > 0 ? (
            <List>
              {instructions.map((instruction) => (
                <ModernListItem 
                  button 
                  key={instruction.id} 
                  onClick={() => showInstruction(instruction)}
                >
                  <ListItemText 
                    primary={instruction.name} 
                    secondary={instruction.description}
                    primaryTypographyProps={{
                      fontWeight: 500,
                      fontSize: isMobile ? '0.875rem' : '1rem'
                    }}
                    secondaryTypographyProps={{
                      fontSize: isMobile ? '0.75rem' : '0.875rem'
                    }}
                  />
                </ModernListItem>
              ))}
            </List>
          ) : (
            <NoInstructionsBox>
              <Typography variant="body1">No instructions available</Typography>
            </NoInstructionsBox>
          )}
        </ModernDialogContent>
      </ModernDialog>
    </>
  );
};

export default ActivityTimelineItem; 