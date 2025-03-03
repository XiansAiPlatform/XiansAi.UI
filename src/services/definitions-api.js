import { handleApiError } from '../utils/errorHandler';
import { getConfig } from '../config';
import { useMemo } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useSelectedOrg } from '../contexts/OrganizationContext';

const { apiBaseUrl } = getConfig();

const getTimeRangeParams = (timeFilter) => {
  const now = new Date();
  const endTime = now.toISOString();
  let startTime;

  switch (timeFilter) {
    case '7days':
      startTime = new Date(now.setDate(now.getDate() - 7)).toISOString();
      break;
    case '30days':
      startTime = new Date(now.setDate(now.getDate() - 30)).toISOString();
      break;
    case 'all':
    default:
      startTime = null;
      break;
  }

  return { startTime, endTime };
};

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
      getDefinitions: async (timeFilter = '7days', ownerFilter = 'all') => {
        try {
          const headers = await createAuthHeaders();
          const { startTime, endTime } = getTimeRangeParams(timeFilter);
          
          const queryParams = new URLSearchParams();
          if (startTime) {
            queryParams.append('startTime', startTime);
            queryParams.append('endTime', endTime);
          }
          if (ownerFilter === 'mine') {
            queryParams.append('owner', 'current');
          }

          const response = await fetch(`${apiBaseUrl}/api/client/definitions?${queryParams}`, {
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
