import { CircularProgress, Box, Typography } from '@mui/material';

const LoadingSpinner = ({ message = 'Loading...' }) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="100vh"
    >
      <CircularProgress color="primary" size={60} thickness={4} />
      <Typography variant="h6" color="textSecondary" style={{ marginTop: 16 }}>
        {message}
      </Typography>
    </Box>
  );
};

export default LoadingSpinner; 
