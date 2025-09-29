import { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import LeftNav from './LeftNav';
import Header from './Header';
import RightSlider from './RightSlider';
import { useSlider } from '../../contexts/SliderContext';
import { Outlet } from 'react-router-dom';

const Layout = () => {
  const { isOpen, closeSlider, sliderContent, sliderTitle } = useSlider();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isNavCollapsed, setIsNavCollapsed] = useState(() => {
    // Load collapsed state from localStorage
    const savedState = localStorage.getItem('navCollapsed');
    return savedState ? JSON.parse(savedState) : false;
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Save collapsed state to localStorage
    localStorage.setItem('navCollapsed', JSON.stringify(isNavCollapsed));
  }, [isNavCollapsed]);

  const toggleNav = () => {
    if (isMobile) {
      setIsNavOpen(!isNavOpen);
    } else {
      setIsNavCollapsed(!isNavCollapsed);
    }
  };

  const closeNav = () => {
    setIsNavOpen(false);
  };

  return (
    <Box className={`layout-wrapper ${isNavCollapsed && !isMobile ? 'nav-collapsed' : ''}`}>
      <Box className="layout-container">
        <LeftNav 
          isOpen={isNavOpen} 
          isCollapsed={isNavCollapsed}
          onClose={closeNav}
          onToggleCollapse={() => setIsNavCollapsed(!isNavCollapsed)}
        />
        <Header 
          toggleNav={toggleNav} 
          isNavOpen={isNavOpen}
          isNavCollapsed={isNavCollapsed}
        />
        <Box className="layout-main">
          <Outlet />
        </Box>
        {isOpen && (
          <RightSlider onClose={closeSlider} title={sliderTitle}>
            {sliderContent}
          </RightSlider>
        )}
      </Box>
    </Box>
  );
};

export default Layout; 