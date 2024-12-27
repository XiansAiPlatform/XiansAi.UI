import React from 'react';
import { Box, Typography, Menu, MenuItem, Avatar } from '@mui/material';
import './Layout.css'; // Import the CSS file
import { useAuth0 } from '@auth0/auth0-react';
import LogoutIcon from '@mui/icons-material/Logout';

const Header = ({ onToggleSlider, isSliderVisible, pageTitle = "" }) => {
  const { user, logout, getAccessTokenSilently } = useAuth0();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [organization, setOrganization] = React.useState('');
  const [name, setName] = React.useState('');
  React.useEffect(() => {
    const getOrganization = async () => {
      try {
        const token = await getAccessTokenSilently();
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        const orgInfo = decodedToken['https://flowmaxer.ai/tenant'];
        const name = decodedToken['https://flowmaxer.ai/name'];
        console.log('orgInfo', orgInfo);
        console.log('name', name);
        setOrganization(orgInfo);
        setName(name);
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
    <Box sx={{ 
      gridArea: 'header',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 50px'
    }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1.5 
      }}>
        {pageTitle}
      </Box>
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="h6" sx={{ 
          color: '#1a1a1a', 
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center'
        }}>
          {organization}
        </Typography>

        <Avatar
          onClick={handleMenu}
          sx={{ cursor: 'pointer', bgcolor: '#6366f1' }}
          src={user?.picture}
          alt={user?.name || 'User'}
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
            sx: {
              mt: 1.5,
              minWidth: '200px',
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              '& .MuiMenuItem-root': {
                py: 1,
                px: 2,
              }
            }
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            width: '100%',
            borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
            p: 2,
            pb: 1
          }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>{name}</Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.email}
            </Typography>
          </Box>
          <MenuItem 
            onClick={handleLogout}
            sx={{ 
              color: 'error.main',
              gap: 1,
              mt: 0.5
            }}
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