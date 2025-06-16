import { useState } from 'react';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Button,
  Collapse
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import InputIcon from '@mui/icons-material/Input';
import OutputIcon from '@mui/icons-material/Output';
import StepDataDisplay from './StepDataDisplay';

// Process step with hidden details
const ProcessStep = ({ step, isActive, isPending }) => {
  const [detailsTab, setDetailsTab] = useState(null);
  
  const handleTabChange = (event, newValue) => {
    setDetailsTab(newValue === detailsTab ? null : newValue);
  };
  
  return (
    <Box sx={{ mb: 1.5, pl: 1 }}>
      {/* Step header with inline tabs */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center',
        py: 0.75,
        borderRadius: 1,
        bgcolor: isActive ? 'rgba(25, 118, 210, 0.04)' : 'transparent',
      }}>
        {/* Step status icon */}
        {step.completed ? (
          <CheckCircleIcon sx={{ mr: 1.5, fontSize: 20, color: 'success.main' }} />
        ) : isActive ? (
          <Box sx={{ mr: 1.5, display: 'flex', alignItems: 'center' }}>
            <CircularProgress size={20} thickness={4} />
          </Box>
        ) : (
          <RadioButtonUncheckedIcon sx={{ mr: 1.5, fontSize: 20, color: 'text.disabled' }} />
        )}
        
        {/* Step name */}
        <Typography 
          variant="body1" 
          color={isPending ? 'text.disabled' : 'text.primary'}
          sx={{ flex: 1 }}
        >
          {step.name}
        </Typography>
        
        {/* Status label for active step */}
        {isActive && (
          <Typography variant="caption" sx={{ color: 'primary.main', mr: 2, fontSize: '0.7rem' }}>
            In progress
          </Typography>
        )}
        
        {/* Inline tabs for inputs/outputs */}
        {(step.inputs || step.outputs) && (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {step.inputs && (
              <Button
                size="small"
                disableElevation
                variant="text"
                color={detailsTab === 'inputs' ? 'primary' : 'inherit'}
                onClick={() => handleTabChange(null, 'inputs')}
                startIcon={<InputIcon fontSize="small" />}
                sx={{ 
                  minWidth: 0,
                  fontSize: '0.7rem',
                  color: detailsTab === 'inputs' ? 'primary.main' : 'text.secondary',
                  '&:hover': {
                    bgcolor: 'transparent',
                    color: detailsTab === 'inputs' ? 'primary.main' : 'text.primary'
                  },
                  p: 0.5
                }}
              >
                Inputs
              </Button>
            )}
            
            {step.outputs && (
              <Button
                size="small"
                disableElevation
                variant="text"
                color={detailsTab === 'outputs' ? 'primary' : 'inherit'}
                onClick={() => handleTabChange(null, 'outputs')}
                startIcon={<OutputIcon fontSize="small" />}
                sx={{ 
                  minWidth: 0,
                  fontSize: '0.7rem',
                  color: detailsTab === 'outputs' ? 'primary.main' : 'text.secondary',
                  '&:hover': {
                    bgcolor: 'transparent',
                    color: detailsTab === 'outputs' ? 'primary.main' : 'text.primary'
                  },
                  p: 0.5
                }}
              >
                Outputs
              </Button>
            )}
          </Box>
        )}
      </Box>
      
      {/* Content panel - only visible when a tab is selected */}
      <Collapse in={detailsTab !== null}>
        <Box sx={{ mt: 0.5, ml: 4, mb: 1 }}>
          {/* Render appropriate content based on selected tab */}
          {detailsTab === 'inputs' && step.inputs && (
            <StepDataDisplay 
              label="Inputs" 
              icon={<InputIcon fontSize="small" color="primary" />} 
              data={step.inputs}
            />
          )}
          
          {detailsTab === 'outputs' && step.outputs && (
            <StepDataDisplay 
              label="Outputs" 
              icon={<OutputIcon fontSize="small" color="success" />} 
              data={step.outputs}
            />
          )}
        </Box>
      </Collapse>
    </Box>
  );
};

export default ProcessStep; 