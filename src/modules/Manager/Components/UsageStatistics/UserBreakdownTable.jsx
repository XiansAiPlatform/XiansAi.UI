import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
} from '@mui/material';

const UserBreakdownTable = ({ data, usageType }) => {
  const { userBreakdown, totalMetrics } = data || {};
  const [orderBy, setOrderBy] = useState('primaryCount');
  const [order, setOrder] = useState('desc');

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortedData = useMemo(() => {
    if (!userBreakdown) return [];

    return [...userBreakdown].sort((a, b) => {
      const aValue = a.metrics[orderBy] || 0;
      const bValue = b.metrics[orderBy] || 0;
      
      if (order === 'asc') {
        return aValue - bValue;
      }
      return bValue - aValue;
    });
  }, [userBreakdown, orderBy, order]);

  const formatNumber = (num) => {
    if (num === null || num === undefined) return '-';
    return num.toLocaleString();
  };

  // Format response time (milliseconds)
  const formatResponseTime = (ms) => {
    if (ms === null || ms === undefined) return '-';
    if (ms >= 60000) return `${(ms / 60000).toFixed(1)}m`;
    if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`;
    return `${ms}ms`;
  };

  // Format value based on usage type
  const formatValue = (value) => {
    if (usageType === 'responsetime') {
      return formatResponseTime(value);
    }
    return formatNumber(value);
  };

  if (!userBreakdown || userBreakdown.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body2" color="text.secondary">
          No user breakdown data available
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid var(--border-color)' }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: 'var(--bg-secondary)' }}>
              <TableCell>
                <strong>User</strong>
              </TableCell>
              
              <TableCell align="right">
                <TableSortLabel
                  active={orderBy === 'primaryCount'}
                  direction={orderBy === 'primaryCount' ? order : 'asc'}
                  onClick={() => handleSort('primaryCount')}
                >
                  <strong>
                    {usageType === 'tokens' ? 'Total Tokens' : 
                     usageType === 'messages' ? 'Total Messages' : 
                     'Total Response Time'}
                  </strong>
                </TableSortLabel>
              </TableCell>

              {usageType === 'tokens' && (
                <>
                  <TableCell align="right">
                    <TableSortLabel
                      active={orderBy === 'promptCount'}
                      direction={orderBy === 'promptCount' ? order : 'asc'}
                      onClick={() => handleSort('promptCount')}
                    >
                      <strong>Prompt</strong>
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right">
                    <TableSortLabel
                      active={orderBy === 'completionCount'}
                      direction={orderBy === 'completionCount' ? order : 'asc'}
                      onClick={() => handleSort('completionCount')}
                    >
                      <strong>Completion</strong>
                    </TableSortLabel>
                  </TableCell>
                </>
              )}

              {usageType === 'responsetime' && (
                <TableCell align="right">
                  <strong>Avg Response Time</strong>
                </TableCell>
              )}

              <TableCell align="right">
                <TableSortLabel
                  active={orderBy === 'requestCount'}
                  direction={orderBy === 'requestCount' ? order : 'asc'}
                  onClick={() => handleSort('requestCount')}
                >
                  <strong>Requests</strong>
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {sortedData.map((user) => (
              <TableRow
                key={user.userId}
                hover
                sx={{
                  '&:hover': {
                    backgroundColor: 'var(--bg-hover)',
                  },
                }}
              >
                <TableCell>
                  <Typography variant="body2">
                    {user.userName || user.userId}
                  </Typography>
                </TableCell>
                
                <TableCell align="right">
                  <Typography variant="body2" fontWeight="medium">
                    {formatValue(user.metrics.primaryCount)}
                  </Typography>
                </TableCell>

                {usageType === 'tokens' && (
                  <>
                    <TableCell align="right">
                      <Typography variant="body2">
                        {formatNumber(user.metrics.promptCount)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">
                        {formatNumber(user.metrics.completionCount)}
                      </Typography>
                    </TableCell>
                  </>
                )}

                {usageType === 'responsetime' && (
                  <TableCell align="right">
                    <Typography variant="body2">
                      {user.metrics.requestCount > 0
                        ? formatResponseTime(Math.round(user.metrics.primaryCount / user.metrics.requestCount))
                        : '-'}
                    </Typography>
                  </TableCell>
                )}

                <TableCell align="right">
                  <Typography variant="body2">
                    {formatNumber(user.metrics.requestCount)}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}

            {/* Total Row */}
            <TableRow sx={{ backgroundColor: 'var(--bg-secondary)' }}>
              <TableCell>
                <Typography variant="body2" fontWeight="bold">
                  TOTAL
                </Typography>
              </TableCell>
              
              <TableCell align="right">
                <Typography variant="body2" fontWeight="bold">
                  {formatValue(totalMetrics.primaryCount)}
                </Typography>
              </TableCell>

              {usageType === 'tokens' && (
                <>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight="bold">
                      {formatNumber(totalMetrics.promptCount)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight="bold">
                      {formatNumber(totalMetrics.completionCount)}
                    </Typography>
                  </TableCell>
                </>
              )}

              {usageType === 'responsetime' && (
                <TableCell align="right">
                  <Typography variant="body2" fontWeight="bold">
                    {totalMetrics.requestCount > 0
                      ? formatResponseTime(Math.round(totalMetrics.primaryCount / totalMetrics.requestCount))
                      : '-'}
                  </Typography>
                </TableCell>
              )}

              <TableCell align="right">
                <Typography variant="body2" fontWeight="bold">
                  {formatNumber(totalMetrics.requestCount)}
                </Typography>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default UserBreakdownTable;


