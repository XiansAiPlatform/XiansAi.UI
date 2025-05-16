import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import AgentIcon from './AgentIcon';

const Message = ({ message, isUser, agent }) => (
  <Box 
    sx={{ 
      display: 'flex', 
      flexDirection: isUser ? 'row-reverse' : 'row',
      mb: 2
    }}
  >
    {!isUser && (
      <Box sx={{ mr: 1.5 }}>
        <AgentIcon agent={agent} size="small" />
      </Box>
    )}
    
    <Paper 
      elevation={1} 
      sx={{ 
        p: 2, 
        maxWidth: '80%',
        borderRadius: 2,
        backgroundColor: isUser 
          ? 'primary.light' 
          : agent && agent.avatarColor 
            ? `${agent.avatarColor}33` // 20% opacity
            : 'background.paper',
        ml: isUser ? 1 : 0,
        mr: isUser ? 0 : 1,
        color: isUser ? 'white' : 'text.primary',
      }}
    >
      <Typography variant="body1">{message.text}</Typography>
      <Typography variant="caption" sx={{ display: 'block', mt: 1, opacity: 0.7 }}>
        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Typography>
    </Paper>
  </Box>
);

export default Message; 