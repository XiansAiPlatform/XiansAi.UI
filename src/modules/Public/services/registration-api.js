import { useApiClient } from '../../Manager/services/api-client';
import { useMemo } from 'react';

export const useRegistrationApi = () => {
  const apiClient = useApiClient();

  return useMemo(() => {
    return {
      // Join tenant request
      joinTenant: async (tenantId, userToken) => {
        try {
          const response = await apiClient.post('/api/public/register/join-tenant', 
            { TenantId: tenantId },
            {
              headers: {
                'Authorization': `Bearer ${userToken}`
              }
            }
          );
          
          return response;
        } catch (error) {
          console.error('Failed to submit tenant join request:', error);
          throw error;
        }
      }
    };
  }, [apiClient]);
}; 