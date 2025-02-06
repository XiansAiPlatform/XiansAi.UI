import { useAuth0 } from '@auth0/auth0-react';
import { handleApiError } from '../utils/errorHandler';
import { getConfig } from '../config';
import { useMemo } from 'react';
import { useSelectedOrg } from '../contexts/OrganizationContext';

const { apiBaseUrl } = getConfig();

export const useApi = () => {
  const { getAccessTokenSilently } = useAuth0();
  const { selectedOrg } = useSelectedOrg();

  const api = useMemo(() => {
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
      generateApiKey: async () => {
        try {
          const response = await fetch(`${apiBaseUrl}/api/client/certificates/generate/base64`, {
            method: 'POST',
            headers: await createAuthHeaders(),
            body: JSON.stringify({
              fileName: 'AppServerApiKey',
            })
          }); 

          if (!response.ok) {
            throw new Error('Failed to generate API key');
          }

          return response.json();
        } catch (error) {
          console.error('Failed to generate API key:', error);
          throw handleApiError(error, 'Failed to generate API key');
        }
      },

      generateCertificate: async (name, password) => {
        try {
          const response = await fetch(`${apiBaseUrl}/api/client/certificates/generate`, {
            method: 'POST',
            headers: await createAuthHeaders(),
            body: JSON.stringify({
              fileName: name,
              password: password
            })
          });

          if (!response.ok) {
            let serverError = '';
            try {
              const errorData = await response.json();
              serverError = errorData.message || errorData.error || response.statusText;
            } catch {
              serverError = response.statusText;
            }
            throw new Error(JSON.stringify({
              status: response.status,
              statusText: response.statusText,
              message: serverError
            }));
          }

          return response.blob();
        } catch (error) {
          console.error('Failed to generate certificate:', error);
          throw handleApiError(error, 'Failed to generate certificate');
        }
      },

      getFlowServerSettings: async () => {
        try {
          const response = await fetch(`${apiBaseUrl}/api/client/settings/flowserver`, {
            method: 'GET',
            headers: await createAuthHeaders(),
          });

          if (!response.ok) {
            throw new Error('Failed to fetch Flow Server settings');
          }

          return response.json();
        } catch (error) {
          console.error('Failed to fetch Flow Server settings:', error);
          throw handleApiError(error, 'Failed to fetch Flow Server settings');
        }
      },

      getFlowServerCertFile: async (fileName) => {
        try {
          const response = await fetch(`${apiBaseUrl}/api/client/certificates/flowserver/cert?fileName=${encodeURIComponent(fileName)}`, {
            method: 'GET',
            headers: await createAuthHeaders(),
          });

          if (!response.ok) {
            throw new Error('Failed to fetch Flow Server certificate file');
          }

          return response.blob();
        } catch (error) {
          console.error('Failed to fetch Flow Server certificate file:', error);
          throw handleApiError(error, 'Failed to fetch Flow Server certificate file');
        }
      },

      getFlowServerPrivateKeyFile: async (fileName) => {
        try {
          const response = await fetch(`${apiBaseUrl}/api/client/certificates/flowserver/privatekey?fileName=${encodeURIComponent(fileName)}`, {
            method: 'GET',
            headers: await createAuthHeaders(),
          });

          if (!response.ok) {
            throw new Error('Failed to fetch Flow Server private key file');
          }

          return response.blob();
        } catch (error) {
          console.error('Failed to fetch Flow Server private key file:', error);
          throw handleApiError(error, 'Failed to fetch Flow Server private key file');
        }
      },
    };
  }, [getAccessTokenSilently, selectedOrg]);

  return api;
}; 