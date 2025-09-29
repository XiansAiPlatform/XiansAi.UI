import { Box, TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const PageFilters = ({ 
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  additionalFilters,
  className = '',
  fullWidth = false
}) => {
  return (
    <Box 
      className={`page-filters ${className}`}
      sx={{ 
        display: 'flex', 
        gap: 2, 
        alignItems: 'center',
        flexWrap: 'wrap',
        width: fullWidth ? '100%' : 'auto',
        backgroundColor: 'var(--bg-paper)',
        padding: 2,
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          borderColor: 'var(--border-color-hover)',
          boxShadow: 'var(--shadow-sm)'
        }
      }}
    >
      <TextField
        size="small"
        placeholder={searchPlaceholder}
        value={searchValue}
        onChange={onSearchChange}
        sx={{
          minWidth: { xs: '100%', sm: '300px' },
          flex: fullWidth ? 1 : 'none',
          '& .MuiOutlinedInput-root': {
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-main)',
            fontFamily: 'var(--font-family)',
            fontSize: '0.875rem',
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: 'var(--bg-paper)',
            },
            '&.Mui-focused': {
              backgroundColor: 'var(--bg-paper)',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'var(--primary)',
                borderWidth: '2px'
              }
            }
          },
          '& .MuiInputBase-input': {
            fontFamily: 'var(--font-family)',
            '&::placeholder': {
              color: 'var(--text-light)',
              opacity: 0.8
            }
          }
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ 
                color: 'var(--text-light)', 
                fontSize: '1.25rem'
              }} />
            </InputAdornment>
          ),
        }}
      />
      
      {additionalFilters}
    </Box>
  );
};

export default PageFilters;
