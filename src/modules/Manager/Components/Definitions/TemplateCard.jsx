import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  SmartToy as SmartToyIcon,
  Launch as LaunchIcon,
  Info as InfoIcon,
  CloudUpload as DeployIcon,
  Delete as DeleteIcon,
  AutoAwesome as AutoAwesomeIcon,
  Psychology as PsychologyIcon,
  Biotech as BiotechIcon,
  Engineering as EngineeringIcon,
  Science as ScienceIcon,
  FlashOn as FlashOnIcon,
  Stars as StarsIcon,
  AutoFixHigh as AutoFixHighIcon
} from '@mui/icons-material';
import { useSlider } from '../../contexts/SliderContext';
import DeploymentWizard from './Deploy/DeploymentWizard';

const TemplateCard = ({ template, onDeploy, onViewDetails, onDelete, isDeploying = false, isSysAdmin = false }) => {
  const { openSlider, closeSlider } = useSlider();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const { agent, definitions } = template;

  // Array of different agent icons for variety
  const agentIcons = [
    SmartToyIcon,
    AutoAwesomeIcon,
    PsychologyIcon,
    BiotechIcon,
    EngineeringIcon,
    ScienceIcon,
    FlashOnIcon,
    StarsIcon,
    AutoFixHighIcon
  ];

  // Get a consistent random icon based on agent ID
  const getRandomIconComponent = () => {
    if (!agent?.id) return SmartToyIcon;
    // Use agent ID to generate a consistent index
    const hash = agent.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const index = hash % agentIcons.length;
    return agentIcons[index];
  };

  const IconComponent = getRandomIconComponent();
  
  // Parse onboardingJson safely
  const parseOnboardingJson = () => {
    try {
      if (agent.onboardingJson && typeof agent.onboardingJson === 'string') {
        return JSON.parse(agent.onboardingJson);
      }
    } catch (error) {
      console.warn('Failed to parse onboardingJson:', error);
    }
    return null;
  };

  const onboardingData = parseOnboardingJson();
  
  // Get display name from onboardingJson or fallback to agent name
  const getDisplayName = () => {
    return onboardingData?.['display-name'] || agent.name;
  };

  // Generate a description based on agent object, onboardingJson, or available data
  const getDescription = () => {
    // First check the agent object directly (from server response)
    if (agent.description) {
      return agent.description;
    }
    // Fallback to onboardingJson
    if (onboardingData?.description) {
      return onboardingData.description;
    }
    if (definitions && definitions.length > 0) {
      const workflowTypes = [...new Set(definitions.map(def => def.workflowType))];
      return `Template with ${definitions.length} workflow${definitions.length > 1 ? 's' : ''}: ${workflowTypes.slice(0, 2).join(', ')}${workflowTypes.length > 2 ? '...' : ''}`;
    }
    return 'System agent template ready for deployment';
  };

  // Get tags from onboardingJson
  const getTags = () => {
    return onboardingData?.tags || [];
  };

  // Get version from agent object or onboardingJson
  const getVersion = () => {
    // First check the agent object directly (from server response)
    if (agent.version) {
      return agent.version;
    }
    // Fallback to onboardingJson
    return onboardingData?.version;
  };

  // Get author from agent object or onboardingJson
  const getAuthor = () => {
    // First check the agent object directly (from server response)
    if (agent.author) {
      return agent.author;
    }
    // Fallback to onboardingJson
    return onboardingData?.author;
  };

  // Get icon from onboardingJson
  const getIcon = () => {
    return onboardingData?.icon;
  };

  // Get URL from onboardingJson
  const getUrl = () => {
    return onboardingData?.url;
  };

  const handleDeploy = () => {
    if (!isDeploying) {
      const displayName = parseOnboardingJson()?.['display-name'] || agent.name;
      
      openSlider(
        <DeploymentWizard
          template={template}
          onDeploy={async (deploymentData) => {
            // Call the original onDeploy function if provided
            if (onDeploy) {
              return await onDeploy(deploymentData);
            }
            // Default deployment simulation
            return new Promise((resolve) => {
              setTimeout(() => {
                resolve({
                  success: true,
                  instanceId: `${deploymentData.config.instanceName}-${Date.now()}`,
                  message: 'Template deployed successfully'
                });
              }, 3000);
            });
          }}
          onCancel={closeSlider}
        />,
        `Deploy ${displayName}`
      );
    }
  };

  const handleViewDetails = () => {
    openSlider(
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
            {getDisplayName()}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
            <Chip
              label="System Template"
              size="small"
              sx={{ 
                bgcolor: 'success.50',
                color: 'success.700',
                border: 'none'
              }}
            />
            {getVersion() && (
              <Chip
                label={`Version ${getVersion()}`}
                size="small"
                sx={{ 
                  bgcolor: 'primary.50',
                  color: 'primary.700',
                  border: 'none'
                }}
              />
            )}
          </Box>
        </Box>

        {/* Agent Information */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
            Agent Information
          </Typography>
          <Box sx={{ bgcolor: 'grey.50', borderRadius: 2, p: 2 }}>
            {agent.name && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  Agent Name
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  {agent.name}
                </Typography>
              </Box>
            )}
            
            {getDescription() && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  Description
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5, lineHeight: 1.6 }}>
                  {getDescription()}
                </Typography>
              </Box>
            )}

            {getAuthor() && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  Author
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  {getAuthor()}
                </Typography>
              </Box>
            )}

            {agent.createdBy && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  Created By
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  {agent.createdBy}
                </Typography>
              </Box>
            )}

            {agent.createdAt && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  Created Date
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  {new Date(agent.createdAt).toLocaleString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Typography>
              </Box>
            )}

            {agent.id && (
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  Agent ID
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5, fontFamily: 'monospace', fontSize: '0.8rem' }}>
                  {agent.id}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        {/* Tags */}
        {getTags().length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
              Tags
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {getTags().map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  size="small"
                  variant="outlined"
                  sx={{ 
                    borderColor: 'grey.300',
                    color: 'text.secondary'
                  }}
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Associated Workflows */}
        {definitions && definitions.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
              Associated Workflows ({definitions.length})
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {definitions.map((definition, index) => (
                <Box 
                  key={index}
                  sx={{ 
                    bgcolor: 'grey.50', 
                    borderRadius: 2, 
                    p: 2,
                    border: '1px solid',
                    borderColor: 'grey.200'
                  }}
                >
                  <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                    {definition.name || `Workflow ${index + 1}`}
                  </Typography>
                  
                  {definition.workflowType && (
                    <Box sx={{ mb: 1 }}>
                      <Chip
                        label={definition.workflowType}
                        size="small"
                        sx={{ 
                          bgcolor: 'primary.50',
                          color: 'primary.700',
                          fontSize: '0.75rem',
                          height: '24px'
                        }}
                      />
                    </Box>
                  )}

                  {definition.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1, lineHeight: 1.5 }}>
                      {definition.description}
                    </Typography>
                  )}

                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 1 }}>
                    {definition.id && (
                      <Typography variant="caption" color="text.secondary">
                        ID: <span style={{ fontFamily: 'monospace' }}>{definition.id}</span>
                      </Typography>
                    )}
                    {definition.version && (
                      <Typography variant="caption" color="text.secondary">
                        Version: {definition.version}
                      </Typography>
                    )}
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* External URL */}
        {getUrl() && (
          <Box sx={{ mb: 2 }}>
            <Button
              variant="outlined"
              startIcon={<LaunchIcon />}
              onClick={() => window.open(getUrl(), '_blank', 'noopener,noreferrer')}
              sx={{
                textTransform: 'none',
                borderRadius: 2
              }}
            >
              Visit External Documentation
            </Button>
          </Box>
        )}

        {/* Close Button */}
        <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid', borderColor: 'grey.200' }}>
          <Button
            variant="contained"
            onClick={closeSlider}
            sx={{
              textTransform: 'none',
              borderRadius: 2,
              px: 3
            }}
          >
            Close
          </Button>
        </Box>
      </Box>,
      `${getDisplayName()} - Details`
    );
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (onDelete && agent?.name) {
      setIsDeleting(true);
      try {
        await onDelete(agent.name);
      } catch (error) {
        console.error('Error deleting template:', error);
        // Error notification is handled by the parent component
      } finally {
        // Always close the dialog and reset state, whether success or error
        // The notification will inform the user of the result
        setIsDeleting(false);
        setDeleteDialogOpen(false);
      }
    }
  };

  return (
    <>
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Delete Template
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description" component="div">
            <Box sx={{ mb: 2 }}>
              Are you sure you want to delete the template "<strong>{getDisplayName()}</strong>"?
            </Box>
            <Box 
              sx={{ 
                bgcolor: 'warning.50', 
                border: '1px solid', 
                borderColor: 'warning.200',
                borderRadius: 2, 
                p: 2, 
                mb: 2 
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: 'warning.800' }}>
                ⚠️ Important: Knowledge Deletion
              </Typography>
              <Typography variant="body2" sx={{ mb: 1, color: 'text.primary' }}>
                • All template-associated knowledge will be <strong>permanently deleted</strong>
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.primary' }}>
                • Knowledge that has been overridden in specific tenants or activations will <strong>NOT be deleted</strong>
              </Typography>
            </Box>
            <Box sx={{ color: 'text.secondary' }}>
              This action cannot be undone and will remove the system-scoped agent and all its associated flow definitions.
            </Box>
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={handleDeleteCancel} 
            disabled={isDeleting}
            sx={{ textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            disabled={isDeleting}
            startIcon={isDeleting ? <CircularProgress size={16} /> : <DeleteIcon />}
            sx={{ textTransform: 'none' }}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    <Card 
      sx={{ 
        height: '100%',
        minHeight: 200,
        display: 'flex',
        flexDirection: 'row',
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'grey.100',
        boxShadow: 'none',
        bgcolor: 'background.paper',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
        position: 'relative',
        '&:hover': {
          borderColor: 'primary.light',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
          transform: 'translateY(-2px)',
          '& .delete-button': {
            opacity: 1,
            visibility: 'visible'
          }
        }
      }}
    >
      {/* Delete Button for System Admins */}
      {isSysAdmin && (
        <Tooltip title="Delete template" placement="top">
          <IconButton
            className="delete-button"
            onClick={handleDeleteClick}
            disabled={isDeleting}
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              zIndex: 1,
              bgcolor: 'background.paper',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              opacity: 0,
              visibility: 'hidden',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                bgcolor: 'error.light',
                color: 'error.contrastText',
              }
            }}
            size="small"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      {/* Dynamic Square Image Section */}
      <Box
        sx={{
          aspectRatio: '1 / 1',
          height: '100%',
          minWidth: 280,
          bgcolor: getIcon() ? 'transparent' : 'primary.main',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          backgroundImage: getIcon() ? `url(${getIcon()})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {!getIcon() && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%'
            }}
          >
            <IconComponent 
              sx={{ 
                fontSize: 120, 
                color: 'white',
                opacity: 0.9,
                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))'
              }} 
            />
          </Box>
        )}
        
        {/* Enhanced Overlay for better contrast */}
        {getIcon() && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(135deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.15) 100%)',
              pointerEvents: 'none'
            }}
          />
        )}
      </Box>

      {/* Content Section */}
      <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minWidth: 0 }}>
        <CardContent sx={{ flexGrow: 1, p: 3, pb: 2 }}>
          {/* Title and Metadata */}
          <Box sx={{ mb: 2 }}>
            <Typography 
              variant="h6" 
              component="h3"
              sx={{ 
                fontWeight: 700,
                mb: 1,
                fontSize: '1.1rem',
                lineHeight: 1.3,
                color: 'text.primary'
              }}
            >
              {getDisplayName()}
            </Typography>
            
            {/* Metadata Chips */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, flexWrap: 'wrap' }}>
              <Chip
                label="System Template"
                size="small"
                sx={{ 
                  fontSize: '0.7rem',
                  height: '22px',
                  bgcolor: 'success.50',
                  color: 'success.700',
                  border: 'none',
                  '& .MuiChip-label': { px: 1 }
                }}
              />
              {getVersion() && (
                <Chip
                  label={`v${getVersion()}`}
                  size="small"
                  sx={{ 
                    fontSize: '0.7rem',
                    height: '22px',
                    bgcolor: 'primary.50',
                    color: 'primary.700',
                    border: 'none',
                    '& .MuiChip-label': { px: 1 }
                  }}
                />
              )}
              {definitions && definitions.length > 0 && (
                <Chip
                  label={`${definitions.length} Workflow${definitions.length > 1 ? 's' : ''}`}
                  size="small"
                  sx={{ 
                    fontSize: '0.7rem',
                    height: '22px',
                    bgcolor: 'grey.50',
                    color: 'text.secondary',
                    border: 'none',
                    '& .MuiChip-label': { px: 1 }
                  }}
                />
              )}
            </Box>
          </Box>
          
          {/* Description */}
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ 
              mb: 2,
              lineHeight: 1.5,
              fontSize: '0.875rem'
            }}
          >
            {getDescription()}
          </Typography>

          {/* Tags */}
          {getTags().length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {getTags().slice(0, 3).map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag}
                    size="small"
                    variant="outlined"
                    sx={{ 
                      fontSize: '0.7rem',
                      height: '20px',
                      borderColor: 'grey.200',
                      color: 'text.secondary',
                      '&:hover': {
                        borderColor: 'primary.main',
                        color: 'primary.main'
                      }
                    }}
                  />
                ))}
                {getTags().length > 3 && (
                  <Chip
                    label={`+${getTags().length - 3}`}
                    size="small"
                    variant="outlined"
                    sx={{ 
                      fontSize: '0.7rem',
                      height: '20px',
                      borderColor: 'grey.300',
                      color: 'text.secondary'
                    }}
                  />
                )}
              </Box>
            </Box>
          )}

          {/* Footer Info */}
          <Box sx={{ mt: 'auto' }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
              {new Date(agent.createdAt).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
              })}
              {getAuthor() && ` • by ${getAuthor()}`}
            </Typography>
          </Box>
        </CardContent>
        
        {/* Action Buttons */}
        <CardActions sx={{ p: 3, pt: 0, gap: 1 }}>
          <Button
            variant="contained"
            startIcon={isDeploying ? <CircularProgress size={16} /> : <DeployIcon />}
            onClick={handleDeploy}
            disabled={isDeploying}
            sx={{
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: 2,
              py: 1,
              px: 2,
              fontSize: '0.875rem',
              boxShadow: 'none',
              bgcolor: 'primary.main',
              '&:hover': {
                bgcolor: 'primary.dark',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
              },
              '&:disabled': {
                bgcolor: 'grey.200',
                color: 'grey.500'
              }
            }}
          >
            {isDeploying ? 'Deploying...' : 'Deploy'}
          </Button>
          
          <Button
            variant="outlined"
            startIcon={getUrl() ? <LaunchIcon /> : <InfoIcon />}
            onClick={handleViewDetails}
            sx={{
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: 2,
              py: 1,
              px: 2,
              fontSize: '0.875rem',
              borderColor: 'grey.300',
              color: 'text.secondary',
              '&:hover': {
                borderColor: 'primary.main',
                color: 'primary.main',
                bgcolor: 'primary.50'
              }
            }}
          >
            {getUrl() ? 'Visit Site' : 'Details'}
          </Button>
        </CardActions>
      </Box>
    </Card>
    </>
  );
};

export default TemplateCard;
