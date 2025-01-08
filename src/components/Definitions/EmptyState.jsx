import { Box, Typography } from '@mui/material';

const EmptyState = () => (
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
      margin: 'var(--spacing-md)',
    }}
  >
    <Typography variant="h6" sx={{ color: 'var(--text-primary)' }}>
      Flow Definitions
    </Typography>
    <Typography variant="body1" sx={{ color: 'var(--text-secondary)', maxWidth: '600px' }}>
      Flow definitions are automatically created when flows are run for the first time or when the flow code is modified. 
      To create definitions, please run your flows through the Flow Runner.
    </Typography>
  </Box>
);

export default EmptyState; 