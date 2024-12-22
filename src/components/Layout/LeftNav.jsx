import React from 'react';
import { Box, Typography, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import { Link, useLocation } from 'react-router-dom';

const LeftNav = () => {
  const location = useLocation();

  return (
    <Box className="nav">
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1, 
        mb: 4,
        px: 2,
        pt: 2
      }}>
        <AutoGraphIcon sx={{ 
          fontSize: 32, 
          color: '#6366f1',
          transform: 'rotate(-10deg)'
        }} />
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 700,
            color: '#1a1a1a',
            letterSpacing: '-0.5px'
          }}
        >
          Flowmaxer
        </Typography>
      </Box>
      <Typography 
        variant="subtitle2" 
        sx={{ 
          color: '#666', 
          mb: 3, 
          px: 1, 
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          fontSize: '0.75rem'
        }}
      >
        Menu
      </Typography>
      <List>
        <ListItem 
          className="nav-item" 
          component={Link} 
          to="/workflows"
          selected={location.pathname === '/workflows'}
          sx={{
            '&.Mui-selected': {
              backgroundColor: '#6366f108',
              '& .MuiListItemIcon-root': {
                color: '#6366f1',
              },
              '& .MuiTypography-root': {
                color: '#6366f1',
                fontWeight: 600,
              },
            },
          }}
        >
          <ListItemIcon>
            <AccountTreeOutlinedIcon />
          </ListItemIcon>
          <ListItemText 
            primary="Flows" 
            primaryTypographyProps={{ 
              sx: { fontWeight: 500, fontSize: '0.875rem' } 
            }} 
          />
        </ListItem>

        <ListItem  
          className="nav-item"
          component={Link}
          to="/agents"
          selected={location.pathname === '/agents'}
          sx={{
            '&.Mui-selected': {
              backgroundColor: '#6366f108',
              '& .MuiListItemIcon-root': {
                color: '#6366f1',
              },
              '& .MuiTypography-root': {
                color: '#6366f1',
                fontWeight: 600,
              },
            },
          }}
        >
          <ListItemIcon>
            <SmartToyOutlinedIcon />
          </ListItemIcon>
          <ListItemText 
            primary="Agents" 
            primaryTypographyProps={{ 
              sx: { fontWeight: 500, fontSize: '0.875rem' } 
            }} 
          />
        </ListItem>

        <ListItem
          className="nav-item"
          component={Link}
          to="/settings"
          selected={location.pathname === '/settings'}
          sx={{
            '&.Mui-selected': {
              backgroundColor: '#6366f108',
              '& .MuiListItemIcon-root': {
                color: '#6366f1',
              },
              '& .MuiTypography-root': {
                color: '#6366f1',
                fontWeight: 600,
              },
            },
          }}
        >
          <ListItemIcon>
            <SettingsOutlinedIcon />
          </ListItemIcon>
          <ListItemText 
            primary="Settings" 
            primaryTypographyProps={{ 
              sx: { fontWeight: 500, fontSize: '0.875rem' } 
            }} 
          />
        </ListItem>
      </List>
    </Box>
  );
};

export default LeftNav; 