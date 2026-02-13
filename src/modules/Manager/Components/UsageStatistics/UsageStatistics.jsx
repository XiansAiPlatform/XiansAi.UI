import React, { useState, useEffect } from 'react';
import { Box, Paper, CircularProgress, Alert, Tabs, Tab } from '@mui/material';
import PageLayout from '../Common/PageLayout';
import UsageFilters from './UsageFilters';
import UsageChart from './UsageChart';
import UserBreakdownTable from './UserBreakdownTable';
import AgentBreakdownTable from './AgentBreakdownTable';
import { useUsageStatisticsApi } from '../../services/usage-statistics-api';
import { useTenant } from '../../contexts/TenantContext';
import './UsageStatistics.css';

const UsageStatistics = () => {
  const { isAdmin } = useTenant();
  const { getAvailableMetrics, getUsageStatistics, getUsersWithUsage } = useUsageStatisticsApi();

  // Filter state
  const [availableMetrics, setAvailableMetrics] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedMetricType, setSelectedMetricType] = useState(null);
  const [selectedUser, setSelectedUser] = useState('all');
  const [selectedAgent, setSelectedAgent] = useState('all');
  const [dateRange, setDateRange] = useState('7days');
  const [groupBy, setGroupBy] = useState('day');
  const [breakdownTab, setBreakdownTab] = useState(0);
  
  // Data state
  const [statisticsData, setStatisticsData] = useState(null);
  const [usersData, setUsersData] = useState([]);
  const [agentsData, setAgentsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Calculate date range
  const getDateRange = () => {
    const endDate = new Date();
    let startDate = new Date();

    switch (dateRange) {
      case '7days':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30days':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90days':
        startDate.setDate(startDate.getDate() - 90);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
    }

    return {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };
  };

  // Fetch available metrics on mount
  useEffect(() => {
    const fetchMetrics = async () => {
      setMetricsLoading(true);
      try {
        const metrics = await getAvailableMetrics();
        setAvailableMetrics(metrics);
        
        // Auto-select first category and first metric type
        if (metrics.categories && metrics.categories.length > 0) {
          const firstCategory = metrics.categories[0];
          setSelectedCategory(firstCategory.categoryId);
          
          if (firstCategory.metrics && firstCategory.metrics.length > 0) {
            setSelectedMetricType(firstCategory.metrics[0].type);
          }
        }
      } catch (err) {
        console.error('Failed to fetch available metrics:', err);
        setError('Failed to load available metrics');
      } finally {
        setMetricsLoading(false);
      }
    };

    fetchMetrics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch users (admin only)
  useEffect(() => {
    if (isAdmin) {
      const fetchUsers = async () => {
        try {
          const result = await getUsersWithUsage();
          setUsersData(result.users || []);
        } catch (err) {
          console.error('Failed to fetch users:', err);
          setUsersData([]);
        }
      };
      fetchUsers();
    } else {
      // Reset user selection for non-admin users
      setSelectedUser('all');
      setUsersData([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  // Extract agents from statistics data (no separate API call needed)
  useEffect(() => {
    if (statisticsData?.agentBreakdown) {
      const agents = statisticsData.agentBreakdown.map(agent => ({
        agentName: agent.agentName?.trim() || agent.agentName,
      }));
      setAgentsData(agents);
      
      // If selected agent is not in the list but was previously selected, keep it
      if (selectedAgent !== 'all' && !agents.find(a => a.agentName === selectedAgent)) {
        const trimmedSelected = selectedAgent.trim();
        if (!agents.find(a => a.agentName === trimmedSelected)) {
          setAgentsData([...agents, { agentName: trimmedSelected }]);
        }
      }
    }
  }, [statisticsData, selectedAgent]);

  // Fetch statistics
  useEffect(() => {
    const fetchStatistics = async () => {
      // Don't fetch if we haven't selected both category and metric type
      if (!selectedCategory || !selectedMetricType) return;

      setLoading(true);
      setError(null);

      try {
        const { startDate, endDate } = getDateRange();
        const params = {
          category: selectedCategory,
          metricType: selectedMetricType,
          startDate,
          endDate,
          groupBy,
        };

        // Add user filter for admins
        if (isAdmin && selectedUser !== 'all') {
          params.userId = selectedUser;
          console.log('Adding userId to params:', selectedUser);
        }

        // Add agent filter (trim to handle any whitespace)
        if (selectedAgent !== 'all') {
          params.agentName = selectedAgent.trim();
        }

        console.log('Fetching statistics with params:', params);
        console.log('Current selectedUser:', selectedUser);
        const data = await getUsageStatistics(params);
        setStatisticsData(data);
      } catch (err) {
        console.error('Failed to fetch statistics:', err);
        setError(err.message || 'Failed to load usage statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, selectedMetricType, selectedUser, selectedAgent, dateRange, groupBy, isAdmin]);

  // Get current category index for tabs
  const getCurrentCategoryIndex = () => {
    if (!availableMetrics?.categories || !selectedCategory) return 0;
    return availableMetrics.categories.findIndex(cat => cat.categoryId === selectedCategory);
  };

  // Get metrics for the currently selected category
  const getCurrentCategoryMetrics = () => {
    if (!availableMetrics?.categories || !selectedCategory) return [];
    const category = availableMetrics.categories.find(cat => cat.categoryId === selectedCategory);
    return category?.metrics || [];
  };

  const handleTabChange = (event, newValue) => {
    if (!availableMetrics?.categories) return;
    
    const newCategory = availableMetrics.categories[newValue];
    setSelectedCategory(newCategory.categoryId);
    
    // Auto-select first metric type in the category
    if (newCategory.metrics && newCategory.metrics.length > 0) {
      setSelectedMetricType(newCategory.metrics[0].type);
    }
  };

  return (
    <PageLayout title="Usage Statistics">
      <Box className="usage-statistics-container">
        {/* Tabs - Dynamic from available metrics */}
        {!metricsLoading && availableMetrics?.categories && (
          <Paper 
            elevation={0} 
            sx={{ 
              mb: 3,
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-paper)',
            }}
          >
            <Tabs
              value={getCurrentCategoryIndex()}
              onChange={handleTabChange}
              sx={{
                borderBottom: '1px solid var(--border-color)',
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 500,
                  minHeight: 48,
                },
                '& .Mui-selected': {
                  color: 'var(--primary-color, #1976d2)',
                },
              }}
            >
              {availableMetrics.categories.map((category) => (
                <Tab 
                  key={category.categoryId}
                  label={category.categoryName}
                />
              ))}
            </Tabs>
          </Paper>
        )}

        {/* Filters */}
        {!metricsLoading && (
          <UsageFilters
            selectedUser={selectedUser}
            setSelectedUser={setSelectedUser}
            selectedAgent={selectedAgent}
            setSelectedAgent={setSelectedAgent}
            selectedMetricType={selectedMetricType}
            setSelectedMetricType={setSelectedMetricType}
            currentCategoryMetrics={getCurrentCategoryMetrics()}
            dateRange={dateRange}
            setDateRange={setDateRange}
            groupBy={groupBy}
            setGroupBy={setGroupBy}
            usersData={usersData}
            agentsData={agentsData}
            isAdmin={isAdmin}
          />
        )}

        {/* Loading State */}
        {(loading || metricsLoading) && (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
            <CircularProgress />
          </Box>
        )}

        {/* Error State */}
        {error && !loading && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Statistics Display */}
        {!loading && !metricsLoading && !error && statisticsData && (
          <>
            {/* Chart */}
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                mb: 3,
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-paper)',
              }}
            >
              <UsageChart 
                data={statisticsData}
                groupBy={groupBy}
              />
            </Paper>

            {/* Breakdown Tables with Tabs */}
            <Paper 
              elevation={0} 
              sx={{ 
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-paper)',
              }}
            >
              <Tabs
                value={breakdownTab}
                onChange={(e, newValue) => setBreakdownTab(newValue)}
                sx={{
                  borderBottom: '1px solid var(--border-color)',
                  px: 3,
                  pt: 2,
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontWeight: 500,
                    minHeight: 48,
                  },
                  '& .Mui-selected': {
                    color: 'var(--primary-color, #1976d2)',
                  },
                }}
              >
                <Tab label="Breakdown by User" />
                <Tab label="Breakdown by Agent" />
              </Tabs>
              
              <Box sx={{ p: 3 }}>
                {breakdownTab === 0 && (
                  <UserBreakdownTable 
                    data={statisticsData}
                  />
                )}
                {breakdownTab === 1 && (
                  <AgentBreakdownTable 
                    data={statisticsData}
                  />
                )}
              </Box>
            </Paper>
          </>
        )}

        {/* Empty State */}
        {!loading && !metricsLoading && !error && !statisticsData && (
          <Paper 
            elevation={0} 
            sx={{ 
              p: 4, 
              textAlign: 'center',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-color)',
            }}
          >
            No usage data available for the selected period.
          </Paper>
        )}
      </Box>
    </PageLayout>
  );
};

export default UsageStatistics;

