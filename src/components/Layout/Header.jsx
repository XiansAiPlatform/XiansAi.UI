import React from 'react';
import { Box, Typography, Menu, MenuItem, Avatar, Select, FormControl } from '@mui/material';
import './Layout.css'; // Import the CSS file
import { useAuth0 } from '@auth0/auth0-react';
import LogoutIcon from '@mui/icons-material/Logout';
import BusinessIcon from '@mui/icons-material/Business';
import { useSelectedOrg } from '../../contexts/OrganizationContext';

const Header = ({ pageTitle = "" }) => {
  const { user, logout } = useAuth0();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const { selectedOrg, setSelectedOrg, organizations } = useSelectedOrg();
  const [name] = React.useState('');

  const handleOrgChange = (event) => {
    const newOrg = event.target.value;
    setSelectedOrg(newOrg);
    window.location.reload();
  };

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
          <FormControl size="small">
            <Select
              value={selectedOrg}
              onChange={handleOrgChange}
              displayEmpty
              sx={{
                fontSize: '0.875rem',
                fontWeight: 500,
                color: 'text.secondary',
                '& .MuiSelect-select': {
                  padding: '4px 8px',
                }
              }}
            >
              <MenuItem disabled value="">
                Select Organization
              </MenuItem>
              {organizations.map((org, index) => (
                <MenuItem key={index} value={org}>
                  {org}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
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