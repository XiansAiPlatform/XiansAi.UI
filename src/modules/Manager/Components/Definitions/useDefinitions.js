import { useState, useEffect } from 'react';
import { useDefinitionsApi } from '../../services/definitions-api';
import { useAgentsApi } from '../../services/agents-api';
import { useLoading } from '../../contexts/LoadingContext';
import { useNotification } from '../../contexts/NotificationContext';
import { useAuth } from '../../auth/AuthContext';
import { 
  filterDefinitions, 
  sortDefinitionsByDate, 
  groupDefinitionsByAgent,
  isUserOwnerOfAllWorkflows
} from './definitionUtils';

/**
 * Custom hook for managing definitions state and operations
 * @returns {Object} Object containing state, handlers, and computed values
 */
export const useDefinitions = () => {
  const [definitions, setDefinitions] = useState([]);
  const [error, setError] = useState(null);
  const [openDefinitionId, setOpenDefinitionId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAgentName, setSelectedAgentName] = useState(null);

  const definitionsApi = useDefinitionsApi();
  const agentsApi = useAgentsApi();
  const { setLoading } = useLoading();
  const { showSuccess, showError } = useNotification();
  const { user } = useAuth();

  // Computed values
  const filteredAndSortedDefinitions = sortDefinitionsByDate(
    filterDefinitions(definitions, searchQuery)
  );
  
  const { grouped, sortedAgentNames, latestFlowByAgent } = groupDefinitionsByAgent(filteredAndSortedDefinitions);

  // Fetch definitions
  const fetchDefinitions = async () => {
    try {
      setLoading(true);
      const data = await definitionsApi.getDefinitions(timeFilter);
      setDefinitions(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error loading definitions:', err);
      showError('Failed to load definitions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Effect to fetch definitions when timeFilter changes
  useEffect(() => {
    fetchDefinitions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeFilter]);

  // Handlers
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

  const setSelectedAgent = (agentName) => {
    setSelectedAgentName(agentName);
  };

  const handleDeleteAllClick = () => {
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
      // Use the new agents API to delete the entire agent and all its definitions
      await agentsApi.deleteAgent(selectedAgentName);
      
      // Update the definitions state by removing all definitions for this agent
      setDefinitions(prevDefinitions => 
        prevDefinitions.filter(def => def.agent !== selectedAgentName)
      );
      
      showSuccess(`Successfully deleted agent "${selectedAgentName}" and all its definitions`);
      setSelectedAgentName(null);
    } catch (error) {
      console.error('Failed to delete agent:', error);
      showError('Failed to delete agent. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Check if user is owner of all workflows for selected agent
  const isOwnerOfAllWorkflows = (agentName) => {
    return isUserOwnerOfAllWorkflows(agentName, definitions, user);
  };

  return {
    // State
    definitions,
    error,
    openDefinitionId,
    searchQuery,
    timeFilter,
    deleteDialogOpen,
    selectedAgentName,
    
    // Computed values
    grouped,
    sortedAgentNames,
    latestFlowByAgent,
    
    // Handlers
    handleToggle,
    handleSearchChange,
    handleTimeFilterChange,
    handleDeleteAllClick,
    handleDeleteAllCancel,
    handleDeleteAllConfirm,
    setSelectedAgent,
    
    // Utilities
    isOwnerOfAllWorkflows,
    fetchDefinitions
  };
}; 