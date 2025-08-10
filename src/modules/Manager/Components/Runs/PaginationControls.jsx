import {
  Box,
  Button,
  Typography,
  useMediaQuery,
  IconButton,
  Select,
  MenuItem,
  FormControl,
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  FirstPage,
} from '@mui/icons-material';

const PaginationControls = ({
  currentPage = 1,
  pageSize = 20,
  hasNextPage = false,
  hasPreviousPage = false,
  totalCount = null,
  onPageChange,
  onPageSizeChange,
  loading = false,
  itemName = 'workflows'
}) => {
  const isMobile = useMediaQuery('(max-width:768px)');
  const isSmallMobile = useMediaQuery('(max-width:480px)');

  const handlePreviousPage = () => {
    if (hasPreviousPage && !loading) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (hasNextPage && !loading) {
      onPageChange(currentPage + 1);
    }
  };

  const handleFirstPage = () => {
    if (currentPage > 1 && !loading) {
      onPageChange(1);
    }
  };

  const handlePageSizeChange = (event) => {
    if (!loading) {
      onPageSizeChange(event.target.value);
    }
  };

  const formatPageInfo = () => {
    const startItem = ((currentPage - 1) * pageSize) + 1;
    const endItem = currentPage * pageSize;
    
    if (totalCount !== null) {
      const actualEndItem = Math.min(endItem, totalCount);
      return `${startItem}-${actualEndItem} of ${totalCount}`;
    } else {
      return `Page ${currentPage}`;
    }
  };

  if (isSmallMobile) {
    // Simplified mobile layout
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 1,
        py: 2,
        px: 1
      }}>
        <Typography variant="body2" color="text.secondary">
          {formatPageInfo()} {itemName}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <IconButton
            onClick={handlePreviousPage}
            disabled={!hasPreviousPage || loading}
            size="small"
            sx={{
              backgroundColor: 'var(--bg-paper)',
              border: '1px solid var(--border-color)',
              '&:hover': {
                backgroundColor: 'var(--bg-hover)',
              },
              '&:disabled': {
                opacity: 0.5,
              }
            }}
          >
            <ChevronLeft fontSize="small" />
          </IconButton>
          
          <IconButton
            onClick={handleNextPage}
            disabled={!hasNextPage || loading}
            size="small"
            sx={{
              backgroundColor: 'var(--bg-paper)',
              border: '1px solid var(--border-color)',
              '&:hover': {
                backgroundColor: 'var(--bg-hover)',
              },
              '&:disabled': {
                opacity: 0.5,
              }
            }}
          >
            <ChevronRight fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexDirection: isMobile ? 'column' : 'row',
      gap: isMobile ? 2 : 1,
      py: 2,
      px: isMobile ? 1 : 0,
      borderTop: '1px solid var(--border-color)',
      backgroundColor: 'var(--bg-paper)',
      borderRadius: '0 0 12px 12px'
    }}>
      
      {/* Page Size Selector */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1,
        order: isMobile ? 2 : 1
      }}>
        <Typography variant="body2" color="text.secondary">
          Show:
        </Typography>
        <FormControl size="small" sx={{ minWidth: 80 }}>
          <Select
            value={pageSize}
            onChange={handlePageSizeChange}
            disabled={loading}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'var(--bg-paper)',
                border: '1px solid var(--border-color)',
                borderRadius: 1,
                height: 32,
              }
            }}
          >
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={20}>20</MenuItem>
            <MenuItem value={50}>50</MenuItem>
            <MenuItem value={100}>100</MenuItem>
          </Select>
        </FormControl>
        <Typography variant="body2" color="text.secondary">
          per page
        </Typography>
      </Box>

      {/* Page Info */}
      <Box sx={{ 
        order: isMobile ? 1 : 2,
        textAlign: isMobile ? 'center' : 'left'
      }}>
        <Typography variant="body2" color="text.secondary">
          {formatPageInfo()} {itemName}
        </Typography>
      </Box>

      {/* Navigation Controls */}
      <Box sx={{ 
        display: 'flex', 
        gap: 0.5,
        order: isMobile ? 3 : 3
      }}>
        <Button
          onClick={handleFirstPage}
          disabled={currentPage <= 1 || loading}
          size="small"
          variant="outlined"
          startIcon={<FirstPage />}
          sx={{
            minWidth: 'auto',
            px: 1,
            backgroundColor: 'var(--bg-paper)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-secondary)',
            '&:hover': {
              backgroundColor: 'var(--bg-hover)',
              borderColor: 'var(--border-hover)',
            },
            '&:disabled': {
              opacity: 0.5,
            }
          }}
        >
          {!isMobile && 'First'}
        </Button>
        
        <Button
          onClick={handlePreviousPage}
          disabled={!hasPreviousPage || loading}
          size="small"
          variant="outlined"
          startIcon={<ChevronLeft />}
          sx={{
            backgroundColor: 'var(--bg-paper)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-secondary)',
            '&:hover': {
              backgroundColor: 'var(--bg-hover)',
              borderColor: 'var(--border-hover)',
            },
            '&:disabled': {
              opacity: 0.5,
            }
          }}
        >
          Previous
        </Button>
        
        <Button
          onClick={handleNextPage}
          disabled={!hasNextPage || loading}
          size="small"
          variant="outlined"
          endIcon={<ChevronRight />}
          sx={{
            backgroundColor: 'var(--bg-paper)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-secondary)',
            '&:hover': {
              backgroundColor: 'var(--bg-hover)',
              borderColor: 'var(--border-hover)',
            },
            '&:disabled': {
              opacity: 0.5,
            }
          }}
        >
          Next
        </Button>
      </Box>
    </Box>
  );
};

export default PaginationControls;
