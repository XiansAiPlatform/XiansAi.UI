import { Box, Typography } from '@mui/material';
import AgentIcon from './AgentIcon';

const WelcomeMessage = ({ agent }) => (
  <Box sx={{ textAlign: 'center', mt: 4, p: 2 }}>
    <Box sx={{ mx: 'auto', mb: 2, display: 'flex', justifyContent: 'center' }}>
      <AgentIcon agent={agent} size="large" />
    </Box>
    <Typography variant="h5" gutterBottom sx={{ fontWeight: 500 }}>
      {agent.name}
    </Typography>
    <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto' }}>
      I'm your AI assistant. How can I help you today?
    </Typography>
  </Box>
);

export default WelcomeMessage; 