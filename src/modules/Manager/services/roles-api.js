import { useApiClient } from './api-client';
import { useMemo } from 'react';

export const useRolesApi = () => {
  const apiClient = useApiClient();

  return useMemo(() => {
    return {
      getCurrentUserRole: async () => {
        try {
          return await apiClient.get('/api/roles/current');
        } catch (error) {
          console.log('Failed to fetch Flow Server API key:', error);
          throw error;
        }
      },
       getTenantAdmins: async (tenantId) => {
        try {
          return await apiClient.get(`/api/roles/tenant/${tenantId}/admins`);
        } catch (error) {
          console.log('Failed to fetch tenant admins:', error);
          throw error;
        }
      }
    };
  }, [apiClient]);
}; 