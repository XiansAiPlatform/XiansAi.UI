import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Avatar,
  Box,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  SmartToy as AgentIcon,
  Launch as LaunchIcon,
  Info as InfoIcon,
  Rocket as DeployIcon
} from '@mui/icons-material';

const TemplateCard = ({ template, onDeploy, onViewDetails, isDeploying = false }) => {
  const [deploying, setDeploying] = useState(false);
  
  const { agent, definitions } = template;
  
  // Generate a description based on available data
  const getDescription = () => {
    if (definitions && definitions.length > 0) {
      const workflowTypes = [...new Set(definitions.map(def => def.workflowType))];
      return `Template with ${definitions.length} workflow${definitions.length > 1 ? 's' : ''}: ${workflowTypes.slice(0, 2).join(', ')}${workflowTypes.length > 2 ? '...' : ''}`;
    }
    return 'System agent template ready for deployment';
  };

  const handleDeploy = async () => {
    if (onDeploy && !deploying && !isDeploying) {
      setDeploying(true);
      try {
        await onDeploy(agent);
      } finally {
        setDeploying(false);
      }
    }
  };

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(agent);
    }
  };

  return (
    <Card 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 4
        }
      }}
    >
      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
          <Avatar
            sx={{
              bgcolor: 'primary.main',
              width: 48,
              height: 48,
              mr: 2
            }}
          >
            <AgentIcon />
          </Avatar>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography 
              variant="h6" 
              component="h3"
              sx={{ 
                fontWeight: 600,
                mb: 0.5,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {agent.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Chip
                label="System Template"
                size="small"
                color="primary"
                variant="outlined"
                sx={{ fontSize: '0.75rem' }}
              />
              {definitions && definitions.length > 0 && (
                <Chip
                  label={`${definitions.length} Workflow${definitions.length > 1 ? 's' : ''}`}
                  size="small"
                  color="secondary"
                  variant="outlined"
                  sx={{ fontSize: '0.75rem' }}
                />
              )}
            </Box>
          </Box>
        </Box>
        
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ 
            mb: 2,
            lineHeight: 1.4,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {getDescription()}
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
          <Typography variant="caption" color="text.secondary">
            Created: {new Date(agent.createdAt).toLocaleDateString()}
          </Typography>
          <Tooltip title="View template details">
            <IconButton 
              size="small" 
              onClick={handleViewDetails}
              sx={{ color: 'text.secondary' }}
            >
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </CardContent>
      
      <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
        <Button
          variant="contained"
          startIcon={deploying || isDeploying ? <CircularProgress size={16} /> : <DeployIcon />}
          onClick={handleDeploy}
          disabled={deploying || isDeploying}
          fullWidth
          sx={{
            fontWeight: 600,
            textTransform: 'none'
          }}
        >
          {deploying || isDeploying ? 'Deploying...' : 'Deploy Template'}
        </Button>
      </CardActions>
    </Card>
  );
};

export default TemplateCard;
