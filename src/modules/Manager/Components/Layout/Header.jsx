import React, { useEffect } from 'react';
import { Box, Typography, Menu, MenuItem, Avatar, Select, FormControl, IconButton, Tooltip } from '@mui/material';
import './Layout.css'; // Import the CSS file
import { useAuth } from '../../auth/AuthContext';
import LogoutIcon from '@mui/icons-material/Logout';
import BusinessIcon from '@mui/icons-material/Business';
import MenuIcon from '@mui/icons-material/Menu';
import { useSelectedOrg } from '../../contexts/OrganizationContext';
import { Link, useNavigate } from 'react-router-dom';
import PersonIcon from '@mui/icons-material/Person';
import { useTenant } from '../../contexts/TenantContext'; // Assuming this is the correct path to your TenantContext

const Header = ({ pageTitle = "", toggleNav }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const { selectedOrg, setSelectedOrg, organizations } = useSelectedOrg();
  const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 768);
  const [userData, setUserData] = React.useState({ name: 'User', email: '', id: '' });  const [logoImage, setLogoImage] = React.useState(null);
  const { tenantData } = useTenant(); 

  useEffect(() => {  
    // Update user data when auth context changes
    if (user) {
      console.log('Auth user data:', user);
      // Use nickname if name is empty, or extract from email as last resort
      const displayName = user.name || user.nickname || user.email?.split('@')[0] || 'User';
      setUserData({ 
        name: displayName,
        email: user.email || '',
        id: user.id || user.sub || ''
      });
    } 
  }, [user]);

  useEffect(() => { 
    const fetchTenantLogo = async () => { 
      // Get Logo from the server
      if (!tenantData) {
        console.warn('Cannot fetch tenant logo');
        setLogoImage(null);  
      }
      else{ 
        try {
          if (tenantData.logo) {
            setLogoImage(tenantData.logo.imgBase64);
          } else {
            setLogoImage(null);
          }
        } catch (error) {
          console.error('Error fetching organization logo:', error);
          setLogoImage(null);
        } 
      }
    }; 

    fetchTenantLogo();
  }, [selectedOrg, tenantData]);

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
    navigate('/manager/definitions');
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    console.log('Logging out');
    // Close the menu
    handleClose();
    // Perform logout in the background
    logout();
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
              {logoImage !== null ? (
                <img 
                  src={`data:image/png;base64,${logoImage}`} 
                  alt="Tenant Logo" 
                  className="logo-image"
                />
              ) : (
                <>
                  <span className="logo-text-primary">Xians</span>
                  <span className="logo-text-accent">.ai</span>
                </>
              )}
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

          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            padding: '4px 12px',
            borderRadius: 'var(--radius-lg)',
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: 'var(--bg-hover)',
            }
          }}
            onClick={handleMenu}
          >
            {!isMobile && (
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 500,
                  color: 'text.secondary',
                  maxWidth: '120px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {userData.name}
              </Typography>
            )}
            <Tooltip title={userData.name}>
              <Avatar
                className="user-avatar"
                src={user?.picture}
                alt={userData.name}
                sx={{
                  border: '2px solid transparent',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: 'var(--primary)'
                  }
                }}
              >
                {!user?.picture && <PersonIcon />}
              </Avatar>
            </Tooltip>
          </Box>

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
                minWidth: 200,
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
            <Box className="user-info" sx={{ padding: '8px 16px' }}>
              <Typography className="user-info-name" variant="subtitle1" sx={{ fontWeight: 500 }}>
                {userData.name}
              </Typography>
              {userData.email && (
                <Typography className="user-info-email" variant="caption" sx={{
                  display: 'block',
                  color: 'text.secondary',
                  mb: 0.5
                }}>
                  {userData.email}
                </Typography>
              )}
              {userData.id && (
                <Typography className="user-info-id" variant="caption" sx={{
                  display: 'block',
                  color: 'text.secondary',
                  fontSize: '0.7rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '100%',
                  opacity: 0.8
                }}>
                  ID: {userData.id}
                </Typography>
              )}
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
                  backgroundColor: 'rgba(211, 47, 47, 0.1)',
                  color: 'error.dark',
                  fontWeight: 500
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