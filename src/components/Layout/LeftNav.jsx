import React from 'react';
import { Box, Typography, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import AirIcon from '@mui/icons-material/Air';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import { Link, useLocation } from 'react-router-dom';

// Styles constants
const SELECTED_STYLES = {
  backgroundColor: '#6366f108 !important',
  '& .MuiListItemIcon-root': {
    color: '#6366f1 !important',
  },
  '& .MuiListItemText-root .MuiTypography-root': {
    color: '#6366f1 !important',
    fontWeight: 600,
  },
};

const NAV_ITEMS = [
  {
    to: '/runs',
    icon: <AirIcon />,
    label: 'Flow Runs',
    isSelected: (pathname) => pathname === '/runs' || pathname.startsWith('/runs/') || pathname === '/',
  },
  {
    to: '/definitions',
    icon: <AccountTreeOutlinedIcon />,
    label: 'Flow Definitions',
    isSelected: (pathname) => pathname === '/definitions' || pathname.startsWith('/definitions/'),
  },
  {
    to: '/agents',
    icon: <SmartToyOutlinedIcon />,
    label: 'Agents',
    isSelected: (pathname) => pathname === '/agents' || pathname.startsWith('/agents/'),
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
      selected={selected}
      sx={{
        borderRadius: 1,
        mb: 0.5,
        color: selected ? '#6366f1' : 'inherit',
        backgroundColor: selected ? '#6366f108' : 'transparent',
        '&.Mui-selected': SELECTED_STYLES,
        '&:hover': {
          backgroundColor: '#6366f115',
        },
      }}
    >
      <ListItemIcon 
        sx={{ 
          minWidth: 40, 
          color: selected ? '#6366f1' : 'inherit'
        }}
      >
        {icon}
      </ListItemIcon>
      <ListItemText
        primary={label}
        primaryTypographyProps={{
          sx: { 
            fontWeight: selected ? 600 : 500, 
            fontSize: '0.875rem',
            color: selected ? '#6366f1' : 'inherit'
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
      <Link to="/" style={{ textDecoration: 'none' }}>
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          mb: 4,
          px: 2,
          height: 64,
          mt: -3,
          cursor: 'pointer'
        }}>
          <AutoGraphIcon sx={{
            fontSize: 32,
            color: '#6366f1',
            transform: 'rotate(-10deg)'
          }} />
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: '#1a1a1a',
              letterSpacing: '-0.5px'
            }}
          >
            Flowmaxer
          </Typography>
        </Box>
      </Link>
      
      <Typography
        variant="subtitle2"
        sx={{
          color: '#666',
          mb: 3,
          px: 1,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          fontSize: '0.75rem'
        }}
      >
        Menu
      </Typography>

      <List>
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