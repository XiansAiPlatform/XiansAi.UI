import { useState, useEffect } from 'react';
import { keyframes } from '@emotion/react';
import { Box, Table, TableBody, TableContainer, Paper, Typography, ToggleButton, ToggleButtonGroup, TextField, Chip, Stack, IconButton, Menu, MenuItem, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';
import { useDefinitionsApi } from '../../services/definitions-api';
import { useLoading } from '../../contexts/LoadingContext';
import { useNotification } from '../../contexts/NotificationContext';
import DefinitionRow from './DefinitionRow';
import EmptyState from './EmptyState';
import { tableStyles } from './styles';
import { useAuth0 } from '@auth0/auth0-react';
import { formatDistanceToNow } from 'date-fns';
import { ReactComponent as AgentSvgIcon } from '../../theme/agent.svg';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';

const DefinitionList = () => {
  const [definitions, setDefinitions] = useState([]);
  const { user } = useAuth0();
  const [error, setError] = useState(null);
  const [openDefinitionId, setOpenDefinitionId] = useState(null);
  const definitionsApi = useDefinitionsApi();
  const { setLoading } = useLoading();
  const { showSuccess, showError } = useNotification();
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState('all');
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAgentName, setSelectedAgentName] = useState(null);

  const handleToggle = (definitionId) => {
    setOpenDefinitionId(openDefinitionId === definitionId ? null : definitionId);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleTimeFilterChange = (event, newTimeFilter) => {
    if (newTimeFilter !== null) {
      setTimeFilter(newTimeFilter);
    }
  };

  const handleDeleteSuccess = (deletedDefinitionId) => {
    setDefinitions(prevDefinitions => 
      prevDefinitions.filter(def => def.id !== deletedDefinitionId)
    );
  };

  const handleMenuClick = (event, agentName) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
    setSelectedAgentName(agentName);
  };

  const isUserOwnerOfAllWorkflows = (agentName) => {
    const agentDefinitions = definitions.filter(def => def.agent === agentName);
    return agentDefinitions.every(def => {
      if (!user?.sub) return false;
      if (def.permissions?.ownerAccess?.includes(user.sub)) return true;
      return false;
    });
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleDeleteAllClick = () => {
    handleMenuClose();
    setDeleteDialogOpen(true);
  };

  const handleDeleteAllCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedAgentName(null);
  };

  const handleDeleteAllConfirm = async () => {
    if (!selectedAgentName) {
      showError('No agent selected for deletion');
      return;
    }

    setDeleteDialogOpen(false);
    
    try {
      setLoading(true);
      // Get definitions for the selected agent from the original definitions array
      const agentDefinitions = definitions.filter(def => def.agent === selectedAgentName);
      const deletePromises = agentDefinitions.map(def => definitionsApi.deleteDefinition(def.id));
      await Promise.all(deletePromises);
      
      // Update the definitions state by removing all definitions for this agent
      setDefinitions(prevDefinitions => 
        prevDefinitions.filter(def => def.agent !== selectedAgentName)
      );
      
      showSuccess(`Successfully deleted all definitions for ${selectedAgentName}`);
      setSelectedAgentName(null);
    } catch (error) {
      console.error('Failed to delete definitions:', error);
      showError('Failed to delete definitions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredDefinitions = definitions
    .filter(def => {
      const searchLower = searchQuery.toLowerCase();
      const workflowTypeLower = def.workflowType?.toLowerCase() || '';
      const agentNameLower = def.agent?.toLowerCase() || '';
      const descriptionLower = def.description?.toLowerCase() || '';
      const matchesSearch = searchQuery === '' || 
                           workflowTypeLower.includes(searchLower) || 
                           agentNameLower.includes(searchLower) ||
                           descriptionLower.includes(searchLower);
      
      return matchesSearch;
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Group definitions by agent name
  const groupDefinitionsByAgent = (definitions) => {
    const grouped = {};
    const latestFlowByAgent = {};
    
    definitions.forEach(def => {
      const agentName = def.agent || 'Ungrouped';
      if (!grouped[agentName]) {
        grouped[agentName] = [];
        latestFlowByAgent[agentName] = new Date(0);
      }
      grouped[agentName].push(def);
      
      // Track the most recent flow creation/update date for each agent
      const flowDate = new Date(def.createdAt);
      if (flowDate > latestFlowByAgent[agentName]) {
        latestFlowByAgent[agentName] = flowDate;
      }
    });
    
    // Sort agent names by their most recent flow date (descending)
    const sortedAgentNames = Object.keys(grouped).sort((a, b) => {
      // Special case for 'Ungrouped' - always keep at the end
      if (a === 'Ungrouped') return 1;
      if (b === 'Ungrouped') return -1;
      
      // Sort by most recent flow date (newest first)
      return latestFlowByAgent[b] - latestFlowByAgent[a];
    });
    
    return { grouped, sortedAgentNames, latestFlowByAgent };
  };

  const { grouped, sortedAgentNames, latestFlowByAgent } = groupDefinitionsByAgent(filteredDefinitions);

  const formatLastUpdated = (date) => {
    try {
      return `Updated ${formatDistanceToNow(date, { addSuffix: false })} ago`;
    } catch (error) {
      return '';
    }
  };

  const isRecentlyUpdated = (date) => {
    try {
      const now = new Date();
      const lastUpdated = new Date(date);
      const diffInHours = Math.floor((now - lastUpdated) / (1000 * 60 * 60));
      return diffInHours < 24;
    } catch (error) {
      return false;
    }
  };

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

  useEffect(() => {
    const fetchDefinitions = async () => {
      try {
        setLoading(true);
        const data = await definitionsApi.getDefinitions(timeFilter);
        setDefinitions(data);
      } catch (err) {
        setError(err.message);
        console.error('Error loading definitions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDefinitions();
  }, [definitionsApi, setLoading, timeFilter]);

  if (error) {
    return (
      <Box p={2}>
        <Typography color="error">Error loading definitions: {error}</Typography>
      </Box>
    );
  }

  if (!definitions.length) {
    return <EmptyState 
      searchQuery={searchQuery}
      onSearchChange={handleSearchChange}
      timeFilter={timeFilter}
      onTimeFilterChange={handleTimeFilterChange}
    />;
  }

  return (
    <Box sx={tableStyles.container}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4,
        flexDirection: { xs: 'column', md: 'row' },
        gap: { xs: 2, md: 0 }
      }}>
        <Typography 
          variant="h4" 
          component="h1"
          sx={{
            fontWeight: 'var(--font-weight-semibold)',
            letterSpacing: 'var(--letter-spacing-tight)',
            color: 'var(--text-primary)',
          }}
        >
          Agent Definitions
        </Typography>
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          alignItems: 'center',
          flexDirection: { xs: 'column', sm: 'row' },
          width: { xs: '100%', sm: 'auto' }
        }}>
          <TextField
            size="small"
            placeholder="Search by name or agent..."
            value={searchQuery}
            onChange={handleSearchChange}
            sx={{
              width: { xs: '100%', sm: '250px' },
              '& .MuiOutlinedInput-root': {
                borderRadius: 'var(--radius-md)',
              }
            }}
          />
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={2}
            width={{ xs: '100%', sm: 'auto' }}
          >
            <ToggleButtonGroup
              value={timeFilter}
              exclusive
              onChange={handleTimeFilterChange}
              size="small"
              sx={{ 
                width: { xs: '100%', sm: 'auto' },
                '& .MuiToggleButton-root': {
                  borderColor: 'var(--border-light)',
                  color: 'var(--text-secondary)',
                  textTransform: 'none',
                  '&.Mui-selected': {
                    backgroundColor: 'var(--bg-selected)',
                    color: 'var(--text-primary)',
                    fontWeight: 500
                  }
                }
              }}
            >
              <ToggleButton value="7days">Last 7 Days</ToggleButton>
              <ToggleButton value="30days">Last 30 Days</ToggleButton>
              <ToggleButton value="all">All Time</ToggleButton>
            </ToggleButtonGroup>
          </Stack>
        </Box>
      </Box>

      {sortedAgentNames.map((agentName, groupIndex) => (
        <Box 
          key={agentName} 
          sx={{ 
            mb: 4,
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            boxShadow: agentName !== 'Ungrouped' && 'none',
            border: agentName !== 'Ungrouped' ? isRecentlyUpdated(latestFlowByAgent[agentName]) 
              ? '1px solid var(--border-color)'
              : '1px solid var(--border-color)' 
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
                ? isRecentlyUpdated(latestFlowByAgent[agentName])
                  ? 'var(--success-ultralight)'
                  : 'var(--bg-subtle)'
                : 'transparent',
              borderTopLeftRadius: 'var(--radius-lg)',
              borderTopRightRadius: 'var(--radius-lg)',
              mb: 0,
              position: 'relative',
              '&:after': agentName !== 'Ungrouped' ? {
                content: '""',
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '1px',
                backgroundColor: 'var(--border-light)'
              } : {}
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
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  fontSize: '1.1rem',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {agentName !== 'Ungrouped' && (
                  <Box sx={{ 
                    mr: 2, 
                    display: 'flex', 
                    alignItems: 'center',
                    backgroundColor: isRecentlyUpdated(latestFlowByAgent[agentName]) ? 'white' : 'white',
                    borderRadius: '50%',
                    p: '5px',
                    boxShadow: isRecentlyUpdated(latestFlowByAgent[agentName]) 
                      ? '0 0 0 1px var(--success)' 
                      : '0 0 0 1px var(--border-light)',
                    ...(isRecentlyUpdated(latestFlowByAgent[agentName]) && {
                      animation: `${pulse} 2s infinite`,
                    })
                  }}>
                    <AgentSvgIcon style={{ 
                      width: '32px', 
                      height: '32px', 
                      opacity: isRecentlyUpdated(latestFlowByAgent[agentName]) ? 1 : 0.85 
                    }} />
                  </Box>
                )}
                {agentName}
              </Typography>
              
              <Chip 
                label={`${grouped[agentName].length} flow${grouped[agentName].length !== 1 ? 's' : ''}`}
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
              
              {agentName !== 'Ungrouped' && isRecentlyUpdated(latestFlowByAgent[agentName]) && (
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
                  {formatLastUpdated(latestFlowByAgent[agentName])}
                </Typography>
                <IconButton
                  size="small"
                  onClick={(e) => handleMenuClick(e, agentName)}
                  sx={{ ml: 1 }}
                >
                  <MoreVertIcon />
                </IconButton>
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
                {grouped[agentName].map((definition, index) => (
                  <DefinitionRow 
                    key={definition.id} 
                    definition={definition}
                    isOpen={openDefinitionId === definition.id}
                    previousRowOpen={index > 0 && openDefinitionId === grouped[agentName][index - 1].id}
                    onToggle={handleToggle}
                    onDeleteSuccess={handleDeleteSuccess}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      ))}

      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()}
      >
        <MenuItem 
          onClick={handleDeleteAllClick}
          disabled={!isUserOwnerOfAllWorkflows(selectedAgentName)}
          sx={{
            opacity: isUserOwnerOfAllWorkflows(selectedAgentName) ? 1 : 0.5,
            '&.Mui-disabled': {
              color: 'text.disabled',
            }
          }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete All
          {!isUserOwnerOfAllWorkflows(selectedAgentName) && (
            <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary', fontSize: '0.7rem' }}>
              (Not owner of all workflows)
            </Typography>
          )}
        </MenuItem>
      </Menu>

      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteAllCancel}
        onClick={(e) => e.stopPropagation()}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Delete All Definitions?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete all definitions for "{selectedAgentName}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ padding: '16px 24px' }}>
          <Button onClick={handleDeleteAllCancel}>Cancel</Button>
          <Button onClick={handleDeleteAllConfirm} variant="contained" color="error" autoFocus>
            Delete All
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DefinitionList;