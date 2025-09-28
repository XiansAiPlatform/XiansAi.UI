import { useApiClient } from '../../Manager/services/api-client';
import { useMemo } from 'react';

export const useRegistrationApi = () => {
  const apiClient = useApiClient();

  return useMemo(() => {
    return {
      // validate verification code (legacy - keeping for other components that might use it)
      validateVerificationCode: async (email, code) => {
        try {
          const response = await apiClient.post('/api/public/register/verification/validate', { 
            Email: email, 
            Code: code 
          });
          
          return response.isValid;
        } catch (error) {
          console.error('Failed to validate verification code:', error);
          throw error;
        }
      },

      // Send verification code (legacy - keeping for other components that might use it)
      sendVerificationCode: async (email) => {
        try {
          return await apiClient.post('/api/public/register/verification/send', email);
        } catch (error) {
          console.error('Failed to send verification code:', error);
          throw error;
        }
      },

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

      // Get tenant info
      getTenantInfo: async (tenantId) => {
        try {
          return await apiClient.get(`/api/public/register/tenant/${tenantId}/info`);
        } catch (error) {
          console.error('Failed to get tenant info:', error);
          throw error;
        }
      },
    };
  }, [apiClient]);
}; 