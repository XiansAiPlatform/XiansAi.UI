import React from 'react';
import { Box, Typography, Menu, MenuItem, Avatar, Select, FormControl, IconButton } from '@mui/material';
import './Layout.css'; // Import the CSS file
import { useAuth0 } from '@auth0/auth0-react';
import LogoutIcon from '@mui/icons-material/Logout';
import BusinessIcon from '@mui/icons-material/Business';
import MenuIcon from '@mui/icons-material/Menu';
import { useSelectedOrg } from '../../contexts/OrganizationContext';
import { Link } from 'react-router-dom';
import PersonIcon from '@mui/icons-material/Person';

const Header = ({ pageTitle = "", toggleNav, isNavOpen }) => {
  const { user, logout } = useAuth0();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const { selectedOrg, setSelectedOrg, organizations } = useSelectedOrg();
  const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 768);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    <Box className="header">
      <Box className="header-content">
        {isMobile && (
          <IconButton 
            className="menu-button"
            onClick={toggleNav}
            size="medium"
            edge="start"
            color="inherit"
            aria-label="menu"
          >
            <MenuIcon />
          </IconButton>
        )}
        
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          gap: 2 
        }}>
          <Link to="/" className="logo-link">
            <Typography className="logo-text">
              <span className="logo-text-primary">Xians</span>
              <span className="logo-text-accent">.ai</span>
            </Typography>
          </Link>
          
          {pageTitle && !isMobile && (
            <>
              <Box sx={{ 
                color: 'text.secondary', 
                mx: 2,
                opacity: 0.6 
              }}>/</Box>
              <Typography variant="h6" sx={{ 
                fontWeight: 500,
                color: 'text.primary',
                opacity: 0.9
              }}>
                {pageTitle}
              </Typography>
            </>
          )}
        </Box>
        
        <Box className="header-controls" sx={{ 
          display: 'flex', 
          alignItems: 'center',
          gap: isMobile ? '12px' : '20px'
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--bg-paper)',
            padding: '4px 8px',
            borderRadius: 'var(--radius-lg)',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              backgroundColor: 'var(--bg-hover)'
            }
          }}>
            <BusinessIcon sx={{ 
              color: 'text.secondary',
              fontSize: '20px',
              opacity: 0.8
            }} />
            <FormControl size="small" sx={{ minWidth: isMobile ? 120 : 180 }}>
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
            className="user-avatar"
            src={user?.picture}
            alt={user?.nickname || 'User'}
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
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            PaperProps={{
              className: 'user-menu-paper'
            }}
          >
            <Box className="user-info">
              <Typography className="user-info-name">
                <PersonIcon fontSize="small" />
                {(user?.nickname || user?.name)?.toUpperCase()}
              </Typography>
              <Typography className="user-info-sub">
                {user?.sub}
              </Typography>
              <Typography className="user-info-email">
                {user?.email}
              </Typography>
            </Box>
            
            <MenuItem 
              onClick={handleLogout}
              className="user-menu-item logout"
            >
              <LogoutIcon fontSize="small" sx={{ mr: 1.5 }} />
              <Typography variant="body2">Logout</Typography>
            </MenuItem>
          </Menu>
        </Box>
      </Box>
    </Box>
  );
};

export default Header; 