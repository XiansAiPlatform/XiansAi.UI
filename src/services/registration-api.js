import { useApiClient } from './api-client';
import { useMemo } from 'react';

export const useRegistrationApi = () => {
  const apiClient = useApiClient();

  return useMemo(() => {
    return {
      // validate verification code
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

      // Send verification code
      sendVerificationCode: async (email) => {
        try {
          return await apiClient.post('/api/public/register/verification/send', email);
        } catch (error) {
          console.error('Failed to send verification code:', error);
          throw error;
        }
      },
    };
  }, [apiClient]);
}; 