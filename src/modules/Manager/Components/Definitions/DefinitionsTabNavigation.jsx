import React from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { ROUTES } from '../../../../routes/routeConstants';

const DefinitionsTabNavigation = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine current tab based on pathname
  const getCurrentTab = () => {
    if (location.pathname === ROUTES.MANAGER.DEFINITIONS_DEPLOYED) {
      return 0;
    } else if (location.pathname === ROUTES.MANAGER.DEFINITIONS_TEMPLATES) {
      return 1;
    }
    // Default to deployed if on base definitions route
    return 0;
  };

  const handleTabChange = (event, newValue) => {
    // Preserve URL search params (like org=...) when navigating between tabs
    const searchParams = location.search;
    if (newValue === 0) {
      navigate(`${ROUTES.MANAGER.DEFINITIONS_DEPLOYED}${searchParams}`);
    } else if (newValue === 1) {
      navigate(`${ROUTES.MANAGER.DEFINITIONS_TEMPLATES}${searchParams}`);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={getCurrentTab()} 
          onChange={handleTabChange}
          aria-label="definitions navigation tabs"
          sx={{
            '& .MuiTabs-indicator': {
              backgroundColor: 'primary.main',
            },
            '& .MuiTab-root': {
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 200,
              minWidth: 120,
              '&.Mui-selected': {
                color: 'primary.main',
                fontWeight: 200,
              },
            },
          }}
        >
          <Tab label="Deployed" />
          <Tab label="Templates" />
        </Tabs>
      </Box>
      {children}
    </Box>
  );
};

export default DefinitionsTabNavigation;
