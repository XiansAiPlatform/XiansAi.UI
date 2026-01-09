import { useState, useEffect, useCallback } from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useMediaQuery,
  CircularProgress,
  Box,
  Typography,
  Chip
} from '@mui/material';
import { useWorkflowApi } from '../../services/workflow-api';

const WorkflowTypeSelector = ({ 
  selectedAgent,
  selectedWorkflowType, 
  onWorkflowTypeChange, 
  disabled = false, 
  showAllOption = true,
  size = "small" 
}) => {
  const [workflowTypes, setWorkflowTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const isMobile = useMediaQuery('(max-width:768px)');
  const workflowApi = useWorkflowApi();

  const loadWorkflowTypes = useCallback(async () => {
    if (!selectedAgent) {
      setWorkflowTypes([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await workflowApi.getWorkflowTypes(selectedAgent);
      if (response && Array.isArray(response)) {
        setWorkflowTypes(response);
      } else {
        console.warn('Invalid workflow types response:', response);
        setWorkflowTypes([]);
      }
    } catch (err) {
      console.error('Failed to load workflow types:', err);
      setError('Failed to load workflow types');
      setWorkflowTypes([]);
    } finally {
      setLoading(false);
    }
  }, [selectedAgent, workflowApi]);

  useEffect(() => {
    loadWorkflowTypes();
  }, [loadWorkflowTypes]);

  // Reset selected workflow type when agent changes
  useEffect(() => {
    if (!selectedAgent) {
      onWorkflowTypeChange(null);
    }
  }, [selectedAgent, onWorkflowTypeChange]);

  const handleChange = (event) => {
    const value = event.target.value;
    onWorkflowTypeChange(value === 'all' ? null : value);
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1,
        minWidth: isMobile ? 120 : 160
      }}>
        <CircularProgress size={16} />
        <Typography variant="body2" color="text.secondary">
          Loading types...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ minWidth: isMobile ? 120 : 160 }}>
        <Typography variant="body2" color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  if (!selectedAgent) {
    return null;
  }

  return (
    <FormControl 
      size={size}
      variant="outlined"
      sx={{ 
        minWidth: isMobile ? 140 : 180,
        '& .MuiOutlinedInput-root': {
          borderRadius: 3,
          border: 'none',
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'translateY(-1px)',
          },
          '&.Mui-focused': {
            transform: 'translateY(-1px)',
          }
        },
        '& .MuiOutlinedInput-notchedOutline': {
          border: 'none',
        },
        '& .MuiInputLabel-root': {
          color: 'var(--text-secondary)',
          fontSize: isMobile ? '0.8rem' : '0.875rem',
          fontWeight: 500,
          '&.Mui-focused': {
            color: 'var(--primary-color)',
          }
        },
        '& .MuiSelect-select': {
          color: 'var(--text-primary)',
          fontSize: isMobile ? '0.875rem' : '1rem',
          fontWeight: 500,
        }
      }}
      disabled={disabled || !selectedAgent}
    >
      <InputLabel id="workflow-type-selector-label">
        {selectedWorkflowType ? 'Type' : (isMobile ? 'Select' : 'Choose Type')}
      </InputLabel>
      <Select
        labelId="workflow-type-selector-label"
        id="workflow-type-selector"
        value={selectedWorkflowType || 'all'}
        label={selectedWorkflowType ? 'Type' : (isMobile ? 'Select' : 'Choose Type')}
        onChange={handleChange}
        displayEmpty
        renderValue={(selected) => {
          if (selected === 'all') {
            return (
              <Chip 
                label="All Types" 
                size="small" 
                sx={{ 
                  backgroundColor: 'rgba(25, 118, 210, 0.08)',
                  color: 'var(--primary-color)',
                  fontWeight: 500,
                  fontSize: '0.75rem',
                  border: '1px solid rgba(25, 118, 210, 0.2)'
                }} 
              />
            );
          }
          return (
            <Chip 
              label={selected} 
              size="small" 
              sx={{ 
                backgroundColor: 'rgba(76, 175, 80, 0.08)',
                color: '#2e7d32',
                fontWeight: 500,
                fontSize: '0.75rem',
                border: '1px solid rgba(76, 175, 80, 0.2)'
              }} 
            />
          );
        }}
        MenuProps={{
          PaperProps: {
            sx: {
              backgroundColor: 'var(--bg-paper)',
              borderRadius: 3,
              boxShadow: 'var(--shadow-lg)',
              border: '1px solid var(--border-color)',
              mt: 1,
              '& .MuiMenuItem-root': {
                color: 'var(--text-primary)',
                fontSize: isMobile ? '0.875rem' : '1rem',
                borderRadius: 2,
                mx: 1,
                my: 0.5,
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: 'var(--bg-hover)',
                  transform: 'translateX(4px)',
                },
                '&.Mui-selected': {
                  backgroundColor: 'var(--primary-light)',
                  color: 'var(--primary-color)',
                  fontWeight: 600,
                  '&:hover': {
                    backgroundColor: 'var(--primary-light)',
                    transform: 'translateX(4px)',
                  }
                }
              }
            }
          }
        }}
      >
        {showAllOption && (
          <MenuItem value="all">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ 
                width: 8, 
                height: 8, 
                borderRadius: '50%', 
                backgroundColor: 'var(--primary-color)' 
              }} />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                All Types
              </Typography>
            </Box>
          </MenuItem>
        )}
        {workflowTypes.map((type) => (
          <MenuItem key={type} value={type}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ 
                width: 8, 
                height: 8, 
                borderRadius: '50%', 
                backgroundColor: 'var(--success-color)' 
              }} />
              <Typography variant="body2">
                {type}
              </Typography>
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default WorkflowTypeSelector;
