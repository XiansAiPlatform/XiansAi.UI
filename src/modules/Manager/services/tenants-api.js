import { useApiClient } from './api-client';
import { useMemo } from 'react';

export const useTenantsApi = () => {
  const apiClient = useApiClient();

  return useMemo(() => {
    return {
      getAllTenants: async () => {
        try {
          return await apiClient.get('/api/client/tenants');
        } catch (error) {
          console.error('Error fetching tenants:', error);
          throw error;
        }
      }
    };
  }, [apiClient]);
}; 