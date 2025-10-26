import { useApiClient } from './api-client';
import { useMemo } from 'react';

/**
 * Custom hook for templates API operations
 * Provides methods to interact with agent templates (system-scoped agents)
 */
export const useTemplatesApi = () => {
  const apiClient = useApiClient();

  return useMemo(() => ({
    /**
     * Get all system-scoped agent definitions (templates)
     * @param {boolean} basicDataOnly - Whether to return basic data only
     * @returns {Promise<Array>} Array of agent templates with their definitions
     */
    getAgentTemplates: async (basicDataOnly = false) => {
      try {
        const queryParams = {};
        if (basicDataOnly) {
          queryParams.basicDataOnly = true;
        }
        
        const response = await apiClient.get('/api/client/templates/agents', queryParams);
        return response || [];
      } catch (error) {
        console.error('Error fetching agent templates:', error);
        throw error;
      }
    },

    /**
     * Deploy an agent template (create a new agent instance from template)
     * @param {string} agentName - Name of the template agent to deploy
     * @returns {Promise<Object>} Deployment result
     */
    deployTemplate: async (agentName) => {
      try {
        const response = await apiClient.post('/api/client/templates/deploy', {
          agentName
        });
        return response;
      } catch (error) {
        console.error('Error deploying template:', error);
        throw error;
      }
    },

    /**
     * Delete a system-scoped agent template
     * Only available to system administrators
     * @param {string} agentName - Name of the agent template to delete
     * @returns {Promise<Object>} Deletion result
     */
    deleteTemplate: async (agentName) => {
      try {
        const response = await apiClient.delete(`/api/client/templates/${agentName}`);
        return response;
      } catch (error) {
        console.error('Error deleting template:', error);
        throw error;
      }
    }
  }), [apiClient]);
};
