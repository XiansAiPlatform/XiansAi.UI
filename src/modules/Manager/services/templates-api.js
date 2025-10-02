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
     * Note: This endpoint is not yet implemented on the server side.
     * For now, this returns a simulated success response.
     * @param {string} templateName - Name of the template to deploy
     * @param {Object} deploymentConfig - Configuration for the deployment
     * @returns {Promise<Object>} Deployment result
     */
    deployTemplate: async (templateName, deploymentConfig = {}) => {
      try {
        // TODO: Implement actual deployment endpoint on server
        // For now, simulate a successful deployment
        console.log('Simulating template deployment:', { templateName, deploymentConfig });
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        return {
          success: true,
          message: `Template "${templateName}" deployed successfully`,
          agentName: deploymentConfig.agentName,
          deployedAt: new Date().toISOString()
        };
        
        // When the actual endpoint is implemented, use this:
        // const response = await apiClient.post('/api/client/templates/deploy', {
        //   templateName,
        //   ...deploymentConfig
        // });
        // return response;
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
