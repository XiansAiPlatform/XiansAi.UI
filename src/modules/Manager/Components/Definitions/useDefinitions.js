import { useState, useEffect } from 'react';
import { useDefinitionsApi } from '../../services/definitions-api';
import { useAgentsApi } from '../../services/agents-api';
import { useLoading } from '../../contexts/LoadingContext';
import { useNotification } from '../../contexts/NotificationContext';
import { useAuth } from '../../auth/AuthContext';
import { 
  filterAgentGroups, 
  sortAgentGroupsByDate,
  isUserOwnerOfAllWorkflows
} from './definitionUtils';

/**
 * Custom hook for managing definitions state and operations
 * @returns {Object} Object containing state, handlers, and computed values
 */
export const useDefinitions = () => {
  const [agentGroups, setAgentGroups] = useState([]);
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
  const filteredAndSortedAgentGroups = sortAgentGroupsByDate(
    filterAgentGroups(agentGroups, searchQuery)
  );
  
  // Extract data for component compatibility
  const grouped = {};
  const latestFlowByAgent = {};
  const sortedAgentNames = [];
  
  filteredAndSortedAgentGroups.forEach(agentGroup => {
    const agentName = agentGroup.agent.name;
    grouped[agentName] = agentGroup.definitions;
    sortedAgentNames.push(agentName);
    
    // Find the latest flow date for this agent
    if (agentGroup.definitions.length > 0) {
      const latestDate = agentGroup.definitions.reduce((latest, def) => {
        const defDate = new Date(def.createdAt);
        return defDate > latest ? defDate : latest;
      }, new Date(0));
      latestFlowByAgent[agentName] = latestDate;
    }
  });

  // Get flat list of all definitions for compatibility
  const definitions = agentGroups.flatMap(group => group.definitions);

  // Fetch definitions
  const fetchDefinitions = async () => {
    try {
      setLoading(true);
      const data = await definitionsApi.getDefinitions(timeFilter);
      setAgentGroups(data);
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
      
      // Update the agent groups state by removing the agent group
      setAgentGroups(prevAgentGroups => 
        prevAgentGroups.filter(group => group.agent.name !== selectedAgentName)
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
    const agentGroup = agentGroups.find(group => group.agent.name === agentName);
    if (!agentGroup) return false;
    
    return isUserOwnerOfAllWorkflows(agentGroup.agent, user);
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