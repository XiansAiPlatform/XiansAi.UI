import { useApiClient } from './api-client';
import { useMemo } from 'react';

export const useMessagingApi = () => {
  const apiClient = useApiClient();

  return useMemo(() => {
    return {
      getAgentsAndTypes: async () => {
        try {
          return await apiClient.get('/api/client/messaging/agents');
        } catch (error) {
          console.error('Error fetching agents and types:', error);
          throw error;
        }
      },

      getWorkflows: async (agentName, workflowType) => {
        try {
          const url = '/api/client/messaging/workflows';
          const params = {};
          
          if (agentName) params.agentName = agentName;
          if (workflowType) params.typeName = workflowType;
          
          const response = await apiClient.get(url, params);
          return response.value;
        } catch (error) {
          console.error('Error fetching workflows:', error);
          throw error;  
        }
      }
      
    };
  }, [apiClient]);
};
