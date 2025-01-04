import { handleApiError } from '../utils/errorHandler';
import { getConfig } from '../config';
import { useMemo } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useSelectedOrg } from '../contexts/OrganizationContext';

const { apiBaseUrl } = getConfig();

export const useActivitiesApi = () => {
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

      getWorkflowActivity: async (workflowId, activityId) => {
        try {
          const headers = await createAuthHeaders();
          const response = await fetch(`${apiBaseUrl}/api/client/workflows/${workflowId}/activities/${activityId}`, {
            method: 'GET',
            headers
          });

          if (!response.ok) {
            throw await handleApiError(response);
          }

          var activity = await response.json();
          return activity;
        } catch (error) {
          console.error('Error fetching workflow activity:', error);
          throw error;
        }
      }
    };
  }, [getAccessTokenSilently, selectedOrg]);
};
