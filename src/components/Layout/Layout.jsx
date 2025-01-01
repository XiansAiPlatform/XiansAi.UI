import React from 'react';
import { Box } from '@mui/material';
import LeftNav from './LeftNav';
import Header from './Header';
import RightSlider from './RightSlider';
import { useSlider } from '../../contexts/SliderContext';

const Layout = ({ children }) => {
  const { isOpen, closeSlider, sliderContent, sliderTitle } = useSlider();

  return (
    <Box className="layout-wrapper">
      <Box className="layout-container">
        <LeftNav />
        <Header />
        <Box className="layout-main">
          {children}
        </Box>
        {isOpen && (
          <Box className="layout-slider">
            <RightSlider onClose={closeSlider} title={sliderTitle}>
              {sliderContent}
            </RightSlider>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Layout; 