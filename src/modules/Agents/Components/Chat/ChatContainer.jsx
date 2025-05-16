import React from 'react';
import { Box } from '@mui/material';

const ChatContainer = ({ children, onClick, ...props }) => (
  <Box 
    onClick={onClick}
    sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%',
      maxHeight: '100%',
      position: 'relative',
      overflow: 'hidden'
    }}
    {...props}
  >
    {children}
  </Box>
);

export default ChatContainer; 