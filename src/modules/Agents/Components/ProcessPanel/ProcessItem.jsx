import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  IconButton,
  Collapse
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ProcessStep from './ProcessStep';

// Process item component (works for both current and historical processes)
const ProcessItem = ({ process, isCurrent = false }) => {
  const [expanded, setExpanded] = useState(isCurrent);
  
  const handleToggleExpand = () => {
    setExpanded(!expanded);
  };
  
  // Format the timestamp as a relative time (e.g., "1 hour ago")
  const formatRelativeTime = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  };
  
  return (
    <Box
      sx={{ 
        mb: 2,
        bgcolor: 'background.paper',
        borderRadius: 1,
        boxShadow: isCurrent ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
        overflow: 'hidden'
      }}
    >
      {/* Process header */}
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          py: 1.5,
          px: 2,
          bgcolor: isCurrent ? 'rgba(25, 118, 210, 0.04)' : 'transparent',
          borderBottom: expanded ? '1px solid' : 'none',
          borderColor: 'rgba(0, 0, 0, 0.06)',
          cursor: 'pointer'
        }}
        onClick={handleToggleExpand}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {isCurrent ? (
            <PlayArrowIcon sx={{ mr: 1.5, fontSize: 20, color: 'primary.main' }} />
          ) : (
            <CheckCircleIcon sx={{ mr: 1.5, fontSize: 20, color: 'success.main' }} />
          )}
          <Box>
            <Typography variant="subtitle2">{process.name}</Typography>
            <Typography variant="caption" color="text.secondary">
              {isCurrent ? 'Current process' : formatRelativeTime(process.timestamp)}
            </Typography>
          </Box>
        </Box>
        <IconButton 
          size="small" 
          onClick={(e) => {
            e.stopPropagation();
            handleToggleExpand();
          }}
          aria-expanded={expanded}
          aria-label={expanded ? 'collapse' : 'expand'}
          sx={{ color: 'action.active' }}
        >
          {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
        </IconButton>
      </Box>
      
      {/* Process steps */}
      <Collapse in={expanded}>
        <Box sx={{ py: 1.5, px: 1 }}>
          {process.steps.map((step) => {
            const isActive = isCurrent && step.name === process.currentStep;
            const isPending = isCurrent && !step.completed && !isActive;
            
            return (
              <ProcessStep 
                key={step.id}
                step={step}
                isActive={isActive}
                isPending={isPending}
              />
            );
          })}
        </Box>
      </Collapse>
    </Box>
  );
};

export default ProcessItem; 