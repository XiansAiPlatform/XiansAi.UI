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

      /**
       * Sends a message to an agent workflow.
       * @param {Object} options - Message options
       * @param {string} options.agent - Agent name
       * @param {string} options.workflowType - Type of workflow  
       * @param {string|null} options.workflowId - Specific workflow instance ID (null for singleton)
       * @param {string} options.participantId - ID of the message sender
       * @param {string} options.content - Message text content
       * @param {Object|null} options.metadata - Additional message data
       * @param {'chat'|'data'} options.type - Message type (defaults to 'chat')
       * @param {string|null} options.threadId - Existing thread ID (null for new thread)
       * @returns {Promise<string>} Thread ID
       */
      sendMessage: async ({ 
        agent, 
        workflowType, 
        workflowId, 
        participantId, 
        content, 
        metadata = null, 
        type = 'chat',
        threadId = null 
      }) => {
        try {
          const payload = {
            agent,
            workflowType,
            workflowId,
            participantId,
            text: content,
            data: metadata
          };
          
          // Only include threadId if it exists
          if (threadId) {
            payload.threadId = threadId;
          }
          
          // Choose endpoint based on message type
          const endpoint = type === 'data' 
            ? '/api/client/messaging/inbound/data'
            : '/api/client/messaging/inbound/chat';
          
          const response = await apiClient.post(endpoint, payload);
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
