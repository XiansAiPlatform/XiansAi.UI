import { useState, useEffect } from 'react';
import { Box, Typography, Link, CircularProgress } from '@mui/material';

/**
 * Enhanced loading component with refresh option after timeout
 * 
 * @param {Object} props - Component props
 * @param {string} props.message - Loading message to display (default: 'Loading...')
 * @param {number} props.refreshTimeout - Time in ms before showing refresh link (default: 10000)
 * @param {string} props.height - Height of the container (default: '100vh')
 * @param {boolean} props.showRefreshOption - Whether to show refresh option after timeout (default: true)
 * @returns {React.ReactElement} - The enhanced loading component
 */
const EnhancedLoadingSpinner = ({ 
  message = 'Loading...', 
  refreshTimeout = 5000,
  height = '100vh',
  showRefreshOption = true
}) => {
  const [showRefresh, setShowRefresh] = useState(false);

  useEffect(() => {
    if (!showRefreshOption) return;

    const timer = setTimeout(() => {
      setShowRefresh(true);
    }, refreshTimeout);

    return () => clearTimeout(timer);
  }, [refreshTimeout, showRefreshOption]);

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height={height}
    >
      <CircularProgress color="primary" size={60} thickness={4} />
      <Typography variant="h6" color="textSecondary" style={{ marginTop: 16 }}>
        {message}
      </Typography>
      {showRefreshOption && showRefresh && (
        <Box mt={2} textAlign="center">
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Taking longer than expected?
          </Typography>
          <Link
            component="button"
            variant="body2"
            onClick={handleRefresh}
            sx={{
              cursor: 'pointer',
              textDecoration: 'underline',
              color: 'primary.main',
              '&:hover': {
                color: 'primary.dark',
              },
            }}
          >
            Refresh the page
          </Link>
        </Box>
      )}
    </Box>
  );
};

export default EnhancedLoadingSpinner;
