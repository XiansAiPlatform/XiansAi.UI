import { useApiClient } from './api-client';
import { useMemo } from 'react';

export const useAuditingApi = () => {
  const apiClient = useApiClient();

  return useMemo(() => {
    return {
      getUsers: async (agentName) => {
        try {
          // Mock data - replace with actual API call
          const mockUsers = [
            { id: 'user1', name: 'John Doe' },
            { id: 'user2', name: 'Jane Smith' },
            { id: 'user3', name: 'Bob Johnson' }
          ];
          return mockUsers;

          // Actual implementation would be:
          // return await apiClient.get('/api/client/auditing/users', { agentName });
        } catch (error) {
          console.error('Error fetching users:', error);
          throw error;
        }
      },

      getAgentsAndTypes: async () => {
        try {
          return await apiClient.get('/api/client/messaging/agents');
        } catch (error) {
          console.error('Error fetching agents and types:', error);
          throw error;
        }
      },

      getWorkflows: async (agentName, workflowType) => {
        try {
          const url = '/api/client/messaging/workflows';
          const params = {};
          
          if (agentName) params.agentName = agentName;
          if (workflowType) params.typeName = workflowType;
          
          const response = await apiClient.get(url, params);
          return response.value;
        } catch (error) {
          console.error('Error fetching workflows:', error);
          throw error;  
        }
      },

      getWorkflows: async (userId) => {
        try {
          // Mock data - replace with actual API call
          const mockWorkflows = [
            { id: 'wf1', name: 'Workflow 1', status: 'running' },
            { id: 'wf2', name: 'Workflow 2', status: 'completed' },
            { id: 'wf3', name: 'Workflow 3', status: 'failed' }
          ];
          return mockWorkflows;

          // Actual implementation would be:
          // return await apiClient.get('/api/client/auditing/workflows', { userId });
        } catch (error) {
          console.error('Error fetching workflows:', error);
          throw error;
        }
      },

      getWorkflowLogs: async (workflowId) => {
        try {
          // Mock data - replace with actual API call
          const mockLogs = [
            {
              timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
              level: 'INFO',
              message: 'Workflow started'
            },
            {
              timestamp: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
              level: 'INFO',
              message: 'Processing step 1'
            },
            {
              timestamp: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
              level: 'WARNING',
              message: 'Retrying failed operation'
            },
            {
              timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
              level: 'INFO',
              message: 'Operation completed successfully'
            },
            {
              timestamp: new Date(Date.now() - 1000 * 60 * 1).toISOString(),
              level: 'INFO',
              message: 'Workflow completed'
            }
          ];
          return mockLogs;

          // Actual implementation would be:
          // return await apiClient.get('/api/client/auditing/workflow-logs', { workflowId });
        } catch (error) {
          console.error('Error fetching workflow logs:', error);
          throw error;
        }
      }
    };
  }, [apiClient]);
}; 