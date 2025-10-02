import { useApiClient } from './api-client';
import { useMemo } from 'react';

/**
 * API hook for Generic OIDC configuration management
 * 
 * This service provides methods to manage Generic OIDC configuration for a tenant,
 * allowing configuration of multiple OIDC identity providers (Google, Okta, Auth0, etc.)
 * 
 * @returns {Object} API methods for Generic OIDC configuration
 */
export const useGenericOidcApi = () => {
  const apiClient = useApiClient();

  return useMemo(() => ({
    /**
     * Get Generic OIDC configuration for current tenant
     * @returns {Promise<Object|null>} The OIDC configuration or null if not found
     */
    getGenericOidcConfig: async () => {
      try {
        return await apiClient.get('/api/client/generic-oidc/');
      } catch (error) {
        // Return null for 404 (not found) to simplify consumer logic
        if (error && error.status === 404) {
          return null;
        }
        console.error('Error fetching Generic OIDC config:', error);
        throw error;
      }
    },

    /**
     * Create new Generic OIDC configuration
     * @param {Object} jsonConfig - The OIDC configuration object
     * @returns {Promise<Object>} The API response
     */
    createGenericOidcConfig: async (jsonConfig) => {
      try {
        return await apiClient.post('/api/client/generic-oidc/', jsonConfig);
      } catch (error) {
        console.error('Error creating Generic OIDC config:', error);
        throw error;
      }
    },

    /**
     * Update existing Generic OIDC configuration
     * @param {Object} jsonConfig - The updated OIDC configuration object
     * @returns {Promise<Object>} The API response
     */
    updateGenericOidcConfig: async (jsonConfig) => {
      try {
        return await apiClient.put('/api/client/generic-oidc/', jsonConfig);
      } catch (error) {
        console.error('Error updating Generic OIDC config:', error);
        throw error;
      }
    },

    /**
     * Delete Generic OIDC configuration
     * @returns {Promise<Object>} The API response
     */
    deleteGenericOidcConfig: async () => {
      try {
        return await apiClient.delete('/api/client/generic-oidc/');
      } catch (error) {
        console.error('Error deleting Generic OIDC config:', error);
        throw error;
      }
    },

    /**
     * Admin-only: List all tenant Generic OIDC configurations
     * @returns {Promise<Array>} List of all tenant configurations
     */
    adminListAllGenericOidcConfigs: async () => {
      try {
        return await apiClient.get('/api/client/generic-oidc/admin');
      } catch (error) {
        console.error('Error listing all Generic OIDC configs (admin):', error);
        throw error;
      }
    }
  }), [apiClient]);
};

