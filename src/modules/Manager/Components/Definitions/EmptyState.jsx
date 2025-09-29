import { Box, Typography } from '@mui/material';
import PageLayout from '../Common/PageLayout';
import { getHeaderActions } from './DefinitionListHeader';

const EmptyState = ({ 
  searchQuery,
  onSearchChange,
  timeFilter,
  onTimeFilterChange,
}) => (
  <PageLayout
    title="Agent Definitions"
    headerActions={getHeaderActions({
      searchQuery,
      onSearchChange,
      timeFilter,
      onTimeFilterChange
    })}
  >
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
        mt: 4
      }}
    >
      <Typography variant="h6" sx={{ color: 'var(--text-primary)', fontWeight: 600 }}>
        Your Agent Definitions
      </Typography>
      <Typography variant="body1" sx={{ color: 'var(--text-secondary)', maxWidth: '600px' }}>
        Agent definitions are automatically created when flows are run for the first time or when the flow code is modified. 
        To create definitions, please run your flows through the Agent Runner.
      </Typography>
    </Box>
  </PageLayout>
);

export default EmptyState; 