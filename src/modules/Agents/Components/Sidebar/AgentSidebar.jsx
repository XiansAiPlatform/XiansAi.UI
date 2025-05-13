import React, { useState } from 'react';
import { 
  Box, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemText, 
  ListItemAvatar, 
  TextField,
  InputAdornment,
  IconButton,
  Drawer,
  useMediaQuery,
  Divider,
  ListItemIcon,
  Tooltip,
  Typography
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import HomeIcon from '@mui/icons-material/Home';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import MenuIcon from '@mui/icons-material/Menu';
import { mockAgents } from '../../definitions';
import { useNavigate } from 'react-router-dom';

// Agent avatar component
const AgentAvatar = ({ agent, size = 42 }) => (
  <Box
    sx={{
      width: size,
      height: size,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: agent.avatarColor,
      border: `1px solid ${agent.iconColor}`,
    }}
  >
    <Box
      component="img"
      src="/images/agent.svg"
      alt="Agent icon"
      sx={{
        width: Math.floor(size * 0.76),
        height: Math.floor(size * 0.76),
        filter: `opacity(0.9) drop-shadow(0 0 0.5px ${agent.iconColor})`,
      }}
    />
  </Box>
);

const AgentSidebar = ({ selectedAgent, setSelectedAgent, mobileOpen, setMobileOpen, onBackToExplore, collapsed = false, onToggleCollapse }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  
  const filteredAgents = mockAgents.filter(agent => 
    agent.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleAgentSelect = (agent) => {
    setSelectedAgent(agent);
    navigate(`/agents/chat/${agent.id}`);
    if (isMobile) {
      setMobileOpen(false);
    }
  };
  
  const handleExploreClick = () => {
    console.log('handleExploreClick called, onBackToExplore:', !!onBackToExplore);
    if (typeof onBackToExplore === 'function') {
      onBackToExplore();
      setMobileOpen(false);
    } else {
      console.error('onBackToExplore is not a function or is not provided to AgentSidebar');
      // Try to navigate to home page using window.location as a fallback
      window.location.href = '/';
    }
  };
  
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  const clearSearch = () => {
    setSearchQuery('');
  };

  // Collapsed sidebar content - only agent icons
  const collapsedSidebarContent = (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      py: 2,
      height: '100%',
      borderRight: 1,
      borderColor: 'divider'
    }}>
      <Tooltip title="Expand sidebar" placement="right">
        <IconButton 
          onClick={onToggleCollapse}
          sx={{ 
            mb: 3,
            backgroundColor: theme.palette.mode === 'dark' 
              ? 'rgba(255,255,255,0.04)'
              : 'rgba(0,0,0,0.02)',
            '&:hover': {
              backgroundColor: theme.palette.mode === 'dark' 
                ? 'rgba(255,255,255,0.08)'
                : 'rgba(0,0,0,0.04)',
            }
          }}
        >
          <MenuIcon />
        </IconButton>
      </Tooltip>
      
      <Box sx={{ 
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        overflowY: 'auto',
        width: '100%',
        px: 1
      }}>
        {filteredAgents.map((agent) => (
          <Tooltip key={agent.id} title={agent.name} placement="right">
            <IconButton
              onClick={() => handleAgentSelect(agent)}
              sx={{ 
                p: 0.5,
                bgcolor: selectedAgent?.id === agent.id ? `${agent.avatarColor}99` : 'transparent',
                border: selectedAgent?.id === agent.id ? `2px solid ${agent.iconColor}` : '2px solid transparent',
                borderRadius: '50%',
                '&:hover': {
                  bgcolor: `${agent.avatarColor}77`
                }
              }}
            >
              <AgentAvatar agent={agent} size={36} />
            </IconButton>
          </Tooltip>
        ))}
      </Box>
    </Box>
  );

  // Full sidebar content
  const fullSidebarContent = (
    <Box sx={{ 
      p: 2, 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%',
      maxHeight: '100%',
      overflow: 'hidden' 
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        {isMobile ? (
          <IconButton size="small" onClick={() => setMobileOpen(false)}>
            <CloseIcon />
          </IconButton>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton 
                size="small" 
                onClick={onToggleCollapse}
                aria-label="Collapse sidebar"
                sx={{ mr: 1 }}
              >
                <MenuOpenIcon />
              </IconButton>
              <Typography variant="subtitle1" fontWeight="medium">Agents</Typography>
            </Box>
          </Box>
        )}
      </Box>
      
      {/* Mobile-only Explore link */}
      {isMobile && (
        <>
          <ListItem disablePadding sx={{ mb: 2 }}>
            <ListItemButton 
              onClick={handleExploreClick}
              onTouchStart={() => console.log('Button touched')}
              sx={{ 
                borderRadius: 1,
                backgroundColor: theme.palette.mode === 'dark' 
                  ? 'rgba(255,255,255,0.04)'
                  : 'rgba(0,0,0,0.02)',
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'dark' 
                    ? 'rgba(255,255,255,0.08)'
                    : 'rgba(0,0,0,0.04)',
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <HomeIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Back to Home" 
                primaryTypographyProps={{
                  fontWeight: 'medium',
                  fontSize: '0.95rem'
                }}
              />
            </ListItemButton>
          </ListItem>
          <Divider sx={{ mb: 2 }} />
        </>
      )}
      
      <TextField
        fullWidth
        placeholder="Search agents..."
        variant="outlined"
        size="small"
        value={searchQuery}
        onChange={handleSearchChange}
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
          endAdornment: searchQuery ? (
            <InputAdornment position="end">
              <IconButton size="small" onClick={clearSearch}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ) : null
        }}
      />
      
      <Box sx={{ 
        flex: 1, 
        overflowY: 'auto',
        overflowX: 'hidden',
        '&::-webkit-scrollbar': {
          width: '4px',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgba(0,0,0,0.2)',
          borderRadius: '4px',
        }
      }}>
        <List disablePadding>
          {filteredAgents.map((agent) => (
            <ListItem disablePadding key={agent.id} sx={{ mb: 1 }}>
              <ListItemButton 
                selected={selectedAgent?.id === agent.id}
                onClick={() => handleAgentSelect(agent)}
                sx={{ 
                  borderRadius: 1,
                  backgroundColor: selectedAgent?.id === agent.id 
                    ? `${agent.avatarColor}99` // 60% opacity
                    : 'transparent'
                }}
              >
                <ListItemAvatar>
                  <AgentAvatar agent={agent} />
                </ListItemAvatar>
                <ListItemText 
                  primary={agent.name} 
                  secondary={agent.description}
                  primaryTypographyProps={{
                    fontWeight: selectedAgent?.id === agent.id ? 'medium' : 'regular',
                    fontSize: '0.95rem'
                  }}
                  secondaryTypographyProps={{
                    fontSize: '0.8rem'
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  );

  // Choose which content to display based on collapsed state and device
  const sidebarContent = collapsed && !isMobile ? collapsedSidebarContent : fullSidebarContent;

  return isMobile ? (
    <Drawer
      variant="temporary"
      open={mobileOpen}
      onClose={() => setMobileOpen(false)}
      ModalProps={{
        keepMounted: true, // Better mobile performance
      }}
      sx={{
        display: { xs: 'block', md: 'none' },
        '& .MuiDrawer-paper': { 
          width: 280,
          boxSizing: 'border-box',
          boxShadow: 3,
          height: '100%',
          maxHeight: '100%'
        },
      }}
    >
      {sidebarContent}
    </Drawer>
  ) : (
    <Box
      sx={{
        width: collapsed ? 72 : 280,
        minWidth: collapsed ? 72 : 280,
        flexShrink: 0,
        display: { xs: 'none', md: 'block' },
        height: '100%',
        maxHeight: '100%',
        overflow: 'hidden',
        transition: 'width 0.3s ease'
      }}
    >
      {sidebarContent}
    </Box>
  );
};

export default AgentSidebar; 