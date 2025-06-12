import { Box, Typography, IconButton } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';

const ChatHeader = ({ agent }) => {
  if (!agent) return null;
  
  return (
    <Box 
      sx={{ 
        p: 2, 
        borderBottom: 1, 
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'background.paper'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Box
          sx={{
            width: 46,
            height: 46,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mr: 2,
            backgroundColor: agent.avatarColor || '#E0F2FE', // Default pastel blue if not specified
            border: `1px solid ${agent.iconColor || '#7DD3FC'}`,
          }}
        >
          <Box
            component="img"
            src="/images/agent.svg"
            alt="Agent icon"
            sx={{
              width: 34,
              height: 34,
              filter: `opacity(0.9) drop-shadow(0 0 0.5px ${agent.iconColor || '#7DD3FC'})`,
            }}
          />
        </Box>
        <Box>
          <Typography variant="h6" sx={{ 
            fontSize: '1.15rem',
            fontWeight: 500,
            letterSpacing: '0.01em'
          }}>
            {agent.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.9rem' }}>
            {agent.description}
          </Typography>
        </Box>
      </Box>
      
      <IconButton>
        <MoreVertIcon />
      </IconButton>
    </Box>
  );
};

export default ChatHeader; 