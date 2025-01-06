import { handleApiError } from '../utils/errorHandler';
import { getConfig } from '../config';
import { useMemo } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useSelectedOrg } from '../contexts/OrganizationContext';

const { apiBaseUrl } = getConfig();

export const useDefinitionsApi = () => {
  const { getAccessTokenSilently } = useAuth0();
  const { selectedOrg } = useSelectedOrg();

  return useMemo(() => {
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
      getDefinitions: async () => {
        try {
          const headers = await createAuthHeaders();
          const response = await fetch(`${apiBaseUrl}/api/client/definitions`, {
            method: 'GET',
            headers
          });

          if (!response.ok) {
            throw await handleApiError(response);
          }

          return await response.json();
        } catch (error) {
          console.error('Error fetching definitions:', error);
          throw error;
        }
      },

    };
  }, [getAccessTokenSilently, selectedOrg]);
};
