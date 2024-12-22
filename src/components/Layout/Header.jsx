import React from 'react';
import { Box, Typography, Menu, MenuItem, IconButton, Avatar } from '@mui/material';
import AccountCircle from '@mui/icons-material/AccountCircle';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import MenuIcon from '@mui/icons-material/Menu';
import './Layout.css'; // Import the CSS file

const Header = ({ onToggleSlider, isSliderVisible, pageTitle = "" }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box sx={{ 
      gridArea: 'header',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px'
    }}>
      <Typography variant="h6" sx={{ color: '#1a1a1a', fontWeight: 600 }}>
        {pageTitle}
      </Typography>
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton 
          onClick={onToggleSlider}
          sx={{ color: '#6366f1' }}
        >
          {isSliderVisible ? <MenuOpenIcon /> : <MenuIcon />}
        </IconButton>
        <IconButton size="large" color="default">
          <NotificationsNoneIcon />
        </IconButton>
        <Avatar
          onClick={handleMenu}
          sx={{ cursor: 'pointer', bgcolor: '#6366f1' }}
        >
          JD
        </Avatar>
        <Menu
          id="menu-appbar"
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          keepMounted
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          PaperProps={{
            sx: {
              mt: 1,
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              border: '1px solid #f0f0f0',
            }
          }}
        >
          <MenuItem onClick={handleClose}>Profile</MenuItem>
          <MenuItem onClick={handleClose}>Settings</MenuItem>
          <MenuItem onClick={handleClose}>Logout</MenuItem>
        </Menu>
      </Box>
    </Box>
  );
};

export default Header; 