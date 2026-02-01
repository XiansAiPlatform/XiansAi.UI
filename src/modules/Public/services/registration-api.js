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
      },

      // Create new tenant request
      createTenant: async (tenantData, userToken) => {
        try {
          const response = await apiClient.post('/api/public/register/new-tenant', 
            {
              TenantId: tenantData.tenantId,
              Name: tenantData.name,
              Domain: tenantData.domain,
              Description: tenantData.description,
              CreatedBy: tenantData.CreatedBy
            },
            {
              headers: {
                'Authorization': `Bearer ${userToken}`
              }
            }
          );
          
          return response;
        } catch (error) {
          console.error('Failed to create new tenant:', error);
          throw error;
        }
      }
    };
  }, [apiClient]);
}; 