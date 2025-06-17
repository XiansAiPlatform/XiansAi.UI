import { useMemo } from 'react';
import { useApiClient, getTimeRangeParams } from './api-client';


export const useWorkflowApi = () => {
  const apiClient = useApiClient();

  return useMemo(() => {
    return {
      getWorkflow: async (workflowId, runId) => {
        try {
          return await apiClient.get(`/api/client/workflows/${workflowId}/${runId}`);
        } catch (error) {
          console.error('Failed to fetch workflow:', error);
          throw error;
        }
      },

      fetchWorkflowRuns: async (statusFilter = 'all') => {
        try {
          const queryParams = {};

          if (statusFilter !== 'all') {
            queryParams.status = statusFilter;
          }

          return await apiClient.get('/api/client/workflows', queryParams);
        } catch (error) {
          console.error('Failed to fetch workflows:', error);
          throw error;
        }
      },

      fetchActivityEvents: async (workflowId) => {
        try {
          if (!workflowId) {
            throw new Error('Workflow ID is required');
          }

          return await apiClient.get(`/api/client/workflows/${workflowId}/events`);
        } catch (error) {
          console.error('Failed to fetch workflow events:', error);
          throw error;
        }
      },

      fetchWorkflowRunLogs: async (workflowRunId, skip = 0, limit = 20, logLevel = null) => {
        try {
          const queryParams = { 
            workflowRunId, 
            skip, 
            limit 
          };
          if (logLevel !== null) {
            queryParams.logLevel = Number(logLevel);
          }
          return await apiClient.get('/api/client/logs/workflow', queryParams);
        } catch (error) {
          console.error('Failed to fetch workflow run logs:', error);
          throw error;
        }
      },

      executeWorkflowCancelAction: async (workflowId, force = false) => {
        try {
          return await apiClient.post(`/api/client/workflows/${workflowId}/cancel?force=${force}`);
        } catch (error) {
          console.error('Failed to execute workflow cancel action:', error);
          throw error;
        }
      },

      startNewWorkflow: async (workflowType, agentName, parameters, flowId = null, queueName = null) => {
        try {
          const payload = {
            workflowType,
            agentName: agentName,
            parameters,
            workflowId: flowId,
            queueName
          };

          // Only include optional fields if they have values
          if (!flowId) delete payload.id;
          if (!queueName) delete payload.queueName;

          return await apiClient.post('/api/client/workflows', payload);
        } catch (error) {
          console.error('Failed to start workflow:', error);
          throw error;
        }
      },

      streamActivityEvents: async (workflowId, onEventReceived) => {
        try {
          if (!workflowId) {
            throw new Error('Workflow ID is required');
          }

          await apiClient.stream(`/api/client/workflows/${workflowId}/events/stream`, onEventReceived);
        } catch (error) {
          console.error('Failed to establish event stream:', error);
          throw error;
        }
      }
    };
  }, [apiClient]);
};

