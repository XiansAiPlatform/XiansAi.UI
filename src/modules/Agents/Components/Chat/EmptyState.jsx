import React from 'react';
import { Box, Typography } from '@mui/material';

const EmptyState = () => (
  <Box 
    sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      height: '100%',
      flexDirection: 'column',
      p: 3
    }}
  >
    <Typography variant="h5" gutterBottom>
      Select an AI Agent
    </Typography>
    <Typography variant="body1" color="text.secondary" align="center">
      Choose an agent from the sidebar to start a conversation.
    </Typography>
  </Box>
);

export default EmptyState; 