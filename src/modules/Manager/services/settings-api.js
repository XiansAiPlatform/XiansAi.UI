import { useApiClient } from './api-client';
import { useMemo } from 'react';

export const useSettingsApi = () => {
  const apiClient = useApiClient();

  return useMemo(() => {
    return {
      generateApiKey: async () => {
        try {
          return await apiClient.post('/api/client/certificates/generate/base64', {
            fileName: 'AppServerApiKey',
          });
        } catch (error) {
          console.error('Failed to generate API key:', error);
          throw error;
        }
      },

      getFlowServerSettings: async () => {
        try {
          return await apiClient.get('/api/client/settings/flowserver');
        } catch (error) {
          console.error('Failed to fetch Flow Server settings:', error);
          throw error;
        }
      },

      getFlowServerApiKey: async () => {
        try {
          return await apiClient.get('/api/client/certificates/flowserver/base64');
        } catch (error) {
          console.error('Failed to fetch Flow Server API key:', error);
          throw error;
        }
      }
    };
  }, [apiClient]);
}; 