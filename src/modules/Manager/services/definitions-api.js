import { useApiClient, getTimeRangeParams } from './api-client';
import { useMemo } from 'react';

export const useDefinitionsApi = () => {
  const apiClient = useApiClient();

  return useMemo(() => {
    return {
      getDefinitions: async (timeFilter = '7days', ownerFilter = 'all') => {
        try {
          const { startTime, endTime } = getTimeRangeParams(timeFilter);
          
          const queryParams = {};
          if (startTime) {
            queryParams.startTime = startTime;
            queryParams.endTime = endTime;
          }
          
          if (ownerFilter === 'mine') {
            queryParams.owner = 'current';
          }

          return await apiClient.get('/api/client/definitions', queryParams);
        } catch (error) {
          console.error('Error fetching definitions:', error);
          throw error;
        }
      },
      
      deleteDefinition: async (definitionId) => {
        try {
          await apiClient.delete(`/api/client/definitions/${definitionId}`);
          return true;
        } catch (error) {
          console.error('Error deleting definition:', error);
          throw error;
        }
      },
    };
  }, [apiClient]);
};
