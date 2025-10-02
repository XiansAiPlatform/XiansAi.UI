import React from 'react';
import PageLayout from '../Common/PageLayout';
import { getHeaderActions } from './DefinitionListHeader';
import EmptyStateComponent from '../Common/EmptyState';

const DefinitionsEmptyState = ({ 
  searchQuery,
  onSearchChange,
  timeFilter,
  onTimeFilterChange,
}) => (
  <PageLayout
    title="Agents"
    headerActions={getHeaderActions({
      searchQuery,
      onSearchChange,
      timeFilter,
      onTimeFilterChange
    })}
  >
    <EmptyStateComponent
      title="No Agents Deployed"
      description="Agent definitions are automatically created when flows are run for the first time or when the flow code is modified. To create definitions, please run your flows through the Agent Runner."
      context="agents"
    />
  </PageLayout>
);

export default DefinitionsEmptyState; 