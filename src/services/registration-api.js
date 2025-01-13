import { useAuth0 } from '@auth0/auth0-react';
import { handleApiError } from '../utils/errorHandler';
import { getConfig } from '../config';
import { useMemo } from 'react';
import { useSelectedOrg } from '../contexts/OrganizationContext';

const { apiBaseUrl } = getConfig();

export const useApi = () => {
  const { getAccessTokenSilently } = useAuth0();
  const { selectedOrg } = useSelectedOrg();

  const registrationApi = useMemo(() => {
    const getAccessToken = async () => {
      try {
        return await getAccessTokenSilently();
      } catch (error) {
        console.error('Error getting access token:', error);
        return null;
      }
    };

    const createAuthHeaders = async () => ({
      'Authorization': `Bearer ${await getAccessToken()}`,
      'Content-Type': 'application/json',
      'X-Tenant-Id': selectedOrg || '',
    });

    return {
      // validate verification code
      validateVerificationCode: async (email, code) => {
        try {
          const response = await fetch(`${apiBaseUrl}/api/client/register/verification/validate`, {
            method: 'POST',
            headers: await createAuthHeaders(),
            body: JSON.stringify({ Email: email, Code: code })
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to validate verification code');
          }
          const data = await response.json();
          console.log(data);
          return data.isValid;
        } catch (error) {
          console.error('Failed to validate verification code:', error);
          throw handleApiError(error, 'Failed to validate verification code');
        }
      },

      // Send verification code
      sendVerificationCode: async (email) => {
        try {
          const response = await fetch(`${apiBaseUrl}/api/client/register/verification/send`, {
            method: 'POST',
            headers: await createAuthHeaders(),
            body: JSON.stringify(email)
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to send verification code');
          }

          return response.json();
        } catch (error) {
          console.error('Failed to send verification code:', error);
          throw handleApiError(error, 'Failed to send verification code');
        }
      },
    };
  }, [getAccessTokenSilently, selectedOrg]);

  return registrationApi;
}; 