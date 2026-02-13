import { useApiClient } from './api-client';

/**
 * Custom hook for Usage Statistics API endpoints
 * Provides methods to fetch flexible usage statistics based on category and metric type
 */
export const useUsageStatisticsApi = () => {
  const client = useApiClient();

  /**
   * Get available metric categories and types
   * @returns {Promise<Object>} Available metrics response with categories
   */
  const getAvailableMetrics = async () => {
    return client.get('/api/client/usage/statistics/available-metrics');
  };

  /**
   * Get usage statistics for a specific category and metric type
   * @param {Object} params - Query parameters
   * @param {string} params.category - Metric category (e.g., 'tokens', 'activity')
   * @param {string} params.metricType - Specific metric type (e.g., 'total_tokens', 'message_count')
   * @param {string} params.startDate - Start date (ISO 8601 format)
   * @param {string} params.endDate - End date (ISO 8601 format)
   * @param {string} [params.userId] - Optional: filter by user ID (admin only)
   * @param {string} [params.agentName] - Optional: filter by agent name
   * @param {string} [params.tenantId] - Optional: filter by tenant (SysAdmin only)
   * @param {string} [params.groupBy='day'] - Time grouping: 'day', 'week', 'month'
   * @returns {Promise<Object>} Usage statistics response
   */
  const getUsageStatistics = async (params) => {
    const { category, metricType, startDate, endDate, userId, agentName, tenantId, groupBy = 'day' } = params;
    
    const queryParams = new URLSearchParams({
      category,
      metricType,
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
    getAvailableMetrics,
    getUsageStatistics,
    getUsersWithUsage,
  };
};


