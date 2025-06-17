import { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';

/**
 * A typing indicator component that shows progressive messages based on elapsed time
 */
const TypingIndicator = () => {
  const [message, setMessage] = useState('Contacting the agent...');

  useEffect(() => {
    // Timer for second message after 5 seconds
    const timer1 = setTimeout(() => {
      setMessage('Awaiting reply...');
    }, 5000);

    // Timer for third message after 60 seconds total
    const timer2 = setTimeout(() => {
      setMessage('Possible error, is agent running?');
    }, 60000);

    // Cleanup timers on component unmount
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <Box sx={{ p: 2, textAlign: 'center' }}>
      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
};

export default TypingIndicator; 