import React, { useEffect, useRef } from 'react';
import { Box, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const RightSlider = ({ onClose, children }) => {
  const sliderRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sliderRef.current && !sliderRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <Box
      ref={sliderRef}
      sx={{ 
        position: 'fixed',
        top: 0,
        right: 0,
        backgroundColor: '#fff',
        padding: '24px',
        overflowY: 'auto', 
        height: '100vh',
        width: '50vw',
        maxWidth: '1200px',
        boxShadow: '-4px 0 8px rgba(0, 0, 0, 0.1)',
        borderLeft: '1px solid rgba(0, 0, 0, 0.12)',
        zIndex: 1200
      }}
    >
      <IconButton 
        onClick={onClose} 
        sx={{ 
          position: 'absolute',
          top: '12px',
          right: '12px',
          color: 'grey.600',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
            color: 'grey.900'
          }
        }}
      >
        <CloseIcon />
      </IconButton>
      <Box sx={{ mt: 6 }}>
        {children}
      </Box>
    </Box>
  );
};

export default RightSlider; 