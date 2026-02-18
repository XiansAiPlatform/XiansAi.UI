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
import { useActivationsApi } from '../../services/activations-api';

const ActivationSelector = ({
  selectedActivation,
  onActivationChange,
  disabled = false,
  showAllOption = true,
  size = 'small'
}) => {
  const [activations, setActivations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const isMobile = useMediaQuery('(max-width:768px)');
  const activationsApi = useActivationsApi();

  const loadActivations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await activationsApi.getActivations();
      setActivations(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Failed to load activations:', err);
      setError('Failed to load activations');
      setActivations([]);
    } finally {
      setLoading(false);
    }
  }, [activationsApi]);

  useEffect(() => {
    loadActivations();
  }, [loadActivations]);

  const handleChange = (event) => {
    const value = event.target.value;
    onActivationChange(value === 'all' ? null : value);
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
          Loading activations...
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
      disabled={disabled}
    >
      <InputLabel id="activation-selector-label">
        {selectedActivation ? 'Activation' : (isMobile ? 'Select' : 'Choose Activation')}
      </InputLabel>
      <Select
        labelId="activation-selector-label"
        id="activation-selector"
        value={selectedActivation || 'all'}
        label={selectedActivation ? 'Activation' : (isMobile ? 'Select' : 'Choose Activation')}
        onChange={handleChange}
        displayEmpty
        renderValue={(selected) => {
          if (selected === 'all') {
            return (
              <Chip
                label="All Activations"
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
                All Activations
              </Typography>
            </Box>
          </MenuItem>
        )}
        {activations.map((name) => (
          <MenuItem key={name} value={name}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: 'var(--success-color)'
              }} />
              <Typography variant="body2">
                {name}
              </Typography>
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default ActivationSelector;
