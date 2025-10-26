import { useApiClient } from './api-client';
import { useMemo } from 'react';

export const useSettingsApi = () => {
  const apiClient = useApiClient();

  return useMemo(() => {
    return {
      generateApiKey: async (revoke_previous = false) => {
        try {
          return await apiClient.post('/api/client/settings/appserver/base64cert?revoke_previous=' + revoke_previous);
        } catch (error) {
          console.error('Failed to generate API key:', error);
          throw error;
        }
      }
    };
  }, [apiClient]);
}; 