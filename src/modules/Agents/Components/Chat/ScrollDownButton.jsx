import React from 'react';
import { IconButton } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

const ScrollDownButton = ({ onClick }) => (
  <IconButton 
    size="small"
    onClick={onClick}
    sx={{ 
      position: 'absolute', 
      bottom: 80, 
      right: 16, 
      boxShadow: 2, 
      bgcolor: 'background.paper',
      zIndex: 10,
      border: '1px solid',
      borderColor: 'divider'
    }}
  >
    <KeyboardArrowDownIcon />
  </IconButton>
);

export default ScrollDownButton; 