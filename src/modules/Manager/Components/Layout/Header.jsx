import { useEffect } from 'react';
import * as React from 'react';
import { Box, Typography, Menu, MenuItem, Avatar, Select, FormControl, IconButton, Tooltip } from '@mui/material';
import './Layout.css'; // Import the CSS file
import { useAuth } from '../../auth/AuthContext';
import LogoutIcon from '@mui/icons-material/Logout';
import BusinessIcon from '@mui/icons-material/Business';
import MenuIcon from '@mui/icons-material/Menu';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import { useSelectedOrg } from '../../contexts/OrganizationContext';
import { Link, useNavigate } from 'react-router-dom';
import PersonIcon from '@mui/icons-material/Person';
import { useTenant } from '../../contexts/TenantContext';

const Header = ({ pageTitle = "", toggleNav }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const { selectedOrg, setSelectedOrg, organizations } = useSelectedOrg();
  const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 768); 
   const [userData, setUserData] = React.useState({ name: 'User', email: '', id: '' });    
   const [logoImage, setLogoImage] = React.useState(null);
  const { tenant } = useTenant();

  useEffect(() => {
    // Update user data when auth context changes
    if (user) {
      console.log('Auth user data:', user);
      // Use nickname if name is empty, or extract from email as last resort
      const displayName = user.name || user.nickname || user.email?.split('@')[0] || 'User';
      setUserData({
        name: displayName,
        email: user.email || '',
        id: user.preferred_username || user.sub || user.id || ''
      });
    }
  }, [user]);

  useEffect(() => { 
    // Fetch tenant logo 
    const fetchTenantLogo = async () => { 
      try {
        if (tenant && tenant.logo) {
          console.log("Tenant logo data:", tenant.logo);
          const logoBase64 = tenant.logo.imgBase64;
          const detectedType = detectImageType(logoBase64);
          console.log("Detected image type:", detectedType);
          setLogoImage(logoBase64);
        } else {
          console.log("No tenant logo available");
          setLogoImage(null);
        }
      } catch (error) {
        console.error('Error fetching tenant logo:', error);
        setLogoImage(null);
      }
    };

    fetchTenantLogo();
  }, [selectedOrg, tenant]);

  // Helper function to detect image type from base64 data
  const detectImageType = (base64String) => {
    if (!base64String) return 'png'; // Default fallback
    
    // Try to decode the first few bytes to detect the image type
    try {
      const decoded = atob(base64String.substring(0, 200)); // Decode first part for better detection
      
      // Check for SVG signature (more comprehensive)
      if (decoded.includes('<svg') || decoded.includes('<?xml') || 
          decoded.toLowerCase().includes('svg') || decoded.includes('<SVG')) {
        return 'svg+xml';
      }
      // Check for PNG signature
      if (decoded.startsWith('\x89PNG') || decoded.indexOf('PNG') !== -1) {
        return 'png';
      }
      // Check for JPEG signature
      if (decoded.startsWith('\xFF\xD8\xFF') || decoded.indexOf('JFIF') !== -1) {
        return 'jpeg';
      }
      // Check for GIF signature
      if (decoded.startsWith('GIF8') || decoded.startsWith('GIF9')) {
        return 'gif';
      }
      // Check for WebP signature
      if (decoded.indexOf('WEBP') !== -1) {
        return 'webp';
      }
    } catch (e) {
      console.warn('Error decoding base64 for image type detection:', e);
    }
    
    // Fallback: check base64 string for SVG patterns
    try {
      // Common base64 patterns for SVG start tags
      const svgPatterns = [
        'PHN2Zw', // '<svg'
        'PD94bWw', // '<?xml'
        'PHN2ZyB', // '<svg '
        'PD94bWwg', // '<?xml '
        'PCFET0NUWVBF' // '<!DOCTYPE'
      ];
      
      const upperBase64 = base64String.substring(0, 200).toUpperCase();
      for (const pattern of svgPatterns) {
        if (upperBase64.includes(pattern.toUpperCase())) {
          return 'svg+xml';
        }
      }
    } catch (e) {
      console.warn('Error in SVG pattern detection:', e);
    }
    
    return 'png'; // Default fallback
  };

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

  const handleJoinTenant = () => {
    // Close the menu
    handleClose();
    // Navigate to the register page
    navigate('/register');
  };

  const handleLogout = () => {
    console.log('Logging out');
    // Close the menu
    handleClose();
    // Perform logout with explicit redirect to login page
    logout({
      returnTo: `${window.location.origin}/login`
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
              { logoImage !== null ? (
                <img 
                  src={`data:image/${detectImageType(logoImage)};base64,${logoImage}`} 
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
              className="user-menu-item join-tenant"
              onClick={handleJoinTenant}
              sx={{
                gap: '8px',
                margin: '4px',
                borderRadius: 'var(--radius-md)',
                '&:hover': {
                  backgroundColor: 'var(--bg-hover)',
                  fontWeight: 500
                }
              }}
            >
              <GroupAddIcon fontSize="small" />
              Join a Tenant
            </MenuItem>
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