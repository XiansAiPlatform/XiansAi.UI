import React from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Button,
  Divider,
  List,
  ListItem
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { mockAgents } from '../../definitions';

const AgentsLanding = ({ onSelectAgent, onSelectPrompt }) => {
  const theme = useTheme();

  const handlePromptClick = (agent, prompt) => {
    if (onSelectAgent && onSelectPrompt) {
      onSelectAgent(agent);
      onSelectPrompt(prompt);
    }
  };

  const handleExploreClick = (agent) => {
    if (onSelectAgent) {
      onSelectAgent(agent);
    }
  };

  return (
    <Box sx={{ 
      p: { xs: 3, md: 5 },
      height: '100%',
      overflowY: 'auto',
      overflowX: 'hidden',
      background: theme.palette.mode === 'dark' 
        ? '#1A1A1A' 
        : '#F9F9FB'
    }}>
      <Typography 
        variant="h4" 
        component="h1" 
        gutterBottom
        sx={{ 
          fontWeight: 600,
          mb: 3,
          textAlign: { xs: 'center', md: 'left' }
        }}
      >
        AI Agents
      </Typography>

      <Typography 
        variant="body1" 
        color="text.secondary" 
        paragraph
        sx={{ 
          mb: 5,
          maxWidth: 600,
          textAlign: { xs: 'center', md: 'left' },
          fontSize: '1rem',
          letterSpacing: '0.01em'
        }}
      >
        Select an agent and try one of the suggested prompts.
      </Typography>
      
      <Grid container spacing={6}>
        {mockAgents.map((agent) => (
          <Grid item xs={12} md={6} key={agent.id}>
            <Box sx={{ mb: 5 }}>
              {/* Agent Header */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 3,
                justifyContent: 'space-between'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box
                    sx={{
                      width: 52,
                      height: 52,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 2,
                      backgroundColor: agent.avatarColor,
                      border: `1px solid ${agent.iconColor}`,
                    }}
                  >
                    <Box
                      component="img"
                      src="/images/agent.svg"
                      alt="Agent icon"
                      sx={{
                        width: 38,
                        height: 38,
                        filter: `opacity(0.9) drop-shadow(0 0 0.5px ${agent.iconColor})`,
                      }}
                    />
                  </Box>
                  <Box>
                    <Typography variant="h5" component="h2" sx={{ 
                      fontSize: '1.4rem',
                      fontWeight: 500,
                      letterSpacing: '0.01em',
                      mb: 0.5
                    }}>
                      {agent.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.95rem' }}>
                      {agent.description}
                    </Typography>
                  </Box>
                </Box>
                
                <Button 
                  variant="text" 
                  endIcon={<ChevronRightIcon />}
                  onClick={() => handleExploreClick(agent)}
                  sx={{ 
                    textTransform: 'none',
                    fontSize: '0.95rem'
                  }}
                >
                  Chat
                </Button>
              </Box>
              
              {/* Divider */}
              <Divider sx={{ 
                mb: 2.5,
                borderColor: theme.palette.mode === 'dark' 
                  ? 'rgba(255,255,255,0.1)'
                  : 'rgba(0,0,0,0.06)'
              }} />
              
              {/* Prompts List */}
              <List sx={{ pl: 0 }}>
                {agent.prompts.map((prompt, index) => (
                  <ListItem 
                    key={index}
                    disableGutters
                    disablePadding
                    sx={{
                      mb: 2,
                      p: 2.5,
                      borderRadius: 2,
                      backgroundColor: theme.palette.mode === 'dark' 
                        ? 'rgba(255,255,255,0.03)'
                        : agent.avatarColor + '33', // Add 33 (20% opacity) to pastel color
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: theme.palette.mode === 'dark' 
                          ? 'rgba(255,255,255,0.07)'
                          : agent.avatarColor + '66', // Add 66 (40% opacity) to pastel color
                        pl: 3
                      }
                    }}
                    onClick={() => handlePromptClick(agent, prompt)}
                  >
                    <Typography sx={{ 
                      fontSize: '1.05rem',
                      lineHeight: 1.5,
                      letterSpacing: '0.01em',
                      color: theme.palette.mode === 'dark' 
                        ? 'rgba(255,255,255,0.95)'
                        : 'rgba(0,0,0,0.85)'
                    }}>
                      {prompt}
                    </Typography>
                  </ListItem>
                ))}
              </List>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default AgentsLanding; 