import React from 'react';
import { Typography, IconButton, Box, Tooltip, Dialog, DialogTitle, DialogContent, List, ListItem, ListItemText } from '@mui/material';
import { TimelineItem, TimelineSeparator, TimelineConnector, TimelineContent } from '@mui/lab';
import InputIcon from '@mui/icons-material/Input';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import { useTheme } from '@mui/material/styles';
import './WorkflowDetails.css';
import Chip from '@mui/material/Chip';
import { useSlider } from '../../contexts/SliderContext';
import { useActivitiesApi } from '../../services/activities-api';
import { useInstructionsApi } from '../../services/instructions-api';
import InstructionViewer from '../Instructions/InstructionViewer';
import { styled } from '@mui/material/styles';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useLoading } from '../../contexts/LoadingContext';

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

const ActivityTimelineItem = ({ event, onShowDetails, sortAscending, isHighlighted, workflowId }) => {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [instructions, setInstructions] = React.useState([]);
  const { openSlider } = useSlider();
  const activitiesApi = useActivitiesApi();
  const instructionsApi = useInstructionsApi();
  const { setLoading } = useLoading();

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

  // Get formatted inputs and outputs
  const inputs = event.Inputs ? formatText(JSON.stringify(event.Inputs)) : null;
  const outputs = event.Result ? formatText(JSON.stringify(event.Result)) : null;

  return (
    <TimelineItem className="timeline-item">
      <TimelineSeparator>
        <Box className="arrow-dot-container">
          <ArrowDot ascending={sortAscending} />
        </Box>
        <TimelineConnector />
      </TimelineSeparator>
      <TimelineContent className="timeline-content">
        <Box 
          className={`timeline-item-content ${isHighlighted ? 'highlighted' : ''}`}
          data-highlighted={isHighlighted}
          data-event-id={event.ID}
        >
          <Box className="timeline-item-container">
            <Box className="timeline-item-header">
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="h6">
                  {event.ActivityId ? `${event.ActivityId}.` : ''} {event.ActivityName}
                </Typography>
                {isHighlighted && (
                  <Chip 
                    label="New" 
                    size="small" 
                    color="primary" 
                    sx={{ 
                      height: '20px',
                      fontSize: '0.75rem',
                      backgroundColor: 'rgba(25, 118, 210, 0.08)',
                      color: 'primary.main',
                      ml: 1
                    }} 
                  />
                )}
              </Box>
              
              <Box className="timeline-actions">
                <IconButton
                  onClick={() => onShowDetails(event)}
                  size="small"
                  className="timeline-action-button"
                  title="View Inputs & Outputs"
                >
                  <InputIcon fontSize="small" />
                  <Typography variant="caption" sx={{ ml: 1 }}>
                    Inputs & Outputs
                  </Typography>
                </IconButton>
 
                <IconButton
                  size="small"
                  className="timeline-action-button"
                  title="View Instructions"
                  onClick={handleInstructionClick}
                >
                  <DescriptionOutlinedIcon fontSize="small" />
                  <Typography variant="caption" sx={{ ml: 1 }}>
                    Instructions
                  </Typography>
                </IconButton>
              </Box>
            </Box>

            <Typography variant="body2" color="textSecondary">
              Started: {new Date(event.StartedTime).toLocaleString()}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Ended: {new Date(event.EndedTime).toLocaleString()}
            </Typography>

            {/* Updated Inputs display */}
            {inputs && (
              <Box className="timeline-data-container">
                <Typography variant="subtitle2" color="primary">
                  Inputs:
                </Typography>
                <Tooltip title={JSON.stringify(event.Inputs, null, 2)}>
                  <Typography 
                    variant="body2" 
                    onClick={() => onShowDetails(event)}
                    className="timeline-data-content"
                  >
                    {inputs}
                  </Typography>
                </Tooltip>
              </Box>
            )}

            {/* Updated Outputs display */}
            {outputs && (
              <Box className="timeline-data-container">
                <Typography variant="subtitle2" color="primary">
                  Outputs:
                </Typography>
                <Tooltip title={JSON.stringify(event.Result, null, 2)}>
                  <Typography 
                    variant="body2" 
                    onClick={() => onShowDetails(event)}
                    className="timeline-data-content"
                  >
                    {outputs}
                  </Typography>
                </Tooltip>
              </Box>
            )}
          </Box>
        </Box>
      </TimelineContent>

      <ModernDialog 
        open={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <ModernDialogTitle>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: 1 
          }}>
            <DescriptionOutlinedIcon sx={{ color: 'primary.main' }} />
            Instructions
          </Box>
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
                    primaryTypographyProps={{
                      sx: {
                        fontWeight: 500,
                      }
                    }}
                  />
                </ModernListItem>
              ))}
            </List>
          ) : (
            <NoInstructionsBox>
              <Typography sx={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: 1,
                fontWeight: 500
              }}>
                <InfoOutlinedIcon sx={{ fontSize: 20 }} />
                No instructions applied for this activity
              </Typography>
            </NoInstructionsBox>
          )}
        </ModernDialogContent>
      </ModernDialog>
    </TimelineItem>
  );
};

export default ActivityTimelineItem; 