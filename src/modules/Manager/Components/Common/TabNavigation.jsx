import React from 'react';
import { Box, Tabs, Tab } from '@mui/material';

const TabNavigation = ({ 
  tabs, 
  currentTab, 
  onTabChange, 
  ariaLabel = "navigation tabs",
  sx = {}
}) => {
  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
      <Tabs 
        value={currentTab} 
        onChange={onTabChange}
        aria-label={ariaLabel}
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
          ...sx
        }}
      >
        {tabs.map((tab, idx) => (
          <Tab key={tab.label || tab} label={tab.label || tab} />
        ))}
      </Tabs>
    </Box>
  );
};

export default TabNavigation;
