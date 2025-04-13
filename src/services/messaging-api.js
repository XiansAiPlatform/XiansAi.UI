import { useApiClient } from './api-client';
import { useMemo } from 'react';

export const useMessagingApi = () => {
  const apiClient = useApiClient();

  return useMemo(() => {
    return {

      getThreads: async (workflowId, page = null, pageSize = null) => {
        try {
          console.log('Fetching threads for workflowId:', workflowId);
          const params = { workflowId };
          if (page !== null) params.page = page;
          if (pageSize !== null) params.pageSize = pageSize;
          
          return await apiClient.get('/api/client/messaging/threads', params);
        } catch (error) {
          console.error('Error fetching threads:', error);
          throw error;
        }
      },

      getThreadMessages: async (threadId, page = null, pageSize = null) => {
        try {
          const params = {};
          if (page !== null) params.page = page;
          if (pageSize !== null) params.pageSize = pageSize;
          
          return await apiClient.get(`/api/client/messaging/threads/${threadId}/messages`, params);
        } catch (error) {
          console.error('Error fetching thread messages:', error);
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

      sendMessage: async (workflowId, participantId, content, metadata = null) => {
        try {
          const payload = {
            participantId,
            content,
            workflowId,
            metadata
          };
          
          const response = await apiClient.post('/api/client/messaging/inbound', payload);
          return response.value;
        } catch (error) {
          console.error('Error sending message:', error);
          throw error;
        }
      },

    };
  }, [apiClient]);
};
