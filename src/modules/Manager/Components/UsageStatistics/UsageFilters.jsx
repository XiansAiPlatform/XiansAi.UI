import React from 'react';
import {
  Box,
  FormControl,
  Select,
  MenuItem,
  Typography,
  Paper,
} from '@mui/material';

const UsageFilters = ({
  selectedUser,
  setSelectedUser,
  selectedAgent,
  setSelectedAgent,
  selectedMetricType,
  setSelectedMetricType,
  currentCategoryMetrics,
  dateRange,
  setDateRange,
  groupBy,
  setGroupBy,
  usersData,
  agentsData,
  isAdmin,
}) => {
  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 2, 
        mb: 3,
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
        backgroundColor: 'var(--bg-paper)',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          alignItems: 'center',
        }}
      >
        {/* User Filter (Admin Only) */}
        {isAdmin && (
          <Box sx={{ minWidth: 200 }}>
            <Typography variant="caption" sx={{ mb: 0.5, display: 'block', color: 'text.secondary' }}>
              User
            </Typography>
            <FormControl fullWidth size="small">
              <Select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'var(--border-color)',
                  },
                }}
              >
                <MenuItem value="all">All Users</MenuItem>
                {usersData.map((user) => (
                  <MenuItem key={user.userId} value={user.userId}>
                    {user.userName || user.userId}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        )}

        {/* Agent Filter */}
        <Box sx={{ minWidth: 200 }}>
          <Typography variant="caption" sx={{ mb: 0.5, display: 'block', color: 'text.secondary' }}>
            Agent
          </Typography>
          <FormControl fullWidth size="small">
            <Select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'var(--border-color)',
                },
              }}
            >
              <MenuItem value="all">All Agents</MenuItem>
              {agentsData.map((agent) => (
                <MenuItem key={agent.agentName} value={agent.agentName}>
                  {agent.agentName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Metric Type Filter */}
        <Box sx={{ minWidth: 200 }}>
          <Typography variant="caption" sx={{ mb: 0.5, display: 'block', color: 'text.secondary' }}>
            Metric Type
          </Typography>
          <FormControl fullWidth size="small">
            <Select
              value={selectedMetricType || ''}
              onChange={(e) => setSelectedMetricType(e.target.value)}
              disabled={!currentCategoryMetrics || currentCategoryMetrics.length === 0}
              sx={{
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'var(--border-color)',
                },
              }}
            >
              {currentCategoryMetrics?.map((metric) => (
                <MenuItem key={metric.type} value={metric.type}>
                  {metric.displayName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Date Range Filter */}
        <Box sx={{ minWidth: 150 }}>
          <Typography variant="caption" sx={{ mb: 0.5, display: 'block', color: 'text.secondary' }}>
            Date Range
          </Typography>
          <FormControl fullWidth size="small">
            <Select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'var(--border-color)',
                },
              }}
            >
              <MenuItem value="7days">Last 7 days</MenuItem>
              <MenuItem value="30days">Last 30 days</MenuItem>
              <MenuItem value="90days">Last 90 days</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Group By Filter */}
        <Box sx={{ minWidth: 120 }}>
          <Typography variant="caption" sx={{ mb: 0.5, display: 'block', color: 'text.secondary' }}>
            Group By
          </Typography>
          <FormControl fullWidth size="small">
            <Select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'var(--border-color)',
                },
              }}
            >
              <MenuItem value="hour">Hour</MenuItem>
              <MenuItem value="day">Day</MenuItem>
              <MenuItem value="week">Week</MenuItem>
              <MenuItem value="month">Month</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>
    </Paper>
  );
};

export default UsageFilters;

