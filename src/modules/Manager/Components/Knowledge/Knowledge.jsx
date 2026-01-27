import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography,
  Fab,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormControlLabel,
  Switch,
  Alert,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { useSlider } from '../../contexts/SliderContext';
import { useLoading } from '../../contexts/LoadingContext';
import { useTenant } from '../../contexts/TenantContext';
import KnowledgeEditor from './KnowledgeEditor';
import KnowledgeGroupItem from './KnowledgeGroupItem';
import { useKnowledgeApi } from '../../services/knowledge-api';
import { useAgentsApi } from '../../services/agents-api';
import { useNotification } from '../../contexts/NotificationContext';
import { handleApiError } from '../../utils/errorHandler';
import PageLayout from '../Common/PageLayout';
import PageFilters from '../Common/PageFilters';
import EmptyState from '../Common/EmptyState';

const Knowledge = () => {
  const [knowledgeGroups, setKnowledgeGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { openSlider, closeSlider } = useSlider();
  const { setLoading } = useLoading();
  const { isSysAdmin } = useTenant();
  const knowledgeApi = useKnowledgeApi();
  const agentsApi = useAgentsApi();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('');
  const { showError, showSuccess, showDetailedError } = useNotification();
  const [agents, setAgents] = useState([]);
  const [isLoadingAgents, setIsLoadingAgents] = useState(false);
  const [showTemplateAgents, setShowTemplateAgents] = useState(false);

  // Filter knowledge groups based on search query
  const filteredKnowledgeGroups = knowledgeGroups.filter(group => 
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Fetch agents on mount and when scope changes
  useEffect(() => {
    const fetchAgents = async () => {
      setIsLoadingAgents(true);
      try {
        const scope = showTemplateAgents ? 'System' : 'Tenant';
        const response = await agentsApi.getAllAgents(scope);
        // Handle case where API client redirects on 403 and returns undefined
        if (response !== undefined) {
          setAgents(response.data || response || []);
        }
      } catch (error) {
        console.error('Failed to fetch agents:', error);
        await handleApiError(error, 'Failed to load agents', showDetailedError);
      } finally {
        setIsLoadingAgents(false);
      }
    };

    fetchAgents();
  }, [agentsApi, showDetailedError, showTemplateAgents]);

  // Fetch knowledge when agent is selected
  useEffect(() => {
    const fetchKnowledge = async () => {
      if (!selectedAgent) {
        setKnowledgeGroups([]);
        return;
      }

      setIsLoading(true);
      setLoading(true);
      try {
        const scope = showTemplateAgents ? 'System' : 'Tenant';
        const data = await knowledgeApi.getLatestKnowledge(scope, selectedAgent);
        // Handle case where API client redirects on 403 and returns undefined
        if (data !== undefined && data.groups) {
          setKnowledgeGroups(data.groups);
        } else {
          setKnowledgeGroups([]);
        }
      } catch (error) {
        console.error('Failed to fetch knowledge:', error);
        await handleApiError(error, 'Failed to fetch knowledge items', showDetailedError);
        setKnowledgeGroups([]);
      } finally {
        setIsLoading(false);
        setLoading(false);
      }
    };

    fetchKnowledge();
  }, [knowledgeApi, showDetailedError, setLoading, selectedAgent, showTemplateAgents]);

  const refreshKnowledge = async () => {
    if (!selectedAgent) return;
    
    setLoading(true);
    try {
      const scope = showTemplateAgents ? 'System' : 'Tenant';
      const data = await knowledgeApi.getLatestKnowledge(scope, selectedAgent);
      if (data !== undefined && data.groups) {
        setKnowledgeGroups(data.groups);
      }
    } catch (error) {
      console.error('Failed to refresh knowledge:', error);
      await handleApiError(error, 'Failed to refresh knowledge', showError);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    if (!selectedAgent) {
      showError('Please select an agent first');
      return;
    }

    openSlider(
      <KnowledgeEditor 
        mode="add"
        selectedAgent={selectedAgent}
        isSystemScoped={showTemplateAgents}
        onSave={async (newKnowledge) => {
          setLoading(true);
          try {
            await knowledgeApi.createKnowledge(newKnowledge);
            await refreshKnowledge();
            closeSlider();
            showSuccess('Knowledge created successfully');
          } catch (error) {
            console.error('Failed to create knowledge:', error);
            await handleApiError(error, 'Failed to create knowledge item', showError);
          } finally {
            setLoading(false);
          }
        }}
        onClose={closeSlider}
      />,
      "Add Knowledge"
    );
  };

  const handleUpdateKnowledge = async (updatedKnowledge) => {
    setLoading(true);
    try {
      await knowledgeApi.createKnowledge(updatedKnowledge);
      await refreshKnowledge();
      closeSlider();
      showSuccess('Knowledge updated successfully');
    } catch (error) {
      console.error('Failed to update knowledge:', error);
      await handleApiError(error, 'Failed to update knowledge item', showError);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteKnowledge = async (knowledge) => {
    setLoading(true);
    try {
      const success = await knowledgeApi.deleteKnowledge(knowledge.id);
      if (success) {
        await refreshKnowledge();
        showSuccess('Knowledge deleted successfully');
      }
    } catch (error) {
      console.error('Failed to delete knowledge:', error);
      let errorMessage = 'Failed to delete knowledge';
      if (error.response && error.response.status === 404) {
        errorMessage = 'Knowledge not found or already deleted';
      }
      await handleApiError(error, errorMessage, showError);
    } finally {
      setLoading(false);
    }
  };

  const headerActions = (
    <PageFilters
      searchValue={searchQuery}
      onSearchChange={(e) => setSearchQuery(e.target.value)}
      searchPlaceholder="Search knowledge..."
      additionalFilters={
        <>
          {isSysAdmin && (
            <FormControlLabel
              control={
                <Switch
                  checked={showTemplateAgents}
                  onChange={(e) => {
                    setShowTemplateAgents(e.target.checked);
                    setSelectedAgent(''); // Clear selected agent when switching scope
                  }}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: 'var(--primary)',
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: 'var(--primary)',
                    },
                  }}
                />
              }
              label={
                <Typography sx={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                  {showTemplateAgents ? 'Templates' : 'Deployed'}
                </Typography>
              }
              sx={{ 
                mr: 1,
                '& .MuiFormControlLabel-label': {
                  fontFamily: 'var(--font-family)',
                }
              }}
            />
          )}
          <FormControl size="small" sx={{ minWidth: 200 }} required>
            <InputLabel id="agent-select-label">Select Agent *</InputLabel>
            <Select
              labelId="agent-select-label"
              value={selectedAgent}
              label="Select Agent *"
              onChange={(e) => setSelectedAgent(e.target.value)}
              disabled={isLoadingAgents}
              sx={{
                bgcolor: 'var(--bg-main)',
                borderRadius: 'var(--radius-md)',
                '& .MuiSelect-select': {
                  fontFamily: 'var(--font-family)',
                  fontSize: '0.875rem',
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: selectedAgent ? 'var(--border-color)' : 'var(--warning)'
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'var(--border-color-hover)'
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'var(--primary)',
                  borderWidth: '2px'
                }
              }}
            >
              <MenuItem value="">
                <em>Select an agent...</em>
              </MenuItem>
              {isLoadingAgents ? (
                <MenuItem disabled><em>Loading...</em></MenuItem>
              ) : agents.length === 0 ? (
                <MenuItem disabled><em>No agents available</em></MenuItem>
              ) : (
                agents.map(agent => (
                  <MenuItem key={agent} value={agent}>
                    {agent}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
          <Fab 
              color="primary" 
              size="medium" 
              onClick={handleAdd}
              disabled={!selectedAgent}
              sx={{ 
                zIndex: 1,
                bgcolor: 'var(--primary)',
                boxShadow: '0 2px 8px rgba(var(--primary-rgb), 0.3)',
                '&:hover': {
                  bgcolor: 'var(--primary-dark)',
                  transform: 'scale(1.05)',
                  boxShadow: '0 4px 16px rgba(var(--primary-rgb), 0.4)'
                },
                '&:active': {
                  transform: 'scale(0.98)',
                },
                '&.Mui-disabled': {
                  bgcolor: 'var(--bg-disabled)',
                  color: 'var(--text-disabled)',
                  boxShadow: 'none'
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              <Add />
            </Fab>
        </>
      }
    />
  );

  const totalKnowledgeCount = filteredKnowledgeGroups.reduce((acc, group) => {
    let count = 0;
    if (group.system_scoped) count++;
    if (group.tenant_default) count++;
    count += group.activations?.length || 0;
    return acc + count;
  }, 0);

  return (
    <PageLayout
      title="Knowledge Base"
      subtitle={selectedAgent 
        ? `${filteredKnowledgeGroups.length} knowledge group${filteredKnowledgeGroups.length !== 1 ? 's' : ''} (${totalKnowledgeCount} total items) for ${selectedAgent}`
        : 'Select an agent to view knowledge'}
      headerActions={headerActions}
    >
      {!selectedAgent ? (
        <Box sx={{ mt: 4 }}>
          <Alert severity="info" sx={{ maxWidth: 600, mx: 'auto' }}>
            <Typography variant="body1" sx={{ fontWeight: 500, mb: 1 }}>
              Select an Agent to Get Started
            </Typography>
            <Typography variant="body2">
              Please select an agent from the dropdown above to view and manage knowledge items for that agent.
              Knowledge items are organized into three categories: System Templates, Tenant Defaults, and Activations.
            </Typography>
          </Alert>
        </Box>
      ) : isLoading ? (
        <Box sx={{ p: 6, textAlign: 'center' }}>
          <CircularProgress />
          <Typography sx={{ mt: 2, color: 'var(--text-secondary)' }}>
            Loading knowledge for {selectedAgent}...
          </Typography>
        </Box>
      ) : filteredKnowledgeGroups.length > 0 ? (
        <Box sx={{ mt: 2 }}>
          {filteredKnowledgeGroups.map((group) => (
            <KnowledgeGroupItem
              key={group.name}
              group={group}
              onUpdateKnowledge={handleUpdateKnowledge}
              onDeleteKnowledge={handleDeleteKnowledge}
              isSystemScoped={showTemplateAgents}
              selectedAgent={selectedAgent}
            />
          ))}
        </Box>
      ) : (
        <EmptyState
          title={searchQuery ? 'No Matching Knowledge Found' : 'No Knowledge Yet'}
          description={searchQuery 
            ? 'Try adjusting your search terms or clear the search to see all knowledge.'
            : `No knowledge items found for ${selectedAgent}. Create your first knowledge item by clicking the + button above.`}
          context={searchQuery ? 'search' : 'knowledge'}
        />
      )}
    </PageLayout>
  );
};

export default Knowledge; 
