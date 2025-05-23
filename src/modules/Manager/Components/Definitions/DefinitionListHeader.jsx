import { Box, Typography, TextField, ToggleButtonGroup, ToggleButton, Stack } from '@mui/material';

const DefinitionListHeader = ({ 
  searchQuery, 
  onSearchChange, 
  timeFilter, 
  onTimeFilterChange 
}) => {
  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      mb: 4,
      flexDirection: { xs: 'column', md: 'row' },
      gap: { xs: 2, md: 0 }
    }}>
      <Typography 
        variant="h4" 
        component="h1"
        sx={{
          fontWeight: 'var(--font-weight-semibold)',
          letterSpacing: 'var(--letter-spacing-tight)',
          color: 'var(--text-primary)',
        }}
      >
        Agent Definitions
      </Typography>
      <Box sx={{ 
        display: 'flex', 
        gap: 2, 
        alignItems: 'center',
        flexDirection: { xs: 'column', sm: 'row' },
        width: { xs: '100%', sm: 'auto' }
      }}>
        <TextField
          size="small"
          placeholder="Search by name or agent..."
          value={searchQuery}
          onChange={onSearchChange}
          sx={{
            width: { xs: '100%', sm: '250px' },
            '& .MuiOutlinedInput-root': {
              borderRadius: 'var(--radius-md)',
            }
          }}
        />
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          spacing={2}
          width={{ xs: '100%', sm: 'auto' }}
        >
          <ToggleButtonGroup
            value={timeFilter}
            exclusive
            onChange={onTimeFilterChange}
            size="small"
            sx={{ 
              width: { xs: '100%', sm: 'auto' },
              '& .MuiToggleButton-root': {
                borderColor: 'var(--border-light)',
                color: 'var(--text-secondary)',
                textTransform: 'none',
                '&.Mui-selected': {
                  backgroundColor: 'var(--bg-selected)',
                  color: 'var(--text-primary)',
                  fontWeight: 500
                }
              }
            }}
          >
            <ToggleButton value="7days">Last 7 Days</ToggleButton>
            <ToggleButton value="30days">Last 30 Days</ToggleButton>
            <ToggleButton value="all">All Time</ToggleButton>
          </ToggleButtonGroup>
        </Stack>
      </Box>
    </Box>
  );
};

export default DefinitionListHeader; 