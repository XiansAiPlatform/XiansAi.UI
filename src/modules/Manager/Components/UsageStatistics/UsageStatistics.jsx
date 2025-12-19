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
  const { getUsageStatistics, getUsersWithUsage } = useUsageStatisticsApi();

  // Filter state
  const [usageType, setUsageType] = useState('tokens');
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

  // Fetch users (admin only)
  useEffect(() => {
    if (isAdmin) {
      const fetchUsers = async () => {
        try {
          const result = await getUsersWithUsage();
          setUsersData(result.users || []);
        } catch (err) {
          console.error('Failed to fetch users:', err);
        }
      };
      fetchUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  // Fetch agents list (without filters) to populate dropdown
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const { startDate, endDate } = getDateRange();
        const params = {
          type: usageType,
          startDate,
          endDate,
          groupBy,
        };
        // Don't apply agent filter when fetching the list
        const data = await getUsageStatistics(params);
        if (data?.agentBreakdown) {
          const agents = data.agentBreakdown.map(agent => ({
            agentName: agent.agentName?.trim() || agent.agentName,
          }));
          setAgentsData(agents);
          
          // If selected agent is not in the list but was previously selected, keep it
          // This handles the case where filtering by agent makes it disappear from breakdown
          if (selectedAgent !== 'all' && !agents.find(a => a.agentName === selectedAgent)) {
            // Agent might have been trimmed, try to find a match
            const trimmedSelected = selectedAgent.trim();
            if (!agents.find(a => a.agentName === trimmedSelected)) {
              // Add the selected agent to the list if it's not there
              setAgentsData([...agents, { agentName: trimmedSelected }]);
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch agents:', err);
      }
    };
    fetchAgents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usageType, dateRange, groupBy]);

  // Fetch statistics
  useEffect(() => {
    const fetchStatistics = async () => {
      setLoading(true);
      setError(null);

      try {
        const { startDate, endDate } = getDateRange();
        const params = {
          type: usageType,
          startDate,
          endDate,
          groupBy,
        };

        // Add user filter for admins
        if (isAdmin && selectedUser !== 'all') {
          params.userId = selectedUser;
        }

        // Add agent filter (trim to handle any whitespace)
        if (selectedAgent !== 'all') {
          params.agentName = selectedAgent.trim();
        }

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
  }, [usageType, selectedUser, selectedAgent, dateRange, groupBy, isAdmin]);

  // Auto-select Agent breakdown tab for response time
  useEffect(() => {
    if (usageType === 'responsetime' && breakdownTab === 0) {
      setBreakdownTab(1);
    }
  }, [usageType, breakdownTab]);

  // Map usage type to tab index
  const getTabIndex = (type) => {
    switch (type) {
      case 'tokens': return 0;
      case 'messages': return 1;
      case 'responsetime': return 2;
      default: return 0;
    }
  };

  // Map tab index to usage type
  const getUsageTypeFromTab = (index) => {
    switch (index) {
      case 0: return 'tokens';
      case 1: return 'messages';
      case 2: return 'responsetime';
      default: return 'tokens';
    }
  };

  const handleTabChange = (event, newValue) => {
    const newUsageType = getUsageTypeFromTab(newValue);
    setUsageType(newUsageType);
    // For response time, default to Agent breakdown tab
    if (newUsageType === 'responsetime') {
      setBreakdownTab(1);
    }
  };

  return (
    <PageLayout title="Usage Statistics">
      <Box className="usage-statistics-container">
        {/* Tabs */}
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
            value={getTabIndex(usageType)}
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
            <Tab label="Tokens" />
            <Tab label="Messages" />
            <Tab label="Response Time" />
          </Tabs>
        </Paper>

        {/* Filters */}
        <UsageFilters
          selectedUser={selectedUser}
          setSelectedUser={setSelectedUser}
          selectedAgent={selectedAgent}
          setSelectedAgent={setSelectedAgent}
          dateRange={dateRange}
          setDateRange={setDateRange}
          groupBy={groupBy}
          setGroupBy={setGroupBy}
          usersData={usersData}
          agentsData={agentsData}
          isAdmin={isAdmin}
        />

        {/* Loading State */}
        {loading && (
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
        {!loading && !error && statisticsData && (
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
                usageType={usageType}
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
                value={usageType === 'responsetime' ? 1 : breakdownTab}
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
                {usageType !== 'responsetime' && <Tab label="Breakdown by User" />}
                <Tab label="Breakdown by Agent" />
              </Tabs>
              
              <Box sx={{ p: 3 }}>
                {usageType !== 'responsetime' && breakdownTab === 0 && (
                  <UserBreakdownTable 
                    data={statisticsData}
                    usageType={usageType}
                  />
                )}
                {(usageType === 'responsetime' || breakdownTab === 1) && (
                  <AgentBreakdownTable 
                    data={statisticsData}
                    usageType={usageType}
                  />
                )}
              </Box>
            </Paper>
          </>
        )}

        {/* Empty State */}
        {!loading && !error && !statisticsData && (
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

