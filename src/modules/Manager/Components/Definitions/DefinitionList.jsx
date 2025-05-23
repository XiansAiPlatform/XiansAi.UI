import { Box, Typography } from '@mui/material';
import { useDefinitions } from './useDefinitions';
import { useSlider } from '../../contexts/SliderContext';
import DefinitionListHeader from './DefinitionListHeader';
import AgentGroup from './AgentGroup';
import DefinitionActions from './DefinitionActions';
import EmptyState from './EmptyState';
import PermissionsManager from './PermissionsManager';
import { tableStyles } from './styles';

const DefinitionList = () => {
  const {
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
    handleDeleteSuccess,
    handleMenuClick,
    handleDeleteAllClick,
    handleDeleteAllCancel,
    handleDeleteAllConfirm,
    setSelectedAgent,
    
    // Utilities
    isOwnerOfAllWorkflows
  } = useDefinitions();

  const { openSlider } = useSlider();

  const handleShare = (agentName) => {
    openSlider(
      <PermissionsManager agentName={agentName} />,
      `Share ${agentName}`
    );
  };

  const handleDeleteAllForAgent = (agentName) => {
    // Set the selected agent name for the delete operation
    setSelectedAgent(agentName);
    handleDeleteAllClick();
  };

  // Error state
  if (error) {
    return (
      <Box p={2}>
        <Typography color="error">Error loading definitions: {error}</Typography>
      </Box>
    );
  }

  // Empty state
  if (!definitions.length) {
    return (
      <EmptyState 
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        timeFilter={timeFilter}
        onTimeFilterChange={handleTimeFilterChange}
      />
    );
  }

  return (
    <Box sx={tableStyles.container}>
      <DefinitionListHeader
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        timeFilter={timeFilter}
        onTimeFilterChange={handleTimeFilterChange}
      />

      {sortedAgentNames.map((agentName) => (
        <AgentGroup
          key={agentName}
          agentName={agentName}
          definitions={grouped[agentName]}
          latestUpdateDate={latestFlowByAgent[agentName]}
          openDefinitionId={openDefinitionId}
          onToggle={handleToggle}
          onDeleteSuccess={handleDeleteSuccess}
          onMenuClick={handleMenuClick}
          isOwnerOfAllWorkflows={isOwnerOfAllWorkflows(agentName)}
          onDeleteAllClick={() => handleDeleteAllForAgent(agentName)}
          onShareClick={() => handleShare(agentName)}
        />
      ))}

      <DefinitionActions
        selectedAgentName={selectedAgentName}
        deleteDialogOpen={deleteDialogOpen}
        onDeleteAllCancel={handleDeleteAllCancel}
        onDeleteAllConfirm={handleDeleteAllConfirm}
      />
    </Box>
  );
};

export default DefinitionList;