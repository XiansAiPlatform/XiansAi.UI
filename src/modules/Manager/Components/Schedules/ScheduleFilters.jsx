import React from 'react';
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Grid,
  Paper,
  InputAdornment,
  IconButton,
  Tooltip,
  Typography,
  Chip
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import FilterAltIcon from '@mui/icons-material/FilterAlt';

const ScheduleFilters = ({ filters, onFilterChange, onRefresh, isLoading = false }) => {
  const handleFilterUpdate = (field, value) => {
    onFilterChange({
      ...filters,
      [field]: value
    });
  };

  const handleClearFilters = () => {
    onFilterChange({
      agentName: '',
      workflowType: '',
      status: '',
      searchTerm: ''
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <Paper 
      sx={{ 
        p: 3, 
        mb: 3, 
        border: '1px solid',
        borderColor: 'divider'
      }}
      elevation={0}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <FilterAltIcon sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Filter Schedules
        </Typography>
      </Box>
      
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            label="Search"
            placeholder="Search schedules..."
            value={filters.searchTerm}
            onChange={(e) => handleFilterUpdate('searchTerm', e.target.value)}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: filters.searchTerm && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => handleFilterUpdate('searchTerm', '')}
                    edge="end"
                  >
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
          <TextField
            fullWidth
            label="Agent Name"
            placeholder="Enter agent name"
            value={filters.agentName}
            onChange={(e) => handleFilterUpdate('agentName', e.target.value)}
            size="small"
            InputProps={{
              endAdornment: filters.agentName && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => handleFilterUpdate('agentName', '')}
                    edge="end"
                  >
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
          <TextField
            fullWidth
            label="Workflow Type"
            placeholder="Enter workflow type"
            value={filters.workflowType}
            onChange={(e) => handleFilterUpdate('workflowType', e.target.value)}
            size="small"
            InputProps={{
              endAdornment: filters.workflowType && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => handleFilterUpdate('workflowType', '')}
                    edge="end"
                  >
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
          <FormControl fullWidth size="small">
            <Select
              value={filters.status}
              onChange={(e) => handleFilterUpdate('status', e.target.value)}
              displayEmpty
              renderValue={(selected) => {
                if (!selected) {
                  return <em style={{ color: '#666' }}>All Status</em>;
                }
                return selected;
              }}
            >
              <MenuItem value="">
                <em>All Status</em>
              </MenuItem>
              <MenuItem value="Running">Running</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
              <MenuItem value="Failed">Failed</MenuItem>
              <MenuItem value="Canceled">Canceled</MenuItem>
              <MenuItem value="Terminated">Terminated</MenuItem>
              <MenuItem value="TimedOut">Timed Out</MenuItem>
              <MenuItem value="ContinuedAsNew">Continued As New</MenuItem>
              <MenuItem value="Suspended">Suspended</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={12} md={3}>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Tooltip title="Refresh schedules">
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={onRefresh}
                disabled={isLoading}
                size="small"
                sx={{
                  minWidth: 'auto',
                }}
              >
                {isLoading ? 'Loading...' : 'Refresh'}
              </Button>
            </Tooltip>
            
            {hasActiveFilters && (
              <Tooltip title="Clear all filters">
                <Button
                  variant="text"
                  startIcon={<ClearIcon />}
                  onClick={handleClearFilters}
                  size="small"
                  color="secondary"
                >
                  Clear
                </Button>
              </Tooltip>
            )}
          </Box>
        </Grid>
      </Grid>

      {hasActiveFilters && (
        <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Typography variant="body2" color="text.secondary" sx={{ alignSelf: 'center' }}>
            Active filters:
          </Typography>
          
          {filters.searchTerm && (
            <Chip
              label={`Search: "${filters.searchTerm}"`}
              onDelete={() => handleFilterUpdate('searchTerm', '')}
              size="small"
              color="primary"
              variant="outlined"
            />
          )}
          
          {filters.agentName && (
            <Chip
              label={`Agent: ${filters.agentName}`}
              onDelete={() => handleFilterUpdate('agentName', '')}
              size="small"
              color="primary"
              variant="outlined"
            />
          )}
          
          {filters.workflowType && (
            <Chip
              label={`Workflow: ${filters.workflowType}`}
              onDelete={() => handleFilterUpdate('workflowType', '')}
              size="small"
              color="primary"
              variant="outlined"
            />
          )}
          
          {filters.status && (
            <Chip
              label={`Status: ${filters.status}`}
              onDelete={() => handleFilterUpdate('status', '')}
              size="small"
              color="primary"
              variant="outlined"
            />
          )}
        </Box>
      )}
    </Paper>
  );
};

export default ScheduleFilters;