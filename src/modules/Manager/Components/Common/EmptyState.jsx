import React from 'react';
import { Box, Typography, Paper, Button, Stack } from '@mui/material';
import { 
  LibraryBooks as TemplatesIcon,
  ForumOutlined as ConversationsIcon,
  TextSnippet as KnowledgeIcon,
  Air as RunsIcon,
  CodeOutlined as AgentsIcon,
  ChecklistOutlined as AuditsIcon,
  Search as SearchIcon,
  SettingsOutlined as SettingsIcon,
  Tune as TuneIcon
} from '@mui/icons-material';

/**
 * Reusable EmptyState component for consistent empty state messaging across the application
 * Uses the same icons as the left navigation menu for consistency
 * 
 * @param {Object} props
 * @param {string} props.title - Main title text
 * @param {string} props.description - Description text
 * @param {string} props.context - Context/location for appropriate icon: 'templates', 'conversations', 'knowledge', 'runs', 'agents', 'audits', 'search', 'settings', 'admin' (optional)
 * @param {React.ReactNode|React.ComponentType} props.icon - Custom icon component or JSX element (overrides context icon)
 * @param {Array} props.actions - Array of action objects with { label, onClick, variant, startIcon } (optional)
 * @param {Object} props.sx - Additional styling (optional)
 * 
 * @example
 * // Using context-based icon (recommended)
 * <EmptyState title="No Data" description="..." context="knowledge" />
 * 
 * // Using custom JSX icon
 * <EmptyState title="No Data" description="..." icon={<CustomIcon />} />
 * 
 * // Using custom component icon
 * <EmptyState title="No Data" description="..." icon={CustomIcon} />
 * 
 * // With actions
 * <EmptyState 
 *   title="No Data" 
 *   description="..." 
 *   context="runs"
 *   actions={[
 *     { label: 'Refresh', onClick: handleRefresh, variant: 'contained' },
 *     { label: 'Create New', onClick: handleCreate, variant: 'outlined' }
 *   ]}
 * />
 */
const EmptyState = ({
  title,
  description,
  context,
  icon,
  actions = [],
  sx = {}
}) => {
  // Context-based icon mapping - matches left navigation menu icons exactly
  const contextIconMap = {
    templates: TemplatesIcon,        // LibraryBooks - custom for templates (not in nav)
    conversations: ConversationsIcon, // ForumOutlined - matches "Conversations" in nav (/manager/messaging)
    knowledge: KnowledgeIcon,        // MenuBookOutlined - matches "Knowledge" in nav (/manager/knowledge)
    runs: RunsIcon,                  // Air - matches "Runs" in nav (/manager/runs)
    agents: AgentsIcon,              // CodeOutlined - matches "Agents" in nav (/manager/definitions)
    audits: AuditsIcon,              // ChecklistOutlined - matches "Audits" in nav (/manager/auditing)
    search: SearchIcon,              // Search - for search/filter states
    settings: SettingsIcon,          // SettingsOutlined - matches "Tenant Settings" in nav (/manager/settings)
    admin: TuneIcon,                // AdminPanelSettings - matches "System Settings" in nav (/manager/admin)
    // Aliases for common usage
    messages: ConversationsIcon,     // Alias for conversations
    definitions: AgentsIcon          // Alias for agents
  };

  // Get the appropriate icon
  const getIconElement = () => {
    if (icon) {
      // If icon is already a JSX element, return it directly
      if (React.isValidElement(icon)) {
        return React.cloneElement(icon, {
          sx: { 
            fontSize: { xs: 48, sm: 56, md: 64 }, 
            color: 'primary.main',
            ...icon.props.sx
          }
        });
      }
      // If icon is a component, render it
      const IconComponent = icon;
      return (
        <IconComponent 
          sx={{ 
            fontSize: { xs: 48, sm: 56, md: 64 }, 
            color: 'primary.main'
          }} 
        />
      );
    }
    
    // Use context-based icon mapping with fallback
    const IconComponent = contextIconMap[context] || AgentsIcon; // Default to CodeOutlined (Agents icon)
    return (
      <IconComponent 
        sx={{ 
          fontSize: { xs: 48, sm: 56, md: 64 }, 
          color: 'primary.main'
        }} 
      />
    );
  };

  // Single consistent style - always use paper variant with gradient accent
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      py: 3,
      px: 2,
      ...sx
    }}>
      <Paper 
        elevation={0}
        sx={{ 
          p: { xs: 3, sm: 4, md: 5 }, 
          borderRadius: 3,
          width: '100%',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          gap: 2,
          textAlign: 'center'
        }}>
          {/* Icon */}
          <Box sx={{
            p: 2,
            borderRadius: '50%',
            backgroundColor: 'primary.50',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {getIconElement()}
          </Box>
          
          {/* Text Content */}
          <Box sx={{ maxWidth: 600 }}>
            <Typography 
              variant="h4"
              gutterBottom 
              sx={{ 
                color: 'text.primary',
                fontWeight: 300,
                fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' },
                mb: 2
              }}
            >
              {title}
            </Typography>
            
            {description && (
              <Typography 
                variant="body1"
                sx={{ 
                  color: 'text.secondary',
                  lineHeight: 1.6,
                  fontSize: { xs: '0.95rem', sm: '1rem' },
                  opacity: 0.9
                }}
              >
                {description}
              </Typography>
            )}
          </Box>

          {/* Actions */}
          {actions.length > 0 && (
            <Stack 
              spacing={2} 
              direction={{ xs: 'column', sm: 'row' }} 
              sx={{ mt: 2, width: '100%' }}
              justifyContent="center"
            >
              {actions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant || 'contained'}
                  color={action.color || 'primary'}
                  size={action.size || 'medium'}
                  startIcon={action.startIcon}
                  onClick={action.onClick}
                  disabled={action.disabled}
                  sx={{
                    textTransform: 'none',
                    borderRadius: 2,
                    px: 3,
                    py: 1,
                    ...action.sx
                  }}
                >
                  {action.label}
                </Button>
              ))}
            </Stack>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default EmptyState;
