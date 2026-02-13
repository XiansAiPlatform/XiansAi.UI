import { useMemo } from 'react';
import { useApiClient } from './api-client';


export const useWorkflowApi = () => {
  const apiClient = useApiClient();

  return useMemo(() => {
    return {
      getWorkflow: async (workflowId, runId) => {
        try {
          const queryParams = { workflowId };
          if (runId) {
            queryParams.runId = runId;
          }
          return await apiClient.get('/api/client/workflows/', queryParams);
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

          return await apiClient.get('/api/client/workflows/list', queryParams);
        } catch (error) {
          console.error('Failed to fetch workflows:', error);
          throw error;
        }
      },

      fetchPaginatedWorkflowRuns: async (options = {}) => {
        try {
          const { 
            status = 'all', 
            agent = null, 
            workflowType = null,
            user = null,
            idPostfix = null,
            pageSize = 20, 
            pageToken = null 
          } = options;

          const queryParams = {};

          if (status !== 'all') {
            queryParams.status = status;
          }

          if (agent) {
            queryParams.agent = agent;
          }

          if (workflowType) {
            queryParams.workflowType = workflowType;
          }

          if (user) {
            queryParams.user = user;
          }

          if (idPostfix) {
            queryParams.idPostfix = idPostfix;
          }

          if (pageSize) {
            queryParams.pageSize = pageSize;
          }

          if (pageToken) {
            queryParams.pageToken = pageToken;
          }

          return await apiClient.get('/api/client/workflows/list', queryParams);
        } catch (error) {
          console.error('Failed to fetch paginated workflows:', error);
          throw error;
        }
      },

      getWorkflowTypes: async (agent) => {
        try {
          if (!agent) {
            throw new Error('Agent is required to fetch workflow types');
          }

          return await apiClient.get(`/api/client/workflows/types`, { agent });
        } catch (error) {
          console.error('Failed to fetch workflow types:', error);
          throw error;
        }
      },

      fetchActivityEvents: async (workflowId) => {
        try {
          if (!workflowId) {
            throw new Error('Workflow ID is required');
          }

          return await apiClient.get('/api/client/workflows/events', { workflowId });
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
          if (logLevel !== null && logLevel !== undefined && logLevel !== '') {
            // Ensure logLevel is a valid number
            const numericLogLevel = typeof logLevel === 'number' ? logLevel : Number(logLevel);
            if (!isNaN(numericLogLevel)) {
              queryParams.logLevel = numericLogLevel;
            }
          }
          return await apiClient.get('/api/client/logs/workflow', queryParams);
        } catch (error) {
          console.error('Failed to fetch workflow run logs:', error);
          throw error;
        }
      },

      executeWorkflowCancelAction: async (workflowId, force = false) => {
        try {
          return await apiClient.post('/api/client/workflows/cancel', null, { workflowId, force });
        } catch (error) {
          console.error('Failed to execute workflow cancel action:', error);
          throw error;
        }
      },

      startNewWorkflow: async (workflowType, agentName, parameters, flowId = null, queueName = null, workflowIdPostfix = null) => {
        try {
          const payload = {
            workflowType,
            agentName: agentName,
            parameters,
            WorkflowIdPostfix: flowId,
            queueName
          };

          if (workflowIdPostfix != null && workflowIdPostfix !== '') {
            payload.workflowIdPostfix = workflowIdPostfix;
          }

          // Only include optional fields if they have values
          if (!flowId) delete payload.workflowId;
          if (!queueName) delete payload.queueName;

          return await apiClient.post('/api/client/workflows', payload);
        } catch (error) {
          console.error('Failed to start workflow:', error);
          throw error;
        }
      },

      streamActivityEvents: async (workflowId, onEventReceived, abortSignal = null) => {
        try {
          if (!workflowId) {
            throw new Error('Workflow ID is required');
          }

          console.log('[WorkflowAPI] Starting activity event stream for:', workflowId);
          await apiClient.stream('/api/client/workflows/events/stream', onEventReceived, { workflowId }, abortSignal);
          console.log('[WorkflowAPI] Activity event stream completed');
        } catch (error) {
          console.error('[WorkflowAPI] Failed to establish event stream:', error);
          throw error;
        }
      }
    };
  }, [apiClient]);
};

