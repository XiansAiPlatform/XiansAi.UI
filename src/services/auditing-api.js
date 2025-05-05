import { useApiClient } from './api-client';
import { useMemo } from 'react';

export const useAuditingApi = () => {
  const apiClient = useApiClient();

  return useMemo(() => {
    return {
      getParticipants: async (agent, page = null, pageSize = null) => {
        try {
          console.log('Fetching participants for agent:', agent);
          const params = {};
          if (page !== null) params.page = page;
          if (pageSize !== null) params.pageSize = pageSize;
          
          // Returns a paginated result with: 
          // { TotalCount, Page, PageSize, TotalPages, Participants: [] }
          return await apiClient.get(`/api/client/auditing/agents/${agent}/participants`, params);
        } catch (error) {
          console.error('Error fetching participants:', error);
          throw error;
        }
      },
      
      getAgents: async () => {
        try {
          return await apiClient.get('/api/client/agents/all');
        } catch (error) {
          console.error('Error fetching agents:', error);
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

      getWorkflowTypes: async (agent, participantId = null) => {
        try {
          const url = `/api/client/auditing/agents/${agent}/workflow-types`;
          const params = {};
          
          if (participantId) params.participantId = participantId;
          
          console.log('Fetching workflow types for agent:', agent, 'participant:', participantId);
          return await apiClient.get(url, params);
        } catch (error) {
          console.error('Error fetching workflow types:', error);
          throw error;
        }
      },

      getWorkflowIds: async (agent, workflowType, participantId = null) => {
        try {
          console.log(`Fetching workflow IDs for agent: ${agent}, workflow type: ${workflowType}, participantId: ${participantId}`);
          const url = `/api/client/auditing/agents/${agent}/workflow-types/${workflowType}/workflow-ids`;
          const params = {};
          
          if (participantId) params.participantId = participantId;
          
          return await apiClient.get(url, params);
        } catch (error) {
          console.error('Error fetching workflow IDs:', error);
          throw error;
        }
      },

      getWorkflowLogs: async (agent, options = {}) => {
        try {
          const {
            participantId = null,
            workflowType = null,
            workflowId = null,
            logLevel = null,
            page = 1,
            pageSize = 20
          } = options;

          const params = { agent };
          
          if (participantId) params.participantId = participantId;
          if (workflowType) params.workflowType = workflowType;
          if (workflowId) params.workflowId = workflowId;
          if (logLevel !== null && logLevel !== '') params.logLevel = logLevel;
          params.page = page;
          params.pageSize = pageSize;
          
          return await apiClient.get('/api/client/auditing/logs', params);
        } catch (error) {
          console.error('Error fetching workflow logs:', error);
          throw error;
        }
      }
    };
  }, [apiClient]);
}; 