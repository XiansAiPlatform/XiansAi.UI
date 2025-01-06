import React, { useEffect, useRef, useState } from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';

const RightSlider = ({ onClose, children, title }) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const sliderRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const isMenuClick = event.target.closest('.MuiPopover-root');
      
      if (sliderRef.current && 
          !sliderRef.current.contains(event.target) && 
          !isMenuClick) {
        onClose();
      }
    };

    document.addEventListener('mouseup', handleClickOutside);

    return () => {
      document.removeEventListener('mouseup', handleClickOutside);
    };
  }, [onClose]);

  return (
    <>
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bgcolor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1200
        }}
        onClick={onClose}
      />
      <Box
        ref={sliderRef}
        sx={{ 
          position: 'fixed',
          top: 0,
          right: 0,
          backgroundColor: '#fff',
          height: '100vh',
          width: isFullScreen ? '100vw' : '50vw',
          maxWidth: isFullScreen ? '100vw' : '1200px',
          boxShadow: '-4px 0 8px rgba(0, 0, 0, 0.1)',
          borderLeft: '1px solid rgba(0, 0, 0, 0.12)',
          zIndex: 1300,
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.3s ease-in-out, max-width 0.3s ease-in-out'
        }}
      >
        <Box sx={{ 
          position: 'sticky',
          top: 0,
          padding: '16px 24px',
          backgroundColor: '#fff',
          borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'grey.900' }}>
            {title}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton 
              onClick={() => setIsFullScreen(!isFullScreen)}
              sx={{ 
                color: 'grey.600',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  color: 'grey.900'
                }
              }}
            >
              {isFullScreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
            </IconButton>
            <IconButton 
              onClick={onClose}
              sx={{ 
                color: 'grey.600',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  color: 'grey.900'
                }
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
        <Box sx={{ 
          padding: '24px',
          overflowY: 'auto',
          flex: 1,
          minHeight: 0,
          height: '100%'
        }}>
          {children}
        </Box>
      </Box>
    </>
  );
};

export default RightSlider; 