import { useApiClient } from './api-client';
import { useMemo } from 'react';

/**
 * API for activations (db collection "activations").
 * Used to populate the activation filter dropdown on the Runs page.
 */
export const useActivationsApi = () => {
  const apiClient = useApiClient();

  return useMemo(() => {
    return {
      /**
       * Fetch all activation names for the current tenant/context.
       * Backend should read from the "activations" collection.
       * @returns {Promise<string[]>} List of activation names
       */
      getActivations: async () => {
        try {
          const response = await apiClient.get('/api/client/activations');
          if (Array.isArray(response)) {
            return response;
          }
          if (response && Array.isArray(response.names)) {
            return response.names;
          }
          return [];
        } catch (error) {
          console.error('Error fetching activations:', error);
          throw error;
        }
      }
    };
  }, [apiClient]);
};
