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
import { useAgentsApi } from '../../services/agents-api';

const AgentSelector = ({ 
  selectedAgent, 
  onAgentChange, 
  disabled = false, 
  showAllOption = true,
  size = "small" 
}) => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const isMobile = useMediaQuery('(max-width:768px)');
  const agentsApi = useAgentsApi();

  const loadAgents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await agentsApi.getAllAgents();
      if (response && Array.isArray(response)) {
        setAgents(response);
      } else {
        console.warn('Invalid agents response:', response);
        setAgents([]);
      }
    } catch (err) {
      console.error('Failed to load agents:', err);
      setError('Failed to load agents');
      setAgents([]);
    } finally {
      setLoading(false);
    }
  }, [agentsApi]);

  useEffect(() => {
    loadAgents();
  }, [loadAgents]);

  const handleChange = (event) => {
    const value = event.target.value;
    onAgentChange(value === 'all' ? null : value);
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
          Loading agents...
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

  return (
    <FormControl 
      size={size}
      variant="outlined"
      sx={{ 
        minWidth: isMobile ? 140 : 180,
        '& .MuiOutlinedInput-root': {
          backgroundColor: 'var(--bg-paper)',
          borderRadius: 3,
          border: 'none',
          boxShadow: 'var(--shadow-sm)',
          transition: 'all 0.2s ease',
          '&:hover': {
            boxShadow: 'var(--shadow-md)',
            transform: 'translateY(-1px)',
          },
          '&.Mui-focused': {
            boxShadow: 'var(--shadow-focus)',
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
      disabled={disabled}
    >
      <InputLabel id="agent-selector-label">
        {selectedAgent ? 'Agent' : (isMobile ? 'Select' : 'Choose Agent')}
      </InputLabel>
      <Select
        labelId="agent-selector-label"
        id="agent-selector"
        value={selectedAgent || 'all'}
        label={selectedAgent ? 'Agent' : (isMobile ? 'Select' : 'Choose Agent')}
        onChange={handleChange}
        displayEmpty
        renderValue={(selected) => {
          if (selected === 'all') {
            return (
              <Chip 
                label="All Agents" 
                size="small" 
                sx={{ 
                  backgroundColor: 'var(--primary-light)',
                  color: 'var(--primary-color)',
                  fontWeight: 500,
                  fontSize: '0.75rem'
                }} 
              />
            );
          }
          return (
            <Chip 
              label={selected} 
              size="small" 
              sx={{ 
                backgroundColor: 'var(--success-light)',
                color: 'var(--success-dark)',
                fontWeight: 500,
                fontSize: '0.75rem'
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
                All Agents
              </Typography>
            </Box>
          </MenuItem>
        )}
        {agents.map((agent) => (
          <MenuItem key={agent} value={agent}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ 
                width: 8, 
                height: 8, 
                borderRadius: '50%', 
                backgroundColor: 'var(--success-color)' 
              }} />
              <Typography variant="body2">
                {agent}
              </Typography>
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default AgentSelector;
