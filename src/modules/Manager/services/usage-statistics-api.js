import { useApiClient } from './api-client';

/**
 * Custom hook for Usage Statistics API endpoints
 * Provides methods to fetch token/message usage statistics
 */
export const useUsageStatisticsApi = () => {
  const client = useApiClient();

  /**
   * Get usage statistics for a specific type (tokens, messages, etc.)
   * @param {Object} params - Query parameters
   * @param {string} params.type - Usage type ('tokens', 'messages', 'apicalls', etc.)
   * @param {string} params.startDate - Start date (ISO 8601 format)
   * @param {string} params.endDate - End date (ISO 8601 format)
   * @param {string} [params.userId] - Optional: filter by user ID (admin only)
   * @param {string} [params.agentName] - Optional: filter by agent name
   * @param {string} [params.tenantId] - Optional: filter by tenant (SysAdmin only)
   * @param {string} [params.groupBy='day'] - Time grouping: 'day', 'week', 'month'
   * @returns {Promise<Object>} Usage statistics response
   */
  const getUsageStatistics = async (params) => {
    const { type, startDate, endDate, userId, agentName, tenantId, groupBy = 'day' } = params;
    
    const queryParams = new URLSearchParams({
      type,
      startDate,
      endDate,
      groupBy,
    });

    if (userId && userId !== 'all') {
      queryParams.append('userId', userId);
    }

    if (agentName && agentName !== 'all') {
      queryParams.append('agentName', agentName);
    }

    if (tenantId) {
      queryParams.append('tenantId', tenantId);
    }

    return client.get(`/api/client/usage/statistics?${queryParams.toString()}`);
  };

  /**
   * Get list of users with usage data (admin only)
   * @param {string} [tenantId] - Optional: filter by tenant (SysAdmin only)
   * @returns {Promise<Object>} List of users with usage
   */
  const getUsersWithUsage = async (tenantId) => {
    const queryParams = new URLSearchParams();
    
    if (tenantId) {
      queryParams.append('tenantId', tenantId);
    }

    const endpoint = queryParams.toString() 
      ? `/api/client/usage/statistics/users?${queryParams.toString()}`
      : '/api/client/usage/statistics/users';

    return client.get(endpoint);
  };

  return {
    getUsageStatistics,
    getUsersWithUsage,
  };
};


