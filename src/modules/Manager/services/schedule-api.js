import { useMemo } from 'react';
import { useApiClient } from './api-client';

/**
 * Custom hook for schedule management API operations
 */
export const useScheduleApi = () => {
  const apiClient = useApiClient();

  return useMemo(() => {
    return {
      /**
       * Retrieves schedules with optional filtering
       * @param {Object} filters - Filter options
       * @param {string} filters.agentName - Filter by agent name
       * @param {string} filters.workflowType - Filter by workflow type
       * @param {string} filters.status - Filter by schedule status
       * @param {string} filters.searchTerm - Search term for description/name
       * @param {number} filters.pageSize - Number of items per page
       * @param {string} filters.pageToken - Page token for pagination
       * @returns {Promise<Array>} Array of schedule objects
       */
      getSchedules: async (filters = {}) => {
        try {
          const queryParams = {};
          
          Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
              queryParams[key] = value;
            }
          });
          
          return await apiClient.get('/api/client/schedules', queryParams);
        } catch (error) {
          console.error('Failed to fetch schedules:', error);
          throw error;
        }
      },

      /**
       * Gets upcoming runs for a specific schedule
       * @param {string} scheduleId - Schedule identifier
       * @param {number} count - Number of upcoming runs to retrieve (default: 10)
       * @returns {Promise<Array>} Array of upcoming run objects
       */
      getUpcomingRuns: async (scheduleId, count = 10) => {
        try {
          const queryParams = { count };
          return await apiClient.get(`/api/client/schedules/${scheduleId}/upcoming-runs`, queryParams);
        } catch (error) {
          console.error(`Failed to fetch upcoming runs for schedule ${scheduleId}:`, error);
          throw error;
        }
      },

      /**
       * Gets execution history for a schedule
       * @param {string} scheduleId - Schedule identifier
       * @param {number} count - Number of history records to retrieve (default: 50)
       * @returns {Promise<Array>} Array of historical run objects
       */
      getScheduleHistory: async (scheduleId, count = 50) => {
        try {
          const queryParams = { count };
          return await apiClient.get(`/api/client/schedules/${scheduleId}/history`, queryParams);
        } catch (error) {
          console.error(`Failed to fetch schedule history for ${scheduleId}:`, error);
          throw error;
        }
      },

      /**
       * Gets detailed information about a specific schedule
       * @param {string} scheduleId - Schedule identifier
       * @returns {Promise<Object>} Schedule object with detailed information
       */
      getScheduleById: async (scheduleId) => {
        try {
          return await apiClient.get(`/api/client/schedules/${scheduleId}`);
        } catch (error) {
          console.error(`Failed to fetch schedule ${scheduleId}:`, error);
          throw error;
        }
      },

      /**
       * Fetches all schedules and formats them for display
       * @param {Object} options - Options for fetching schedules
       * @returns {Promise<Array>} Formatted schedule list
       */
      fetchScheduleList: async (options = {}) => {
        try {
          const {
            agentFilter = null,
            workflowFilter = null,
            statusFilter = 'all',
            searchTerm = null,
            pageSize = 20,
            pageToken = null
          } = options;

          const filters = {};

          if (agentFilter) {
            filters.agentName = agentFilter;
          }

          if (workflowFilter) {
            filters.workflowType = workflowFilter;
          }

          if (statusFilter && statusFilter !== 'all') {
            filters.status = statusFilter;
          }

          if (searchTerm) {
            filters.searchTerm = searchTerm;
          }

          if (pageSize) {
            filters.pageSize = pageSize;
          }

          if (pageToken) {
            filters.pageToken = pageToken;
          }

          const schedules = await this.getSchedules(filters);
          
          // Format the schedules for display
          return schedules.map(schedule => ({
            ...schedule,
            formattedNextRunTime: new Date(schedule.nextRunTime).toLocaleString(),
            formattedCreatedAt: new Date(schedule.createdAt).toLocaleString(),
            formattedLastRunTime: schedule.lastRunTime ? new Date(schedule.lastRunTime).toLocaleString() : 'Never'
          }));
        } catch (error) {
          console.error('Failed to fetch schedule list:', error);
          throw error;
        }
      },

      /**
       * Gets schedule statistics for dashboard
       * @returns {Promise<Object>} Schedule statistics
       */
      getScheduleStats: async () => {
        try {
          const allSchedules = await this.getSchedules();
          
          const stats = {
            total: allSchedules.length,
            active: allSchedules.filter(s => s.status === 'Active').length,
            paused: allSchedules.filter(s => s.status === 'Paused').length,
            failed: allSchedules.filter(s => s.status === 'Failed').length,
            completed: allSchedules.filter(s => s.status === 'Completed').length
          };

          return stats;
        } catch (error) {
          console.error('Failed to fetch schedule statistics:', error);
          throw error;
        }
      }
    };
  }, [apiClient]);
};

/**
 * Legacy export for backwards compatibility
 * @deprecated Use useScheduleApi hook instead
 */
export const scheduleService = {
  async getSchedules(filters = {}) {
    // This is a fallback implementation for direct usage outside of React components
    // It should generally be avoided in favor of the hook-based approach
    const apiBaseUrl = window.location.origin;
    
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });
    
    const response = await fetch(`${apiBaseUrl}/api/client/schedules?${queryParams}`, {
      headers: {
        'Content-Type': 'application/json',
        // Note: In a real implementation, you'd need to handle authentication
        // This is a simplified version for demo purposes
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  async getUpcomingRuns(scheduleId, count = 10) {
    const apiBaseUrl = window.location.origin;
    const response = await fetch(`${apiBaseUrl}/api/client/schedules/${scheduleId}/upcoming-runs?count=${count}`, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  async getScheduleById(scheduleId) {
    const apiBaseUrl = window.location.origin;
    const response = await fetch(`${apiBaseUrl}/api/client/schedules/${scheduleId}`, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }
};