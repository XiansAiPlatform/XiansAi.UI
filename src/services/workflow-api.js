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
      
      fetchWorkflowRuns: async (timeFilter = '7days', ownerFilter = 'all', statusFilter = 'all') => {
        try {
          const { startTime, endTime } = getTimeRangeParams(timeFilter);
          const queryParams = {};
          
          if (startTime) {
            queryParams.startTime = startTime;
            queryParams.endTime = endTime;
          }
          
          if (ownerFilter === 'mine') {
            queryParams.owner = 'current';
          }
          
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
          return await apiClient.post('/api/client/workflows', {
            WorkflowType: workflowType,
            AgentName: agentName,
            Parameters: parameters,
            WorkflowId: flowId,
            QueueName: queueName
          });
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
      },
    };
  }, [apiClient]);
};

