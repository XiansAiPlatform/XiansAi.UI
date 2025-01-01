import React from 'react';
import { Box, Typography, Menu, MenuItem, Avatar } from '@mui/material';
import './Layout.css'; // Import the CSS file
import { useAuth0 } from '@auth0/auth0-react';
import LogoutIcon from '@mui/icons-material/Logout';
import BusinessIcon from '@mui/icons-material/Business';

const Header = ({ pageTitle = "" }) => {
  const { user, logout, getAccessTokenSilently } = useAuth0();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [organization, setOrganization] = React.useState('');
  const [name] = React.useState('');
  React.useEffect(() => {
    const getOrganization = async () => {
      try {
        const token = await getAccessTokenSilently();
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        const orgInfo = decodedToken['https://flowmaxer.ai/tenant'];
        console.log('orgInfo', orgInfo);
        setOrganization(orgInfo);
      } catch (error) {
        console.error('Error fetching organization:', error);
      }
    };

    getOrganization();
  }, [getAccessTokenSilently]);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout({ returnTo: window.location.origin });
    handleClose();
  };

  return (
    <Box className="header">
      <Box className="header-content" sx={{ display: 'flex', alignItems: 'center' }}>
        {pageTitle}
      </Box>
      
      <Box className="header-content" sx={{ 
        display: 'flex', 
        alignItems: 'center',
        gap: '16px'
      }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          gap: '8px'
        }}>
          <BusinessIcon sx={{ 
            color: 'text.secondary',
            fontSize: '20px'
          }} />
          <Typography 
            variant="h6" 
            className="header-organization"
            sx={{
              fontSize: '0.875rem',
              fontWeight: 500,
              color: 'text.secondary'
            }}
          >
            {organization}
          </Typography>
        </Box>

        <Avatar
          onClick={handleMenu}
          className="header-avatar"
          src={user?.picture}
          alt={user?.name || 'User'}
          sx={{
            cursor: 'pointer',
            width: 36,
            height: 36,
            transition: 'transform 0.2s',
            '&:hover': {
              transform: 'scale(1.05)'
            }
          }}
        >
          {!user?.picture && (user?.name?.charAt(0) || 'U')}
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
            className: "header-menu-paper"
          }}
        >
          <Box className="header-user-info">
            <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>{name}</Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.email}
            </Typography>
          </Box>
          <MenuItem 
            onClick={handleLogout}
            className="header-logout"
          >
            <LogoutIcon fontSize="small" />
            <Typography>Logout</Typography>
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );
};

export default Header; 