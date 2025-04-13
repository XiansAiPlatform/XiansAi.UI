import { useMemo } from 'react';
import { useApiClient } from '../../../services/api-client';
import MessagingService from '../services/MessagingService';

/**
 * Custom hook to provide messaging API functions
 * @returns {Object} - Object containing messaging API methods
 */
export const useMessagingApi = () => {
    const apiClient = useApiClient();
    
    // Create a memoized instance of the messaging service
    const messagingService = useMemo(() => 
        new MessagingService(apiClient),
        [apiClient]
    );
    
    return {
        /**
         * Get all threads for a workflow
         * @param {string} workflowId - ID of the workflow
         * @returns {Promise<Array>} - List of threads
         */
        getThreads: (workflowId) => 
            messagingService.getThreads(workflowId),
        
        /**
         * Get messages for a thread with pagination
         * @param {string} threadId - ID of the thread
         * @param {number} page - Page number (1-based)
         * @param {number} pageSize - Number of messages per page
         * @returns {Promise<Array>} - List of messages
         */
        getThreadMessages: (threadId, page, pageSize) => 
            messagingService.getThreadMessages(threadId, page, pageSize),
            
        /**
         * Send a new message in a thread
         * @param {string} threadId - ID of the thread
         * @param {Object} messageData - Message data to send
         * @returns {Promise<Object>} - Created message
         */
        sendMessage: (threadId, messageData) => 
            messagingService.sendMessage(threadId, messageData),
            
        /**
         * Create a new thread
         * @param {string} workflowId - ID of the workflow
         * @param {Object} threadData - Thread data to create
         * @returns {Promise<Object>} - Created thread
         */
        createThread: (workflowId, threadData) => 
            messagingService.createThread(workflowId, threadData),
            
        /**
         * Get a single thread by ID
         * @param {string} threadId - ID of the thread
         * @returns {Promise<Object>} - Thread details
         */
        getThread: (threadId) => 
            messagingService.getThread(threadId)
    };
}; 