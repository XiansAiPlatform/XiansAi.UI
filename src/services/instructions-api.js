import { handleApiError } from '../utils/errorHandler';
import { getConfig } from '../config';
import { useMemo } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useSelectedOrg } from '../contexts/OrganizationContext';

const { apiBaseUrl } = getConfig();

export const useInstructionsApi = () => {
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


      
      createInstruction: async (instructionRequest) => {
        instructionRequest.name = instructionRequest.name.trim();
        try {
          const headers = await createAuthHeaders();
          const response = await fetch(`${apiBaseUrl}/api/client/instructions`, {
            method: 'POST',
            headers,
            body: JSON.stringify(instructionRequest)
          });
          
          if (!response.ok) {
            throw await handleApiError(response);
          }
          
          return await response.json();
        } catch (error) {
          console.error('Error creating instruction:', error);
          throw error;
        }
      },

      getInstruction: async (id) => {
        try {
          const headers = await createAuthHeaders();
          const response = await fetch(`${apiBaseUrl}/api/client/instructions/${id}`, {
            method: 'GET',
            headers
          });

          if (!response.ok) {
            throw await handleApiError(response);
          }

          return await response.json();
        } catch (error) {
          console.error('Error fetching instruction:', error);
          throw error;
        }
      },

      getLatestInstructions: async () => {
        try {
          const headers = await createAuthHeaders();
          const response = await fetch(`${apiBaseUrl}/api/client/instructions/latest`, {
            method: 'GET',
            headers
          });

          if (!response.ok) {
            throw await handleApiError(response);
          }

          return await response.json();
        } catch (error) {
          console.error('Error fetching latest instructions:', error);
          throw error;
        }
      },

      deleteInstruction: async (id) => {
        try {
          const headers = await createAuthHeaders();
          const response = await fetch(`${apiBaseUrl}/api/client/instructions/${id}`, {
            method: 'DELETE',
            headers
          });

          if (!response.ok) {
            throw await handleApiError(response);
          }

          return true;
        } catch (error) {
          console.error('Error deleting instruction:', error);
          throw error;
        }
      },

      deleteAllVersions: async (name) => {
        try {
          const headers = await createAuthHeaders();
          const response = await fetch(`${apiBaseUrl}/api/client/instructions/all`, {
            method: 'DELETE',
            headers,
            body: JSON.stringify({ "Name": name.trim() })
          });

          if (!response.ok) {
            throw await handleApiError(response);
          }

          return true;
        } catch (error) {
          console.error('Error deleting all versions:', error);
          throw error;
        }
      },

      getInstructionVersions: async (name) => {
        try {
          const headers = await createAuthHeaders();
          const encodedName = encodeURIComponent(name);
          const response = await fetch(`${apiBaseUrl}/api/client/instructions/versions?name=${encodedName}`, {
            method: 'GET',
            headers
          });

          if (!response.ok) {
            throw await handleApiError(response);
          }

          var versions = await response.json();
          return versions;
        } catch (error) {
          console.error('Error fetching instruction versions:', error);
          throw error;
        }
      }
    };
  }, [getAccessTokenSilently, selectedOrg]);
};
