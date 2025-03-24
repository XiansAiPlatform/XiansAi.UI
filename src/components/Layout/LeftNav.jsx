import React from 'react';
import { Box, List, ListItem, ListItemIcon, ListItemText, Typography, Divider } from '@mui/material';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import AirIcon from '@mui/icons-material/Air';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import CodeOutlinedIcon from '@mui/icons-material/CodeOutlined';
import { Link, useLocation } from 'react-router-dom';


const NAV_ITEMS = [
  {
    to: '/runs',
    icon: <AirIcon />,
    label: 'Agent Runs',
    isSelected: (pathname) => pathname === '/runs' || pathname.startsWith('/runs/') || pathname === '/',
  },
  {
    to: '/definitions',
    icon: <CodeOutlinedIcon />,
    label: 'Agent Definitions',
    isSelected: (pathname) => pathname === '/definitions' || pathname.startsWith('/definitions/'),
  },
  {
    to: '/instructions',
    icon: <DescriptionOutlinedIcon />,
    label: 'Knowledge',
    isSelected: (pathname) => pathname === '/instructions' || pathname.startsWith('/instructions/'),
  },
  {
    to: '/settings',
    icon: <SettingsOutlinedIcon />,
    label: 'Settings',
    isSelected: (pathname) => pathname === '/settings' || pathname.startsWith('/settings/'),
  },
];

// Reusable NavItem component
const NavItem = ({ to, icon, label, isSelected, pathname, onNavItemClick }) => {
  const selected = isSelected(pathname);
  
  return (
    <ListItem
      component={Link}
      to={to}
      className={`nav-item ${selected ? 'selected' : ''}`}
      onClick={onNavItemClick}
      sx={{
        mb: 1,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateX(4px)',
          backgroundColor: 'var(--bg-hover)'
        }
      }}
    >
      <ListItemIcon 
        sx={{ 
          minWidth: '32px',
          color: selected ? 'var(--primary)' : 'var(--text-secondary)',
          opacity: selected ? 1 : 0.7
        }}
      >
        {icon}
      </ListItemIcon>
      <ListItemText
        primary={label}
        sx={{
          '& .MuiTypography-root': {
            fontSize: 'var(--text-sm)',
            fontWeight: selected ? 600 : 500,
            color: selected ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontFamily: 'var(--font-family)',
            letterSpacing: '0.2px'
          }
        }}
      />
    </ListItem>
  );
};

const LeftNav = ({ isOpen, onClose }) => {
  const { pathname } = useLocation();
  const isMobile = window.innerWidth <= 768;

  const handleNavItemClick = () => {
    if (isMobile && onClose) {
      onClose();
    }
  };

  return (
    <>
      {isMobile && isOpen && <div className="nav-overlay open" onClick={onClose}></div>}
      <Box className={`nav ${isOpen ? 'open' : ''}`}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          height: '100%'
        }}>
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="overline"
              sx={{
                display: 'block',
                color: 'var(--text-secondary)',
                fontSize: '0.7rem',
                fontWeight: 600,
                letterSpacing: '1px',
                opacity: 0.7,
                padding: '0 8px',
                marginBottom: '8px'
              }}
            >
              NAVIGATION
            </Typography>
            <List>
              {NAV_ITEMS.map((item) => (
                <NavItem
                  key={item.to}
                  {...item}
                  pathname={pathname}
                  onNavItemClick={handleNavItemClick}
                />
              ))}
            </List>
          </Box>
          
          <Box sx={{ mt: 'auto', mb: 2, opacity: 0.6 }}>
            <Divider sx={{ mb: 2 }} />
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                color: 'var(--text-secondary)',
                fontSize: '0.7rem',
                padding: '0 16px',
                textAlign: 'center'
              }}
            >
              Xians.ai &copy; {new Date().getFullYear()}
            </Typography>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default LeftNav; 