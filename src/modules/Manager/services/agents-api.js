import { useApiClient } from './api-client';
import { useMemo } from 'react';

export const useAgentsApi = () => {
  const apiClient = useApiClient();

  return useMemo(() => {
    return {
      getAllAgents: async (scope = null) => {
        try {
          const queryParams = scope ? { scope } : {};
          return await apiClient.get('/api/client/agents/names', queryParams);
        } catch (error) {
          console.error('Error fetching agents:', error);
          throw error;
        }
      },

      getGroupedDefinitions: async () => {
        try {
          return await apiClient.get('/api/client/agents/all');
        } catch (error) {
          console.error('Error fetching grouped definitions:', error);
          throw error;
        }
      },


      getDefinitionsBasic: async (agentName) => {
        try {
          return await apiClient.get(`/api/client/agents/${agentName}/definitions/basic`);
        } catch (error) {
          console.error('Error fetching grouped definitions:', error);
          throw error;
        }
      },

      getWorkflowInstances: async (agentName = null, typeName = null) => {
        try {
          return await apiClient.get(`/api/client/agents/${agentName}/${typeName}/runs`);
        } catch (error) {
          console.error('Error fetching workflow instances:', error);
          throw error;
        }
      },

      deleteAgent: async (agentName) => {
        try {
          return await apiClient.delete(`/api/client/agents/${agentName}`);
        } catch (error) {
          console.error('Error deleting agent:', error);
          throw error;
        }
      }
    };
  }, [apiClient]);
}; 