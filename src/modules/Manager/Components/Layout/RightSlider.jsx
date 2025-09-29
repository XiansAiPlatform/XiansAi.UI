import { useEffect, useRef, useState } from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import { useSlider } from '../../contexts/SliderContext';

const RightSlider = ({ onClose, children, title }) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const { isVisible } = useSlider();
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

  // Calculate the width based on the current state
  const sliderWidth = isFullScreen ? '100vw' : '50vw';
  const sliderMaxWidth = isFullScreen ? '100vw' : '1200px';

  return (
    <>
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bgcolor: 'rgba(38, 53, 63, 0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 1200,
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
        onClick={onClose}
      />
      <Box
        ref={sliderRef}
        sx={{ 
          position: 'fixed',
          top: 0,
          right: 0,
          backgroundColor: 'var(--bg-paper)',
          height: '100vh',
          width: sliderWidth,
          maxWidth: sliderMaxWidth,
          boxShadow: 'var(--shadow-lg)',
          borderLeft: '1px solid var(--border-color)',
          zIndex: 1300,
          display: 'flex',
          flexDirection: 'column',
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateX(0)' : 'translateX(40px)',
          transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s ease-out, max-width 0.3s ease-out'
        }}
      >
        <Box sx={{ 
          position: 'sticky',
          top: 0,
          padding: '20px 28px',
          backgroundColor: 'var(--bg-paper)',
          borderBottom: '1px solid var(--border-color)',
          backdropFilter: 'blur(20px)',
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
        }}>
          <Typography variant="h6" sx={{ 
            fontWeight: 700, 
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-family)',
            fontSize: '1.125rem',
            letterSpacing: '-0.02em',
            flex: 1,
            pr: 2,
            wordBreak: 'break-word',
            lineHeight: 1.3
          }}>
            {title}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
            <IconButton 
              onClick={() => setIsFullScreen(!isFullScreen)}
              sx={{ 
                color: 'var(--text-secondary)',
                borderRadius: 'var(--radius-md)',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  backgroundColor: 'var(--bg-hover)',
                  color: 'var(--primary)',
                  transform: 'scale(1.05)'
                }
              }}
            >
              {isFullScreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
            </IconButton>
            <IconButton 
              onClick={onClose}
              sx={{ 
                color: 'var(--text-secondary)',
                borderRadius: 'var(--radius-md)',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  backgroundColor: 'rgba(var(--error-rgb), 0.08)',
                  color: 'var(--error-main)',
                  transform: 'scale(1.05)'
                }
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
        <Box sx={{ 
          padding: '28px',
          overflowY: 'auto',
          flex: 1,
          minHeight: 0,
          height: '100%',
          backgroundColor: 'var(--bg-paper)',
          scrollbarWidth: 'thin',
          scrollbarColor: 'var(--border-color) transparent',
          '&::-webkit-scrollbar': {
            width: '8px'
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent'
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'var(--border-color)',
            borderRadius: '20px',
            border: '2px solid var(--bg-paper)'
          }
        }}>
          {children}
        </Box>
      </Box>
    </>
  );
};

export default RightSlider; 