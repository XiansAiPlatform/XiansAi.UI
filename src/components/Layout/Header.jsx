import React from 'react';
import { Box, Typography, Menu, MenuItem, Avatar, Select, FormControl } from '@mui/material';
import './Layout.css'; // Import the CSS file
import { useAuth0 } from '@auth0/auth0-react';
import LogoutIcon from '@mui/icons-material/Logout';
import BusinessIcon from '@mui/icons-material/Business';
import { useSelectedOrg } from '../../contexts/OrganizationContext';
import { Link } from 'react-router-dom';
import PersonIcon from '@mui/icons-material/Person';

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
    logout({   
      logoutParams: {
        returnTo: window.location.origin + '/login'
      }
    });
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
            alt={user?.nickname || 'User'}
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
            {!user?.picture && (user?.nickname?.charAt(0) || 'U')}
          </Avatar>
          
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'bottom',
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
              elevation: 2,
              sx: {
                mt: 2.5,
                minWidth: 220,
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.15))',
                '& .MuiMenu-list': {
                  padding: '4px',
                },
              }
            }}
          >
            <Box sx={{
              p: 2,
              pb: 1.5,
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}>
              <Typography variant="subtitle1" sx={{ 
                fontWeight: 600,
                color: 'text.primary',
                mb: 0.5,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <PersonIcon fontSize="small" />
                {(user?.nickname || user?.name)?.toUpperCase()}
              </Typography>
              <Typography variant="body2" sx={{ 
                color: 'text.secondary',
                mb: 0.5
              }}>
                {user?.sub}
              </Typography>
              <Typography variant="body2" sx={{ 
                color: 'text.secondary',
                wordBreak: 'break-all'
              }}>
                {user?.email}
              </Typography>
            </Box>
            <MenuItem 
              onClick={handleLogout}
              sx={{
                m: 0.5,
                p: 1.5,
                gap: 1.5,
                borderRadius: 1,
                '&:hover': {
                  backgroundColor: 'action.hover',
                }
              }}
            >
              <LogoutIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              <Typography variant="body2">Logout</Typography>
            </MenuItem>
          </Menu>
        </Box>
      </Box>
    </Box>
  );
};

export default Header; 