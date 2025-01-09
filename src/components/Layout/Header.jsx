import React from 'react';
import { Box, Typography, Menu, MenuItem, Avatar, Select, FormControl } from '@mui/material';
import './Layout.css'; // Import the CSS file
import { useAuth0 } from '@auth0/auth0-react';
import LogoutIcon from '@mui/icons-material/Logout';
import BusinessIcon from '@mui/icons-material/Business';
import { useSelectedOrg } from '../../contexts/OrganizationContext';
import { Link } from 'react-router-dom';

const Header = ({ pageTitle = "" }) => {
  const { user, logout } = useAuth0();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const { selectedOrg, setSelectedOrg, organizations } = useSelectedOrg();

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
    <Box className="header" sx={{
      borderBottom: '1px solid',
      borderColor: 'divider',
      backgroundColor: 'background.paper',
      position: 'sticky',
      top: 0,
      zIndex: 1100,
      width: '100vw',
    }}>
      <Box className="header-content" sx={{ 
        display: 'flex', 
        alignItems: 'center',
        padding: '12px 24px',
        justifyContent: 'space-between',
        margin: '0 auto',
      }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          gap: 2 
        }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 700,
                letterSpacing: '-0.5px',
                fontSize: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <span style={{ color: 'var(--primary)' }}>Xians</span>
              <span style={{ color: 'var(--accent)' }}>.ai</span>
            </Typography>
          </Link>
          
          {pageTitle && (
            <>
              <Box sx={{ color: 'text.secondary', mx: 2 }}>/</Box>
              <Typography variant="h6" sx={{ 
                fontWeight: 600,
                color: 'text.primary'
              }}>
                {pageTitle}
              </Typography>
            </>
          )}
        </Box>
        
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          gap: '20px'
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'action.hover',
            padding: '4px 8px',
            borderRadius: '8px',
          }}>
            <BusinessIcon sx={{ 
              color: 'text.secondary',
              fontSize: '20px'
            }} />
            <FormControl size="small" sx={{ minWidth: 180 }}>
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
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    border: 'none'
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    border: 'none'
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    border: 'none'
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
              border: '2px solid',
              borderColor: 'primary.main',
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
              className: "header-menu-paper",
              sx: {
                mt: 1.5,
                minWidth: 220,
                boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
                '& .MuiMenu-list': {
                  padding: '8px',
                },
              }
            }}
          >
            <Box className="header-user-info" sx={{
              padding: '12px 16px',
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}>
              <Typography variant="subtitle1" sx={{ 
                fontWeight: 600,
                color: 'text.primary'
              }}>
                {user?.name}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {user?.email}
              </Typography>
            </Box>
            <MenuItem 
              onClick={handleLogout}
              sx={{
                margin: '8px 0',
                gap: '12px',
                borderRadius: '6px',
                '&:hover': {
                  backgroundColor: 'action.hover',
                }
              }}
            >
              <LogoutIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              <Typography sx={{ color: 'text.primary' }}>Logout</Typography>
            </MenuItem>
          </Menu>
        </Box>
      </Box>
    </Box>
  );
};

export default Header; 