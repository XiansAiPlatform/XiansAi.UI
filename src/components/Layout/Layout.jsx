import React from 'react';
import { Box } from '@mui/material';
import LeftNav from './LeftNav';
import Header from './Header';
import RightSlider from './RightSlider';
import { useSlider } from '../../contexts/SliderContext';

const Layout = ({ children }) => {
  const { isOpen, closeSlider, sliderContent } = useSlider();

  return (
    <Box sx={{ 
      display: 'grid', 
      gridTemplateColumns: '240px 1fr',
      gridTemplateRows: '64px 1fr', 
      gridTemplateAreas: `"nav header" "nav main"`,
      height: '100vh',
      backgroundColor: '#f8fafc'
    }}>
      <LeftNav />
      <Header />
      <Box sx={{ 
        gridArea: 'main', 
        padding: '24px',
        backgroundColor: '#f8fafc',
        overflowY: 'auto'
      }}>
        {children}
      </Box>
      {isOpen && (
        <Box sx={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: '400px',
          backgroundColor: '#fff',
          boxShadow: '-2px 0 8px rgba(0,0,0,0.15)',
          zIndex: 1000,
          height: '100%'
        }}>
          <RightSlider onClose={closeSlider}>
            {sliderContent}
          </RightSlider>
        </Box>
      )}
    </Box>
  );
};

export default Layout; 