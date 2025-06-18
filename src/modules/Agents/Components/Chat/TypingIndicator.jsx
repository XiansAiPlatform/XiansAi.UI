import { Box, Paper, Typography, CircularProgress } from '@mui/material';
import AgentIcon from './AgentIcon';

const TypingIndicator = ({ agent }) => (
  <Box sx={{ display: 'flex', p: 2 }}>
    <Box sx={{ mr: 1.5 }}>
      <AgentIcon agent={agent} size="small" />
    </Box>
    <Paper elevation={1} sx={{ 
      p: 2, 
      borderRadius: 2,
      backgroundColor: agent?.avatarColor ? `${agent.avatarColor}33` : 'background.paper'
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <CircularProgress size={20} thickness={5} />
        <Typography variant="body2" sx={{ ml: 1 }}>Thinking...</Typography>
      </Box>
    </Paper>
  </Box>
);

export default TypingIndicator; 