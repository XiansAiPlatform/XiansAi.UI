import { useEffect } from 'react';
import { Box, Typography, Container, CircularProgress } from '@mui/material';

const Landing = () => {
  useEffect(() => {
    // Check if we came here from a 403 error
    const from403 = sessionStorage.getItem('from403');
    
    // Check if we're in a redirect loop
    const loopCount = parseInt(sessionStorage.getItem('landingLoopCount') || '0', 10);
    const lastVisit = parseInt(sessionStorage.getItem('landingLastVisit') || '0', 10);
    const now = Date.now();
    
    // Reset counter if more than 10 seconds have passed since last visit
    if (now - lastVisit > 10000) {
      sessionStorage.setItem('landingLoopCount', '0');
      sessionStorage.setItem('landingLastVisit', now.toString());
      sessionStorage.removeItem('from403');
      // First visit or after timeout - redirect to manager
      window.location.href = '/manager';
      return;
    }
    
    // Increment loop counter
    const newCount = loopCount + 1;
    sessionStorage.setItem('landingLoopCount', newCount.toString());
    sessionStorage.setItem('landingLastVisit', now.toString());
    
    // If we've been here more than twice in 10 seconds, we're in a loop
    // Force logout to break the loop and clear session
    if (newCount > 2 || (from403 && newCount > 1)) {
      console.warn('Redirect loop detected (403 error loop). Forcing logout to clear session...');
      sessionStorage.removeItem('landingLoopCount');
      sessionStorage.removeItem('landingLastVisit');
      sessionStorage.removeItem('from403');
      window.location.href = '/manager/logout';
      return;
    }
    
    // Clear the 403 flag after first check
    if (from403) {
      sessionStorage.removeItem('from403');
    }
    
    // Normal case - redirect to manager
    window.location.href = '/manager';
  }, []);

  // Show a loading state while redirecting
  return (
    <Container maxWidth='md'>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          textAlign: 'center',
          py: 4,
        }}
      >
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Redirecting...</Typography>
      </Box>
    </Container>
  );
};

export default Landing; 