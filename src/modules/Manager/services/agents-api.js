import { useApiClient } from './api-client';
import { useMemo } from 'react';

export const useAgentsApi = () => {
  const apiClient = useApiClient();

  return useMemo(() => {
    return {
      getAllAgents: async () => {
        try {
          return await apiClient.get('/api/client/agents/all');
        } catch (error) {
          console.error('Error fetching agents:', error);
          throw error;
        }
      },

      getGroupedDefinitions: async () => {
        try {
          return await apiClient.get('/api/client/agents/workflows/all');
        } catch (error) {
          console.error('Error fetching grouped definitions:', error);
          throw error;
        }
      },

      getWorkflowInstances: async (agentName = null, typeName = null) => {
        try {
          const queryParams = {};
          if (agentName) queryParams.agentName = agentName;
          if (typeName) queryParams.typeName = typeName;

          return await apiClient.get('/api/client/agents/workflows', queryParams);
        } catch (error) {
          console.error('Error fetching workflow instances:', error);
          throw error;
        }
      },

      deleteAgent: async (agentName) => {
        try {
          return await apiClient.delete(`/api/client/agents/${encodeURIComponent(agentName)}`);
        } catch (error) {
          console.error('Error deleting agent:', error);
          throw error;
        }
      }
    };
  }, [apiClient]);
}; 