import { Box } from '@mui/material';

const AgentIcon = ({ agent, size = 'medium' }) => {
  // Size presets
  const sizes = {
    small: { container: 34, icon: 24 },
    medium: { container: 42, icon: 32 },
    large: { container: 80, icon: 60 }
  };
  
  const { container, icon } = sizes[size] || sizes.medium;
  
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
        border: `1px solid ${iconColor}`,
      }}
    >
      <Box
        component="img"
        src="/images/agent.svg"
        alt="Agent icon"
        sx={{
          width: icon,
          height: icon,
          filter: `opacity(0.9) drop-shadow(0 0 0.5px ${iconColor})`,
        }}
      />
    </Box>
  );
};

export default AgentIcon; 