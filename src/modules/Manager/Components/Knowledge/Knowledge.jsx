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
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { useSlider } from '../../contexts/SliderContext';
import { useLoading } from '../../contexts/LoadingContext';
import KnowledgeEditor from './KnowledgeEditor';
import KnowledgeItem from './KnowledgeItem';
import { useKnowledgeApi } from '../../services/knowledge-api';
import { useAgentsApi } from '../../services/agents-api';
import { useNotification } from '../../contexts/NotificationContext';
import { handleApiError } from '../../utils/errorHandler';
import PageLayout from '../Common/PageLayout';
import PageFilters from '../Common/PageFilters';
import EmptyState from '../Common/EmptyState';

const Knowledge = () => {
  const [knowledgeItems, setKnowledgeItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingItem, setIsLoadingItem] = useState(false);
  const { openSlider, closeSlider } = useSlider();
  const { setLoading } = useLoading();
  const knowledgeApi = useKnowledgeApi();
  const agentsApi = useAgentsApi();
  const [expandedId, setExpandedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('');
  const { showError, showSuccess, showDetailedError } = useNotification();
  const [agents, setAgents] = useState([]);
  const [isLoadingAgents, setIsLoadingAgents] = useState(false);
  const [activeKnowledge, setActiveKnowledge] = useState(null);
  const [contentSearchTimeout, setContentSearchTimeout] = useState(null);
  const [isSearchingContent, setIsSearchingContent] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  const filteredKnowledgeItems = searchQuery && searchResults.length > 0 && isSearchingContent
    ? searchResults
    : knowledgeItems.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.content && item.content.toLowerCase().includes(searchQuery.toLowerCase()))
      ).filter(item => !selectedAgent || item.agent === selectedAgent);

  // Effect for content search with debounce
  useEffect(() => {
    if (searchQuery.length > 2) {
      if (contentSearchTimeout) {
        clearTimeout(contentSearchTimeout);
      }
      
      setContentSearchTimeout(setTimeout(async () => {
        setIsSearchingContent(true);
        try {
          // Get all knowledge items with full content if search query is substantial
          const fullKnowledgeItems = await knowledgeApi.getLatestKnowledge();
          // Handle case where API client redirects on 403 and returns undefined
          if (fullKnowledgeItems !== undefined) {
            const results = fullKnowledgeItems.filter(item => 
              item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              (item.content && item.content.toLowerCase().includes(searchQuery.toLowerCase()))
            ).filter(item => !selectedAgent || item.agent === selectedAgent);
            
            setSearchResults(results);
          }
        } catch (error) {
          console.error('Error searching knowledge content:', error);
        } finally {
          setIsSearchingContent(false);
        }
      }, 500));
    } else {
      setSearchResults([]);
      setIsSearchingContent(false);
      if (contentSearchTimeout) {
        clearTimeout(contentSearchTimeout);
      }
    }

    return () => {
      if (contentSearchTimeout) {
        clearTimeout(contentSearchTimeout);
      }
    };
  }, [searchQuery, selectedAgent, knowledgeApi, contentSearchTimeout]);

  useEffect(() => {
    const fetchAgents = async () => {
      setIsLoadingAgents(true);
      try {
        const response = await agentsApi.getAllAgents();
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
  }, [agentsApi, showDetailedError]);

  useEffect(() => {
    const fetchKnowledge = async () => {
      setLoading(true);
      try {
        const data = await knowledgeApi.getLatestKnowledge();
        // Handle case where API client redirects on 403 and returns undefined
        if (data !== undefined) {
          // Sort knowledge by createdAt in descending order
          const sortedData = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setKnowledgeItems(sortedData);
        }
      } catch (error) {
        console.error('Failed to fetch knowledge:', error);
        await handleApiError(error, 'Failed to fetch knowledge items', showDetailedError);
      } finally {
        setIsLoading(false);
        setLoading(false);
      }
    };

    fetchKnowledge();
  }, [knowledgeApi, showDetailedError, setLoading]);

  const fetchKnowledgeById = async (id) => {
    setIsLoadingItem(true);
    try {
      const data = await knowledgeApi.getKnowledge(id);
      // Handle case where API client redirects on 403 and returns undefined
      if (data !== undefined) {
        setActiveKnowledge(data);
        return data;
      }
      return null;
    } catch (error) {
      console.error('Failed to fetch knowledge by ID:', error);
      await handleApiError(error, 'Failed to load knowledge details', showDetailedError);
      return null;
    } finally {
      setIsLoadingItem(false);
    }
  };

  const handleAdd = () => {
    openSlider(
      <KnowledgeEditor 
        mode="add"
        selectedAgent={selectedAgent}
        onSave={async (newKnowledge) => {
          setLoading(true);
          try {
            await knowledgeApi.createKnowledge(newKnowledge);
            // Fetch fresh data after creating
            const updatedKnowledge = await knowledgeApi.getLatestKnowledge();
            // Handle case where API client redirects on 403 and returns undefined
            if (updatedKnowledge !== undefined) {
              const sortedKnowledge = updatedKnowledge.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
              setKnowledgeItems(sortedKnowledge);
            }
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
      // Fetch fresh data after updating
      const updatedKnowledgeItems = await knowledgeApi.getLatestKnowledge();
      // Handle case where API client redirects on 403 and returns undefined
      if (updatedKnowledgeItems !== undefined) {
        const sortedKnowledgeItems = updatedKnowledgeItems.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setKnowledgeItems(sortedKnowledgeItems);
      }
      closeSlider();
      showSuccess('Knowledge updated successfully');
    } catch (error) {
      console.error('Failed to update knowledge:', error);
      await handleApiError(error, 'Failed to update knowledge item', showError);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAllKnowledge = async (knowledge) => {
    setLoading(true);
    try {
      const success = await knowledgeApi.deleteAllVersions(knowledge.name, knowledge.agent);
      if (success) {
        // Fetch fresh data after deletion
        const updatedKnowledgeItems = await knowledgeApi.getLatestKnowledge();
        // Handle case where API client redirects on 403 and returns undefined
        if (updatedKnowledgeItems !== undefined) {
          const sortedKnowledgeItems = updatedKnowledgeItems.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setKnowledgeItems(sortedKnowledgeItems);
        }
        closeSlider();
        showSuccess('All versions deleted successfully');
      }
    } catch (error) {
      console.error('Failed to delete knowledge versions:', error);
      let errorMessage = 'Failed to delete knowledge versions';
      if (error.response && error.response.status === 404) {
        errorMessage = 'Knowledge not found or already deleted';
      }
      await handleApiError(error, errorMessage, showError);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOneKnowledge = async (knowledge) => {
    setLoading(true);
    try {
      const success = await knowledgeApi.deleteKnowledge(knowledge.id);
      if (success) {
        // Fetch fresh data after creating
        const updatedKnowledgeItems = await knowledgeApi.getLatestKnowledge();
        // Handle case where API client redirects on 403 and returns undefined
        if (updatedKnowledgeItems !== undefined) {
          const sortedKnowledgeItems = updatedKnowledgeItems.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setKnowledgeItems(sortedKnowledgeItems);
        }
        closeSlider();
        showSuccess('Version deleted successfully');
      }
    } catch (error) {
      console.error('Failed to delete knowledge version:', error);
      let errorMessage = 'Failed to delete version';
      if (error.response && error.response.status === 404) {
        errorMessage = 'Version not found or already deleted';
      }
      await handleApiError(error, errorMessage, showError);
    } finally {
      setLoading(false);
    }
  };

  const handleVersionToggle = async (knowledgeId) => {
    if (expandedId === knowledgeId) {
      // Collapse if already expanded
      setExpandedId(null);
      setActiveKnowledge(null);
    } else {
      // Expand and fetch fresh data
      setExpandedId(knowledgeId);
      await fetchKnowledgeById(knowledgeId);
    }
  };

  const headerActions = (
    <PageFilters
      searchValue={searchQuery}
      onSearchChange={(e) => setSearchQuery(e.target.value)}
      searchPlaceholder="Search knowledge..."
      additionalFilters={
        <>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="agent-select-label">Agent</InputLabel>
            <Select
              labelId="agent-select-label"
              value={selectedAgent}
              label="Agent"
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
                  borderColor: 'var(--border-color)'
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
                <em>All Agents</em>
              </MenuItem>
              {isLoadingAgents ? (
                <MenuItem disabled><em>Loading...</em></MenuItem>
              ) : agents.length === 0 ? (
                <MenuItem disabled><em>No agents</em></MenuItem>
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
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              <Add />
            </Fab>
        </>
      }
    />
  );

  return (
    <PageLayout
      title="Knowledge Base"
      subtitle={`${filteredKnowledgeItems.length} knowledge item${filteredKnowledgeItems.length !== 1 ? 's' : ''}`}
      headerActions={headerActions}
    >
        
        {isLoading ? (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <CircularProgress />
          </Box>
        ) : filteredKnowledgeItems.length > 0 ? (
          <div className={`knowledge-grid ${expandedId ? 'has-expanded' : ''}`}>
            {filteredKnowledgeItems
              .map((knowledge) => (
                <div 
                  key={`knowledge-item-${knowledge.id}`}
                  className={knowledge.id === expandedId ? 'knowledge-item-expanded' : ''}
                  style={{ 
                    transition: 'all 0.2s ease-out',
                    transformOrigin: 'top center',
                    position: 'relative'
                  }}
                >
                  {isLoadingItem && knowledge.id === expandedId && (
                    <Box 
                      sx={{ 
                        position: 'absolute', 
                        top: '50%', 
                        left: '50%', 
                        transform: 'translate(-50%, -50%)',
                        zIndex: 2,
                        bgcolor: 'rgba(255,255,255,0.7)',
                        borderRadius: 'var(--radius-md)',
                        p: 2
                      }}
                    >
                      <CircularProgress size={24} />
                    </Box>
                  )}
                  <KnowledgeItem
                    knowledge={knowledge.id === expandedId && activeKnowledge ? activeKnowledge : knowledge}
                    onUpdateKnowledge={handleUpdateKnowledge}
                    onDeleteAllKnowledge={handleDeleteAllKnowledge}
                    onDeleteOneKnowledge={handleDeleteOneKnowledge}
                    isExpanded={expandedId === knowledge.id}
                    onToggleExpand={() => handleVersionToggle(knowledge.id)}
                    permissionLevel={knowledge.permissionLevel}
                  />
                </div>
              ))}
          </div>
        ) : (
          <>
            {isSearchingContent ? (
              <Box
                sx={{
                  p: 6,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  color: 'var(--text-secondary)'
                }}
              >
                <CircularProgress size={24} sx={{ mb: 2 }} />
                <Typography variant="h6" component="div" sx={{ mb: 1, fontWeight: 500 }}>
                  Searching knowledge content...
                </Typography>
              </Box>
            ) : (
              <EmptyState
                title={searchQuery ? 'No Matching Knowledge Found' : 'No Knowledge Yet'}
                description={searchQuery 
                  ? 'Try adjusting your search terms or clear the search to see all knowledge.'
                  : 'Create your first knowledge item by clicking the + button above. Knowledge helps customize the AI\'s behavior and responses.'}
                context={searchQuery ? 'search' : 'knowledge'}
              />
            )}
          </>
        )}
    </PageLayout>
  );
};

export default Knowledge; 
