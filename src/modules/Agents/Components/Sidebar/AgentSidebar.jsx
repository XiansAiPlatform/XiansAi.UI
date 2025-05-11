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
  ListItemIcon
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import ExploreIcon from '@mui/icons-material/Explore';
import HomeIcon from '@mui/icons-material/Home';

// Mock data - would come from an API in a real app
const mockAgents = [
  { 
    id: 'a1', 
    name: 'General Assistant', 
    description: 'General purpose AI assistant', 
    avatarColor: '#E0F2FE', 
    iconColor: '#7DD3FC' 
  },
  { 
    id: 'a2', 
    name: 'Code Helper', 
    description: 'Helps with programming tasks', 
    avatarColor: '#DCFCE7', 
    iconColor: '#86EFAC' 
  },
  { 
    id: 'a3', 
    name: 'Creative Writer', 
    description: 'Assists with creative writing', 
    avatarColor: '#FEF3C7', 
    iconColor: '#FDE68A' 
  },
  { 
    id: 'a4', 
    name: 'Math Tutor', 
    description: 'Helps solve mathematical problems', 
    avatarColor: '#FECDD3', 
    iconColor: '#FDA4AF' 
  },
  { 
    id: 'a5', 
    name: 'Research Assistant', 
    description: 'Helps gather information', 
    avatarColor: '#E9D5FF', 
    iconColor: '#D8B4FE' 
  },
];

const AgentSidebar = ({ selectedAgent, setSelectedAgent, mobileOpen, setMobileOpen, onBackToExplore }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredAgents = mockAgents.filter(agent => 
    agent.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleAgentSelect = (agent) => {
    setSelectedAgent(agent);
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

  const sidebarContent = (
    <Box sx={{ 
      p: 2, 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%',
      maxHeight: '100%',
      overflow: 'hidden' 
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        {isMobile && (
          <IconButton size="small" onClick={() => setMobileOpen(false)}>
            <CloseIcon />
          </IconButton>
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
                  <Box
                    sx={{
                      width: 42,
                      height: 42,
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
                        width: 32,
                        height: 32,
                        filter: `opacity(0.9) drop-shadow(0 0 0.5px ${agent.iconColor})`,
                      }}
                    />
                  </Box>
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
        width: { sm: 280 },
        flexShrink: 0,
        display: { xs: 'none', md: 'block' },
        borderRight: 1,
        borderColor: 'divider',
        height: '100%',
        maxHeight: '100%',
        overflow: 'hidden'
      }}
    >
      {sidebarContent}
    </Box>
  );
};

export default AgentSidebar; 