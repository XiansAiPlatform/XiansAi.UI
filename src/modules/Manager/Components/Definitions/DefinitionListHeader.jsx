import { ToggleButtonGroup, ToggleButton } from '@mui/material';
import PageLayout from '../Common/PageLayout';
import PageFilters from '../Common/PageFilters';

const DefinitionListHeader = ({ 
  searchQuery, 
  onSearchChange, 
  timeFilter, 
  onTimeFilterChange 
}) => {
  const headerActions = (
    <PageFilters
      searchValue={searchQuery}
      onSearchChange={onSearchChange}
      searchPlaceholder="Search by name or agent..."
      additionalFilters={
        <ToggleButtonGroup
          value={timeFilter}
          exclusive
          onChange={onTimeFilterChange}
          size="small"
          sx={{ 
            backgroundColor: 'var(--bg-main)',
            borderRadius: 'var(--radius-md)',
            '& .MuiToggleButton-root': {
              border: 'none',
              borderRadius: 'var(--radius-md)',
              px: 2,
              py: 0.75,
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font-family)',
              fontSize: '0.875rem',
              fontWeight: 500,
              textTransform: 'none',
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: 'var(--bg-hover)',
                color: 'var(--text-primary)'
              },
              '&.Mui-selected': {
                backgroundColor: 'var(--primary)',
                color: 'white',
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: 'var(--primary-dark)'
                }
              },
              '&:first-of-type': {
                borderTopLeftRadius: 'var(--radius-md)',
                borderBottomLeftRadius: 'var(--radius-md)'
              },
              '&:last-of-type': {
                borderTopRightRadius: 'var(--radius-md)',
                borderBottomRightRadius: 'var(--radius-md)'
              }
            }
          }}
        >
          <ToggleButton value="7days">Last 7 Days</ToggleButton>
          <ToggleButton value="30days">Last 30 Days</ToggleButton>
          <ToggleButton value="all">All Time</ToggleButton>
        </ToggleButtonGroup>
      }
    />
  );

  return null; // Header is handled by PageLayout in parent
};

export const getHeaderActions = ({ searchQuery, onSearchChange, timeFilter, onTimeFilterChange }) => (
  <PageFilters
    searchValue={searchQuery}
    onSearchChange={onSearchChange}
    searchPlaceholder="Search by name or agent..."
    additionalFilters={
      <ToggleButtonGroup
        value={timeFilter}
        exclusive
        onChange={onTimeFilterChange}
        size="small"
        sx={{ 
          backgroundColor: 'var(--bg-main)',
          borderRadius: 'var(--radius-md)',
          '& .MuiToggleButton-root': {
            border: 'none',
            borderRadius: 'var(--radius-md)',
            px: 2,
            py: 0.75,
            color: 'var(--text-secondary)',
            fontFamily: 'var(--font-family)',
            fontSize: '0.875rem',
            fontWeight: 500,
            textTransform: 'none',
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: 'var(--bg-hover)',
              color: 'var(--text-primary)'
            },
            '&.Mui-selected': {
              backgroundColor: 'var(--primary)',
              color: 'white',
              fontWeight: 600,
              '&:hover': {
                backgroundColor: 'var(--primary-dark)'
              }
            },
            '&:first-of-type': {
              borderTopLeftRadius: 'var(--radius-md)',
              borderBottomLeftRadius: 'var(--radius-md)'
            },
            '&:last-of-type': {
              borderTopRightRadius: 'var(--radius-md)',
              borderBottomRightRadius: 'var(--radius-md)'
            }
          }
        }}
      >
        <ToggleButton value="7days">Last 7 Days</ToggleButton>
        <ToggleButton value="30days">Last 30 Days</ToggleButton>
        <ToggleButton value="all">All Time</ToggleButton>
      </ToggleButtonGroup>
    }
  />
);

export default DefinitionListHeader; 