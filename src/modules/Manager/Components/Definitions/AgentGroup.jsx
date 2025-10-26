import { keyframes } from '@emotion/react';
import { Box, Table, TableBody, TableContainer, Paper, Typography, Chip, Stack, Button, Menu, MenuItem, IconButton } from '@mui/material';
import { ReactComponent as AgentSvgIcon } from '../../theme/agent.svg';
import DeleteIcon from '@mui/icons-material/Delete';
import ShareIcon from '@mui/icons-material/Share';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import DefinitionRow from './DefinitionRow';
import { formatAgentName, formatLastUpdated, isRecentlyUpdated } from './definitionUtils';
import { tableStyles } from './styles';
import { useAuth } from '../../auth/AuthContext';
import { useWorkflowApi } from '../../services/workflow-api';
import { useLoading } from '../../contexts/LoadingContext';
import { useSelectedOrg } from '../../contexts/OrganizationContext';
import { useNotification } from '../../contexts/NotificationContext';
import { useTenant } from '../../contexts/TenantContext';
import { useState } from 'react';

// Define a keyframe animation for the pulsing effect
const pulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(var(--success-rgb), 0.4);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(var(--success-rgb), 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(var(--success-rgb), 0);
  }
`;

const AgentGroup = ({ 
  agentName,
  agent,
  definitions, 
  latestUpdateDate, 
  openDefinitionId, 
  onToggle, 
  isOwnerOfAllWorkflows,
  onDeleteAllClick,
  onShareClick
}) => {
  const { user } = useAuth();
  const api = useWorkflowApi();
  const { setLoading } = useLoading();
  const { selectedOrg } = useSelectedOrg();
  const { showSuccess, showError } = useNotification();
  const { isSysAdmin, isTenantAdmin } = useTenant();
  const [anchorEl, setAnchorEl] = useState(null);
  
  const handleMenuClick = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleActivateAll = async () => {
    handleMenuClose();
    setLoading(true);
    
    try {
      const promises = definitions.map(async (definition) => {
        // Generate unique flow IDs for each workflow
        const flowId = `${selectedOrg}:${definition.workflowType.trim()}`;
        
        return api.startNewWorkflow(
          definition.workflowType.trim(),
          definition.agent.trim(),
          [],
          flowId,
          null
        );
      });
      
      await Promise.all(promises);
      
      // Show success notification
      showSuccess(`Successfully activated ${definitions.length} workflow${definitions.length !== 1 ? 's' : ''}`);
    } catch (error) {
      console.error('Failed to activate all workflows:', error);
      showError(`Failed to activate workflows: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Function to determine current user's permission level
  const getUserPermissionLevel = () => {
    if (!user?.id || !agent || agentName === 'Ungrouped') {
      return null;
    }

    if (isSysAdmin || isTenantAdmin) {
      return { level: 'Owner (Admin)', color: 'primary' };
    }

    // Support both new structure (agent.ownerAccess) and legacy structure (agent.permissions.ownerAccess)
    const ownerAccess = agent.ownerAccess || agent.permissions?.ownerAccess;
    const writeAccess = agent.writeAccess || agent.permissions?.writeAccess;
    const readAccess = agent.readAccess || agent.permissions?.readAccess;

    if (ownerAccess?.includes(user.id)) {
      return { level: 'Owner', color: 'primary' };
    }
    if (writeAccess?.includes(user.id)) {
      return { level: 'Can Write', color: 'secondary' };
    }
    if (readAccess?.includes(user.id)) {
      return { level: 'Can Read', color: 'default' };
    }
    
    return null;
  };

  const permissionInfo = getUserPermissionLevel();

  return (
    <Box 
      sx={{ 
        mb: 4,
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        boxShadow: agentName !== 'Ungrouped' 
          ? '0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.08)'
          : 'none',
        border: agentName !== 'Ungrouped' ? isRecentlyUpdated(latestUpdateDate) 
          ? '1px solid rgba(34, 197, 94, 0.3)'
          : '1px solid rgba(226, 232, 240, 0.8)' 
          : 'none',
        transition: 'var(--transition-fast)',
        ...(agentName !== 'Ungrouped' && {
          '&:hover': {
            boxShadow: 'var(--shadow-sm)',
            borderColor: 'var(--border-color-hover)'
          }
        })
      }}
    >
      <Box 
        sx={{ 
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          p: 2,
          gap: 2,
          backgroundColor: agentName !== 'Ungrouped' 
            ? isRecentlyUpdated(latestUpdateDate)
              ? 'var(--success-ultralight)'
              : 'rgba(248, 250, 252, 0.8)'
            : 'transparent',
          backdropFilter: agentName !== 'Ungrouped' ? 'blur(8px)' : 'none',
          borderBottom: agentName !== 'Ungrouped' ? '1px solid rgba(226, 232, 240, 0.8)' : 'none',
          borderTopLeftRadius: 'var(--radius-lg)',
          borderTopRightRadius: 'var(--radius-lg)',
          mb: 0,
          position: 'relative'
        }}
      >
        <Stack 
          direction="row" 
          spacing={1.5} 
          alignItems="center"
          sx={{ flex: 1 }}
        >
          <Typography 
            variant="h6" 
            component="h2"
            sx={{ 
              fontWeight: 500,
              color: '#1a252f',
              fontSize: '1.05rem',
              display: 'flex',
              alignItems: 'center',
              letterSpacing: '-0.005em',
              lineHeight: 1.4
            }}
          >
            {agentName !== 'Ungrouped' && (
              <Box sx={{ 
                mr: 2, 
                display: 'flex', 
                alignItems: 'center',
                backgroundColor: isRecentlyUpdated(latestUpdateDate) ? 'white' : 'white',
                borderRadius: '50%',
                p: '5px',
                boxShadow: isRecentlyUpdated(latestUpdateDate) 
                  ? '0 0 0 1px var(--success)' 
                  : '0 0 0 1px var(--border-light)',
                ...(isRecentlyUpdated(latestUpdateDate) && {
                  animation: `${pulse} 2s infinite`,
                })
              }}>
                <AgentSvgIcon style={{ 
                  width: '32px', 
                  height: '32px', 
                  opacity: isRecentlyUpdated(latestUpdateDate) ? 1 : 0.85 
                }} />
              </Box>
            )}
            {formatAgentName(agentName)}
          </Typography>
          
          <Chip 
            label={`${definitions.length} flow${definitions.length !== 1 ? 's' : ''}`}
            size="small"
            sx={{ 
              fontWeight: 500,
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--border-light)',
              height: '22px',
              fontSize: '0.75rem',
              borderRadius: '10px',
              '& .MuiChip-label': {
                px: 1
              }
            }}
          />
          
          {agentName !== 'Ungrouped' && isRecentlyUpdated(latestUpdateDate) && (
            <Chip
              label="New"
              size="small"
              color="success"
              sx={{ 
                height: '22px',
                fontSize: '0.7rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                borderRadius: '10px',
                background: 'linear-gradient(45deg, var(--success) 0%, var(--success-light) 100%)',
                color: 'white',
                '& .MuiChip-label': {
                  px: 1
                },
                animation: `${pulse} 2s infinite`
              }}
            />
          )}
          
          {permissionInfo && (
            <Chip
              label={permissionInfo.level}
              size="small"
              color={permissionInfo.color}
              sx={{ 
                height: '22px',
                fontSize: '0.7rem',
                fontWeight: 500,
                borderRadius: '10px',
                '& .MuiChip-label': {
                  px: 1
                }
              }}
            />
          )}
        </Stack>
        
        {agentName !== 'Ungrouped' && (
          <>
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'var(--text-secondary)',
                fontSize: '0.75rem'
              }}
            >
              {formatLastUpdated(latestUpdateDate)}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ ml: 1 }}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<ShareIcon />}
                onClick={(e) => {
                  e.stopPropagation();
                  onShareClick();
                }}
                disabled={!isOwnerOfAllWorkflows}
                sx={{
                  textTransform: 'none',
                  fontSize: '0.75rem',
                  height: '28px',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-secondary)',
                  '&:hover': {
                    borderColor: 'var(--border-color-hover)',
                    backgroundColor: 'var(--bg-hover)'
                  },
                  '&.Mui-disabled': {
                    opacity: 0.5,
                    color: 'text.disabled',
                    borderColor: 'var(--border-color)'
                  }
                }}
              >
                Share
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<DeleteIcon />}
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteAllClick();
                }}
                disabled={!isOwnerOfAllWorkflows}
                sx={{
                  textTransform: 'none',
                  fontSize: '0.75rem',
                  height: '28px',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-secondary)',
                  '&:hover': {
                    borderColor: 'var(--border-color-hover)',
                    backgroundColor: 'var(--bg-hover)'
                  },
                  '&.Mui-disabled': {
                    opacity: 0.5,
                    color: 'text.disabled',
                    borderColor: 'var(--border-color)'
                  }
                }}
              >
                Delete Agent
              </Button>
              <IconButton
                size="small"
                onClick={handleMenuClick}
                sx={{
                  borderRadius: '4px',
                  border: '1px solid var(--border-color)',
                  padding: '3px',
                  color: 'var(--text-secondary)',
                  '&:hover': {
                    borderColor: 'var(--border-color-hover)',
                    backgroundColor: 'var(--bg-hover)'
                  }
                }}
              >
                <MoreVertIcon fontSize="small" />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              >
                <MenuItem onClick={handleActivateAll}>
                  <PlayArrowIcon fontSize="small" sx={{ mr: 1 }} />
                  Activate All as Singletons
                </MenuItem>
              </Menu>
            </Stack>
          </>
        )}
      </Box>
      
      <TableContainer 
        component={Paper} 
        elevation={0}
        sx={{
          ...tableStyles.tableContainer,
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          borderTop: 'none',
          backgroundColor: 'white',
          overflowX: 'auto'
        }}
      >
        <Table sx={{ minWidth: 650 }}>
          <TableBody>
            {definitions.map((definition, index) => (
              <DefinitionRow 
                key={definition.id} 
                definition={definition}
                isOpen={openDefinitionId === definition.id}
                previousRowOpen={index > 0 && openDefinitionId === definitions[index - 1].id}
                onToggle={onToggle}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AgentGroup; 