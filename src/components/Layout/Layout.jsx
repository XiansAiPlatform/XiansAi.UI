import React, { useState } from 'react';
import { Box } from '@mui/material';
import LeftNav from './LeftNav';
import Header from './Header';
import RightSlider from './RightSlider';
import { useSlider } from '../../contexts/SliderContext';
import { Outlet } from 'react-router-dom';

const Layout = () => {
  const { isOpen, closeSlider, sliderContent, sliderTitle } = useSlider();
  const [isNavOpen, setIsNavOpen] = useState(false);

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  const closeNav = () => {
    setIsNavOpen(false);
  };

  return (
    <Box className="layout-wrapper">
      <Box className="layout-container">
        <LeftNav isOpen={isNavOpen} onClose={closeNav} />
        <Header toggleNav={toggleNav} isNavOpen={isNavOpen} />
        <Box className="layout-main">
          <Outlet />
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