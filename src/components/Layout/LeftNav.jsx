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
    label: 'Flow Runs',
    isSelected: (pathname) => pathname === '/runs' || pathname.startsWith('/runs/') || pathname === '/',
  },
  {
    to: '/definitions',
    icon: <CodeOutlinedIcon />,
    label: 'Definitions',
    isSelected: (pathname) => pathname === '/definitions' || pathname.startsWith('/definitions/'),
  },
  {
    to: '/instructions',
    icon: <DescriptionOutlinedIcon />,
    label: 'Instructions',
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
        transition: 'var(--transition-fast)',
        '&:hover': {
          transform: 'translateX(4px)'
        }
      }}
    >
      <ListItemIcon 
        sx={{ 
          minWidth: '40px',
          color: selected ? 'var(--primary)' : 'var(--text-secondary)'
        }}
      >
        {icon}
      </ListItemIcon>
      <ListItemText
        primary={label}
        sx={{
          '& .MuiTypography-root': {
            fontSize: 'var(--text-sm)',
            fontWeight: selected ? 'var(--font-weight-bold)' : 'var(--font-weight-medium)',
            color: selected ? 'var(--primary)' : 'var(--text-primary)',
            fontFamily: 'var(--font-family)'
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