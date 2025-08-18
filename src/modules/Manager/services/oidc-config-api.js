import { useApiClient } from './api-client';
import { useMemo } from 'react';

export const useOidcConfigApi = () => {
  const apiClient = useApiClient();

  return useMemo(() => ({
    getTenantConfig: async () => {
      try {
        return await apiClient.get('/api/client/oidc-config/');
      } catch (error) {
        // Surface 404 as null to simplify consumer logic
        if (error && error.status === 404) {
          return null;
        }
        console.error('Error fetching OIDC config:', error);
        throw error;
      }
    },

    createTenantConfig: async (jsonConfig) => {
      try {
        return await apiClient.post('/api/client/oidc-config/', jsonConfig);
      } catch (error) {
        console.error('Error creating OIDC config:', error);
        throw error;
      }
    },

    updateTenantConfig: async (jsonConfig) => {
      try {
        return await apiClient.put('/api/client/oidc-config/', jsonConfig);
      } catch (error) {
        console.error('Error updating OIDC config:', error);
        throw error;
      }
    },

    deleteTenantConfig: async () => {
      try {
        return await apiClient.delete('/api/client/oidc-config/');
      } catch (error) {
        console.error('Error deleting OIDC config:', error);
        throw error;
      }
    },

    adminListAllConfigs: async () => {
      try {
        return await apiClient.get('/api/client/oidc-config/admin');
      } catch (error) {
        console.error('Error listing all OIDC configs (admin):', error);
        throw error;
      }
    }
  }), [apiClient]);
};

