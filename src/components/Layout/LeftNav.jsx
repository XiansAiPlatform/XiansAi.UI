import React from 'react';
import { Box, Typography, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import AirIcon from '@mui/icons-material/Air';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import { Link, useLocation } from 'react-router-dom';


const NAV_ITEMS = [
  {
    to: '/runs',
    icon: <AirIcon />,
    label: 'Flow Runs',
    isSelected: (pathname) => pathname === '/runs' || pathname.startsWith('/runs/') || pathname === '/',
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
      className={`nav-item ${selected ? 'selected' : ''}`}
    >
      <ListItemIcon className="nav-item-icon">
        {icon}
      </ListItemIcon>
      <ListItemText
        primary={label}
        primaryTypographyProps={{
          className: "nav-item-text"
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
        <Box className="nav-logo">
          
          <Typography variant="h5" className="nav-logo-text">
            <span style={{ color: 'var(--primary)' }}>Xians</span>
            <span style={{ color: 'var(--secondary)' }}>.ai</span>
          </Typography>
        </Box>
      </Link>
      
      <Typography variant="subtitle2" className="nav-section-title">
        
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