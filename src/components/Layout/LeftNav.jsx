import React from 'react';
import { Box, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
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
const NavItem = ({ to, icon, label, isSelected, pathname }) => {
  const selected = isSelected(pathname);
  
  return (
    <ListItem
      component={Link}
      to={to}
      className={`nav-item ${selected ? 'selected' : ''}`}
      sx={{
        mb: 1,
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateX(4px)',
          backgroundColor: 'var(--bg-hover)'
        }
      }}
    >
      <ListItemIcon 
        sx={{ 
          minWidth: '32px',
          color: selected ? 'var(--text-primary)' : 'var(--text-secondary)',
          opacity: selected ? 1 : 0.8
        }}
      >
        {icon}
      </ListItemIcon>
      <ListItemText
        primary={label}
        sx={{
          '& .MuiTypography-root': {
            fontSize: 'var(--text-sm)',
            fontWeight: selected ? 'var(--font-weight-medium)' : 'var(--font-weight-regular)',
            color: selected ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontFamily: 'var(--font-family)',
            letterSpacing: '0.2px'
          }
        }}
      />
    </ListItem>
  );
};

const LeftNav = () => {
  const { pathname } = useLocation();

  return (
    <Box className="nav">
      <List sx={{ pt: 2 }}>
        {NAV_ITEMS.map((item) => (
          <NavItem
            key={item.to}
            {...item}
            pathname={pathname}
          />
        ))}
      </List>
    </Box>
  );
};

export default LeftNav; 