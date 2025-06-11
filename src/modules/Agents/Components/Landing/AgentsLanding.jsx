import React from 'react';
import { Box, Grid } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { mockAgents } from '../../definitions';
import AgentsHeader from './AgentsHeader';
import AgentCard from './AgentCard';
import { containerStyles } from './styles';

/**
 * Landing page for AI Agents
 * @param {Function} onSelectAgent - Callback when an agent is selected
 * @param {Function} onSelectPrompt - Callback when a prompt is selected
 */
const AgentsLanding = ({ onSelectAgent, onSelectPrompt }) => {
  const theme = useTheme();

  return (
    <Box sx={containerStyles(theme)}>
      <AgentsHeader />
      <Grid container spacing={6}>
        {mockAgents.map((agent) => (
          <Grid
            key={agent.id}
            size={{
              xs: 12,
              md: 6
            }}>
            <AgentCard 
              agent={agent}
              onSelectAgent={onSelectAgent}
              onSelectPrompt={onSelectPrompt}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default AgentsLanding; 