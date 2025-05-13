import React from 'react';
import { Box } from '@mui/material';

const ChatContainer = ({ children }) => (
  <Box 
    sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%',
      maxHeight: '100%',
      position: 'relative',
      overflow: 'hidden'
    }}
  >
    {children}
  </Box>
);

export default ChatContainer; 