/**
 * Service layer for messaging-related API calls
 * Centralizes all messaging API calls in one place
 */
class MessagingService {
    constructor(apiClient) {
        this.apiClient = apiClient;
    }

    /**
     * Get all threads for a workflow
     * @param {string} workflowId - ID of the workflow
     * @returns {Promise<Array>} - List of threads
     */
    async getThreads(workflowId) {
        try {
            const response = await this.apiClient.get(`/api/messaging/workflows/${workflowId}/threads`);
            return response.data || [];
        } catch (error) {
            console.error('Error fetching threads:', error);
            throw error;
        }
    }

    /**
     * Get messages for a thread with pagination
     * @param {string} threadId - ID of the thread
     * @param {number} page - Page number (1-based)
     * @param {number} pageSize - Number of messages per page
     * @returns {Promise<Array>} - List of messages
     */
    async getThreadMessages(threadId, page = 1, pageSize = 15) {
        try {
            const response = await this.apiClient.get(`/api/messaging/threads/${threadId}/messages`, {
                params: { page, pageSize }
            });
            return response.data || [];
        } catch (error) {
            console.error('Error fetching thread messages:', error);
            throw error;
        }
    }

    /**
     * Send a new message in a thread
     * @param {string} threadId - ID of the thread
     * @param {Object} messageData - Message data to send
     * @returns {Promise<Object>} - Created message
     */
    async sendMessage(threadId, messageData) {
        try {
            const response = await this.apiClient.post(`/api/messaging/threads/${threadId}/messages`, messageData);
            return response.data;
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    }

    /**
     * Create a new thread
     * @param {string} workflowId - ID of the workflow
     * @param {Object} threadData - Thread data to create
     * @returns {Promise<Object>} - Created thread
     */
    async createThread(workflowId, threadData) {
        try {
            const response = await this.apiClient.post(`/api/messaging/workflows/${workflowId}/threads`, threadData);
            return response.data;
        } catch (error) {
            console.error('Error creating thread:', error);
            throw error;
        }
    }

    /**
     * Get a single thread by ID
     * @param {string} threadId - ID of the thread
     * @returns {Promise<Object>} - Thread details
     */
    async getThread(threadId) {
        try {
            const response = await this.apiClient.get(`/api/messaging/threads/${threadId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching thread:', error);
            throw error;
        }
    }
}

export default MessagingService; 