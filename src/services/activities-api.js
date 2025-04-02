import { useApiClient } from './api-client';
import { useMemo } from 'react';

export const useActivitiesApi = () => {
  const apiClient = useApiClient();

  return useMemo(() => {
    return {
      getWorkflowActivity: async (workflowId, activityId) => {
        try {
          return await apiClient.get(`/api/client/workflows/${workflowId}/activities/${activityId}`);
        } catch (error) {
          console.error('Error fetching workflow activity:', error);
          throw error;
        }
      }
    };
  }, [apiClient]);
};
