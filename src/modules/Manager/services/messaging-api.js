import { useApiClient } from './api-client';
import { useMemo } from 'react';

export const useMessagingApi = () => {
  const apiClient = useApiClient();

  return useMemo(() => {
    return {

      getThreads: async (agent, page = null, pageSize = null) => {
        try {
          console.log('Fetching threads for agent:', agent);
          const params = { agent };
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

      sendData: async (threadId, agent, workflowType, workflowId, participantId, content, metadata = null) => {
        try {
          const payload = {
            threadId,
            sourceAgent: agent,
            sourceWorkflowType: workflowType,
            sourceWorkflowId: workflowId,
            participantId,
            text: content,
            data: metadata
          };
          
          if (!threadId) {
            delete payload.threadId;
          }
          
          const response = await apiClient.post('/api/client/messaging/inbound/data', payload);
          return response.value;
        } catch (error) {
          console.error('Error sending message:', error);
          throw error;
        }
      },

      sendMessage: async (threadId, agent, workflowType, workflowId, participantId, content, metadata = null) => {
        try {
          const payload = {
            threadId,
            sourceAgent: agent,
            sourceWorkflowType: workflowType,
            sourceWorkflowId: workflowId,
            participantId,
            text: content,
            data: metadata
          };
          
          if (!threadId) {
            delete payload.threadId;
          }
          
          const response = await apiClient.post('/api/client/messaging/inbound/chat', payload);
          return response.value;
        } catch (error) {
          console.error('Error sending message:', error);
          throw error;
        }
      },

      deleteThread: async (threadId) => {
        try {
          return await apiClient.delete(`/api/client/messaging/threads/${threadId}`);
        } catch (error) {
          console.error('Error deleting thread:', error);
          throw error;
        }
      }

    };
  }, [apiClient]);
};
