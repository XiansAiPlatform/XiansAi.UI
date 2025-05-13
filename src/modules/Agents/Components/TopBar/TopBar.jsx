import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  IconButton, 
  Typography, 
  Box, 
  useMediaQuery, 
  Badge,
  Menu,
  MenuItem,
  Popover,
  List,
  ListItem,
  ListItemText,
  Divider,
  ListItemAvatar,
  Avatar,
  ListItemIcon
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import RefreshIcon from '@mui/icons-material/Refresh';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import PersonIcon from '@mui/icons-material/Person';

// Logo component
const Logo = ({ onClick, isMobile }) => (
  <Box
    component="img"
    src="/images/logo.png" // Replace with your actual logo path
    alt="Logo"
    sx={{
      height: 32,
      width: 'auto',
      mr: { xs: 1, md: 2 },
      cursor: isMobile ? 'pointer' : 'default'
    }}
    onClick={isMobile ? onClick : undefined}
  />
);

// Mock user data
const mockUser = {
  name: 'Jane Doe',
  email: 'jane.doe@example.com',
  avatar: null // Use null for default icon or provide an image URL
};

// Mock notifications data - would come from API in real app
const mockNotifications = [
  {
    id: 'n1',
    agentId: 'a1',
    message: 'I found new research on renewable energy sources.',
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    read: false,
    agent: {
      name: 'General Assistant',
      avatarColor: '#E0F2FE',
      iconColor: '#7DD3FC'
    }
  },
  {
    id: 'n2',
    agentId: 'a2',
    message: 'Your code analysis is complete. Found 3 potential issues.',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    read: false,
    agent: {
      name: 'Code Helper',
      avatarColor: '#DCFCE7',
      iconColor: '#86EFAC'
    }
  },
  {
    id: 'n3',
    agentId: 'a3',
    message: 'I have drafted an introduction for your blog post.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    read: true,
    agent: {
      name: 'Creative Writer',
      avatarColor: '#FEF3C7',
      iconColor: '#FDE68A'
    }
  }
];

// Agent icon component for reuse
const AgentIcon = ({ agent, size = 'small' }) => {
  // Size presets
  const sizes = {
    small: { container: 32, icon: 22 },
    medium: { container: 38, icon: 28 },
    large: { container: 46, icon: 34 }
  };
  
  const { container, icon } = sizes[size] || sizes.small;
  
  // Default colors if not specified
  const avatarColor = agent?.avatarColor || '#E0F2FE';
  const iconColor = agent?.iconColor || '#7DD3FC';
  
  return (
    <Box
      sx={{
        width: container,
        height: container,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: avatarColor,
        border: `1px solid ${iconColor}`
      }}
    >
      <Box
        component="img"
        src="/images/agent.svg"
        alt="Agent icon"
        sx={{
          width: icon,
          height: icon,
          filter: `opacity(0.9) drop-shadow(0 0 0.5px ${iconColor})`
        }}
      />
    </Box>
  );
};


const TopBar = ({ handleToggleSidebar, onBackToExplore, selectedAgent, onSelectAgent }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Notifications state
  const [notifications, setNotifications] = useState(mockNotifications);
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState(null);
  const notificationsOpen = Boolean(notificationsAnchorEl);
  
  // User profile menu state
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const profileMenuOpen = Boolean(profileAnchorEl);
  
  // Handle opening notifications popover
  const handleNotificationsClick = (event) => {
    setNotificationsAnchorEl(event.currentTarget);
  };
  
  // Handle closing notifications popover
  const handleNotificationsClose = () => {
    setNotificationsAnchorEl(null);
  };
  
  // Handle profile menu open
  const handleProfileMenuOpen = (event) => {
    setProfileAnchorEl(event.currentTarget);
  };
  
  // Handle profile menu close
  const handleProfileMenuClose = () => {
    setProfileAnchorEl(null);
  };
  
  // Handle logout action
  const handleLogout = () => {
    handleProfileMenuClose();
    // Add your logout logic here
    console.log('User logged out');
  };
  
  // Handle notification click
  const handleNotificationClick = (notification) => {
    // Mark notification as read
    setNotifications(prev => 
      prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
    );
    
    // Close popover
    handleNotificationsClose();
    
    // Open corresponding agent
    if (onSelectAgent && notification.agentId) {
      // Find the agent by ID (in a real app, you'd fetch the agent or use a lookup)
      const mockAgentMap = {
        'a1': { id: 'a1', name: 'General Assistant', avatarColor: '#E0F2FE', iconColor: '#7DD3FC', description: 'All-purpose AI assistant for various tasks.' },
        'a2': { id: 'a2', name: 'Code Helper', avatarColor: '#DCFCE7', iconColor: '#86EFAC', description: 'Assists with programming tasks and debugging.' },
        'a3': { id: 'a3', name: 'Creative Writer', avatarColor: '#FEF3C7', iconColor: '#FDE68A', description: 'Helps with writing and content creation.' }
      };
      
      const agent = mockAgentMap[notification.agentId];
      if (agent) {
        onSelectAgent(agent);
      }
    }
  };
  
  // Handle logo click to navigate to landing page on mobile
  const handleLogoClick = () => {
    if (isMobile && onBackToExplore) {
      onBackToExplore();
    }
  };
  
  // Count unread notifications
  const unreadCount = notifications.filter(n => !n.read).length;
  
  // Format timestamp
  const formatTime = (timestamp) => {
    const now = new Date();
    const diffMs = now - timestamp;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 24 * 60) return `${Math.floor(diffMins / 60)}h ago`;
    return timestamp.toLocaleDateString();
  };

  return (
    <AppBar 
      position="static" 
      color="transparent" 
      elevation={0}
      sx={{ 
        borderBottom: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'background.paper',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', minHeight: '64px', px: { xs: 1, sm: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {isMobile ? (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={handleToggleSidebar}
              sx={{ mr: 1 }}
            >
              <MenuIcon />
            </IconButton>
          ) : (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="back to explore"
              onClick={onBackToExplore}
              sx={{ mr: 1 }}
            >
              <ArrowBackIcon />
            </IconButton>
          )}
          
          {/* Logo */}
          <Logo onClick={handleLogoClick} isMobile={isMobile} />
          
          {!isSmall && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              
              
              <Typography 
                variant="h6" 
                component="div" 
                sx={{ 
                  fontWeight: 'medium',
                  display: { xs: 'none', sm: 'block' },
                  fontSize: '1.15rem',
                  letterSpacing: '0.01em'
                }}
              >
                {'Agent Squad'}
              </Typography>
            </Box>
          )}
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {/* Notifications */}
          <IconButton 
            onClick={handleNotificationsClick}
            sx={{ 
              mr: 2,
              position: 'relative'
            }}
          >
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          
          <Popover
            open={notificationsOpen}
            anchorEl={notificationsAnchorEl}
            onClose={handleNotificationsClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            PaperProps={{
              elevation: 2,
              sx: { 
                width: 320,
                maxHeight: 400,
                overflow: 'hidden',
                borderRadius: 2
              }
            }}
          >
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="subtitle1" fontWeight={500}>
                Notifications
              </Typography>
            </Box>
            
            {notifications.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No notifications
                </Typography>
              </Box>
            ) : (
              <List sx={{ 
                p: 0,
                maxHeight: 320,
                overflowY: 'auto',
                '&::-webkit-scrollbar': {
                  width: '4px',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: 'rgba(0,0,0,0.2)',
                  borderRadius: '4px',
                }
              }}>
                {notifications.map((notification, index) => (
                  <React.Fragment key={notification.id}>
                    <ListItem 
                      button 
                      alignItems="flex-start"
                      onClick={() => handleNotificationClick(notification)}
                      sx={{ 
                        px: 2, 
                        py: 1.5,
                        bgcolor: notification.read ? 'transparent' : (
                          theme.palette.mode === 'dark' 
                            ? 'rgba(255,255,255,0.08)'
                            : 'rgba(0,0,0,0.04)'
                        )
                      }}
                    >
                      <ListItemAvatar sx={{ minWidth: 42 }}>
                        <AgentIcon agent={notification.agent} size="small" />
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" fontWeight={500}>
                              {notification.agent.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatTime(notification.timestamp)}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Typography 
                            variant="body2" 
                            color="text.primary" 
                            sx={{ 
                              mt: 0.5,
                              lineHeight: 1.4,
                              display: '-webkit-box',
                              overflow: 'hidden',
                              WebkitBoxOrient: 'vertical',
                              WebkitLineClamp: 2,
                            }}
                          >
                            {notification.message}
                          </Typography>
                        }
                      />
                    </ListItem>
                    {index < notifications.length - 1 && <Divider component="li" />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </Popover>
          
          
          <IconButton 
            sx={{ 
              ml: 1, 
              border: '1px dashed',
              borderColor: 'divider',
              borderRadius: '50%'
            }}
          >
            <RefreshIcon />
          </IconButton>
          
          {/* User Profile Icon */}
          <IconButton
            onClick={handleProfileMenuOpen}
            size="medium"
            edge="end"
            aria-label="account of current user"
            aria-controls="profile-menu"
            aria-haspopup="true"
            sx={{ ml: 2 }}
          >
            {mockUser.avatar ? (
              <Avatar 
                src={mockUser.avatar} 
                alt={mockUser.name}
                sx={{ width: 36, height: 36 }}
              />
            ) : (
              <Avatar sx={{ 
                width: 36, 
                height: 36, 
                bgcolor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
              }}>
                {mockUser.name.charAt(0).toUpperCase()}
              </Avatar>
            )}
          </IconButton>
          
          {/* User Profile Menu */}
          <Menu
            id="profile-menu"
            anchorEl={profileAnchorEl}
            keepMounted
            open={profileMenuOpen}
            onClose={handleProfileMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            PaperProps={{
              elevation: 2,
              sx: { 
                minWidth: 200,
                borderRadius: 2,
                mt: 0.5
              }
            }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="subtitle1" fontWeight={500}>{mockUser.name}</Typography>
              <Typography variant="body2" color="text.secondary">{mockUser.email}</Typography>
            </Box>
            <Divider />
            
            <MenuItem onClick={handleProfileMenuClose}>
              <ListItemIcon>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Profile" />
            </MenuItem>
            
            <MenuItem onClick={handleProfileMenuClose}>
              <ListItemIcon>
                <SettingsIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Settings" />
            </MenuItem>
            
            <Divider />
            
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default TopBar; 