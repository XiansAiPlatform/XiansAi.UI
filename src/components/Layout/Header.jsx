import React from 'react';
import { Box, Typography, Menu, MenuItem, Avatar, Select, FormControl, IconButton, Tooltip } from '@mui/material';
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
          <Tooltip title="Toggle menu">
            <IconButton 
              className="menu-button"
              onClick={toggleNav}
              size="medium"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                  backgroundColor: 'var(--bg-hover)'
                }
              }}
            >
              <MenuIcon />
            </IconButton>
          </Tooltip>
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
                opacity: 0.4,
                fontSize: '1.5rem',
                fontWeight: 200
              }}>/</Box>
              <Typography variant="h6" sx={{ 
                fontWeight: 500,
                color: 'text.primary',
                opacity: 0.85,
                letterSpacing: '0.2px'
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
          <Tooltip title="Select organization">
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'var(--bg-paper)',
              padding: '4px 8px',
              borderRadius: 'var(--radius-lg)',
              transition: 'all 0.2s ease-in-out',
              border: '1px solid transparent',
              '&:hover': {
                backgroundColor: 'var(--bg-hover)',
                borderColor: 'var(--border-color)'
              }
            }}>
              <BusinessIcon sx={{ 
                color: 'text.secondary',
                fontSize: '20px',
                opacity: 0.7
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
          </Tooltip>

          <Tooltip title={user?.name || "Account"}>
            <Avatar
              onClick={handleMenu}
              className="user-avatar"
              src={user?.picture}
              alt={user?.nickname || 'User'}
              sx={{
                border: '2px solid transparent',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                '&:hover': {
                  borderColor: 'var(--primary)',
                  transform: 'scale(1.05)'
                }
              }}
            >
              {!user?.picture && <PersonIcon />}
            </Avatar>
          </Tooltip>

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
              className: "user-menu-paper",
              elevation: 3,
              sx: {
                minWidth: 180,
                mt: 1,
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.08))',
                '&:before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: 'background.paper',
                  transform: 'translateY(-50%) rotate(45deg)',
                  zIndex: 0,
                  borderLeft: '1px solid var(--border-color)',
                  borderTop: '1px solid var(--border-color)',
                },
              }
            }}
          >
            <Box className="user-info">
              <Typography className="user-info-name" variant="subtitle1">
                {user?.name}
              </Typography>
              <Typography className="user-info-email" variant="caption">
                {user?.email}
              </Typography>
            </Box>
            <MenuItem 
              className="user-menu-item logout"
              onClick={handleLogout}
              sx={{
                color: 'error.main',
                gap: '8px',
                margin: '4px',
                borderRadius: 'var(--radius-md)',
                '&:hover': {
                  backgroundColor: 'error.light',
                  color: 'error.contrastText'
                }
              }}
            >
              <LogoutIcon fontSize="small" />
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Box>
    </Box>
  );
};

export default Header; 