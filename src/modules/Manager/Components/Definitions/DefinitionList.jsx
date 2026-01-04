import { Box, Typography } from '@mui/material';
import { useDefinitions } from './useDefinitions';
import { useSlider } from '../../contexts/SliderContext';
import { getHeaderActions } from './DefinitionListHeader';
import AgentGroup from './AgentGroup';
import DefinitionActions from './DefinitionActions';
import EmptyState from './EmptyState';
import PermissionsManager from './PermissionsManager';
import { tableStyles } from './styles';
import PageLayout from '../Common/PageLayout';
import { ListSkeleton } from '../../../../components/SkeletonLoaders';

const DefinitionList = () => {
  const {
    // State
    definitions,
    error,
    isLoading,
    openDefinitionId,
    searchQuery,
    timeFilter,
    deleteDialogOpen,
    selectedAgentName,
    
    // Computed values
    grouped,
    sortedAgentNames,
    latestFlowByAgent,
    agentsByName,
    
    // Handlers
    handleToggle,
    handleSearchChange,
    handleTimeFilterChange,
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

  // Loading state
  if (isLoading) {
    return (
      <PageLayout
        title="Deployed Agents"
        subtitle="Loading agents..."
        headerActions={getHeaderActions({
          searchQuery,
          onSearchChange: handleSearchChange,
          timeFilter,
          onTimeFilterChange: handleTimeFilterChange
        })}
      >
        <Box sx={tableStyles.container}>
          <ListSkeleton rows={5} height={120} />
        </Box>
      </PageLayout>
    );
  }

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
    <PageLayout
      title="Deployed Agents"
      subtitle={`${sortedAgentNames.length} agent${sortedAgentNames.length !== 1 ? 's' : ''} deployed`}
      headerActions={getHeaderActions({
        searchQuery,
        onSearchChange: handleSearchChange,
        timeFilter,
        onTimeFilterChange: handleTimeFilterChange
      })}
    >
      <Box sx={tableStyles.container}>
        {sortedAgentNames.map((agentName) => (
        <AgentGroup
          key={agentName}
          agentName={agentName}
          agent={agentsByName[agentName]}
          definitions={grouped[agentName]}
          latestUpdateDate={latestFlowByAgent[agentName]}
          openDefinitionId={openDefinitionId}
          onToggle={handleToggle}
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
    </PageLayout>
  );
};

export default DefinitionList;