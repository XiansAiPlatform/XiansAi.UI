import { Box, Typography, TextField, ToggleButtonGroup, ToggleButton } from '@mui/material';

const EmptyState = ({ 
  searchQuery,
  onSearchChange,
  timeFilter,
  onTimeFilterChange,
  filter,
  onFilterChange 
}) => (
  <Box sx={{ margin: 'var(--spacing-md)' }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
      <Typography 
        variant="h4" 
        component="h1"
        sx={{
          fontWeight: 'var(--font-weight-semibold)',
          letterSpacing: 'var(--letter-spacing-tight)',
          color: 'var(--text-primary)',
        }}
      >
        Flow Definitions
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          size="small"
          placeholder="Search definitions..."
          value={searchQuery}
          onChange={onSearchChange}
          sx={{
            width: '250px',
            '& .MuiOutlinedInput-root': {
              borderRadius: 'var(--radius-md)',
            }
          }}
        />
        <ToggleButtonGroup
          value={timeFilter}
          exclusive
          onChange={onTimeFilterChange}
          size="small"
        >
          <ToggleButton value="7days">Last 7 Days</ToggleButton>
          <ToggleButton value="30days">Last 30 Days</ToggleButton>
          <ToggleButton value="all">All Time</ToggleButton>
        </ToggleButtonGroup>
        <ToggleButtonGroup
          value={filter}
          exclusive
          onChange={onFilterChange}
          size="small"
        >
          <ToggleButton value="all">All</ToggleButton>
          <ToggleButton value="mine">Mine</ToggleButton>
        </ToggleButtonGroup>
      </Box>
    </Box>
    <Box
      sx={{
        p: 'var(--spacing-xl)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--spacing-md)',
        textAlign: 'center',
        backgroundColor: 'var(--bg-paper)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
      }}
    >
      <Typography variant="h6" sx={{ color: 'var(--text-primary)' }}>
        No Flow Definitions Found
      </Typography>
      <Typography variant="body1" sx={{ color: 'var(--text-secondary)', maxWidth: '600px' }}>
        Flow definitions are automatically created when flows are run for the first time or when the flow code is modified. 
        To create definitions, please run your flows through the Flow Runner.
      </Typography>
    </Box>
  </Box>
);

export default EmptyState; 