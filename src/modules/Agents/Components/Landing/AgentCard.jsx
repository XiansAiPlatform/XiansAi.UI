import { 
  Box, 
  Typography, 
  Button,
  Divider
} from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useTheme } from '@mui/material/styles';
import PromptList from './PromptList';
import { avatarStyles, dividerStyles } from './styles';

const AgentCard = ({ agent, onSelectAgent, onSelectPrompt }) => {
  const theme = useTheme();

  const handleExploreClick = () => {
    if (onSelectAgent) {
      onSelectAgent(agent);
    }
  };

  const handlePromptClick = (prompt) => {
    if (onSelectAgent && onSelectPrompt) {
      onSelectAgent(agent);
      onSelectPrompt(prompt);
    }
  };

  return (
    <Box sx={{ mb: 5 }}>
      {/* Agent Header - Reduced focus */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: 2,
        justifyContent: 'space-between'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={avatarStyles(agent.avatarColor, agent.iconColor).container}>
            <Box
              component="img"
              src="/images/agent.svg"
              alt="Agent icon"
              sx={avatarStyles(agent.avatarColor, agent.iconColor).icon}
            />
          </Box>
          <Box>
            <Typography variant="h6" component="h2" sx={{ 
              fontSize: '1.1rem',
              fontWeight: 500,
              letterSpacing: '0.01em',
            }}>
              {agent.name}
            </Typography>
          </Box>
        </Box>
        
        <Button 
          variant="text" 
          endIcon={<ChevronRightIcon />}
          onClick={handleExploreClick}
          sx={{ 
            textTransform: 'none',
            fontSize: '0.9rem'
          }}
        >
          Chat
        </Button>
      </Box>
      
      {/* Divider */}
      <Divider sx={dividerStyles(theme)} />
      
      {/* Prompts List */}
      <PromptList 
        prompts={agent.prompts}
        iconColor={agent.iconColor}
        avatarColor={agent.avatarColor}
        onPromptClick={handlePromptClick}
      />
    </Box>
  );
};

export default AgentCard; 