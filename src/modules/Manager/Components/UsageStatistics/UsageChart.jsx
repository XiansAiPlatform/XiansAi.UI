import React, { useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import { format } from 'date-fns';

const UsageChart = ({ data, groupBy }) => {
  const { timeSeriesData, totalMetrics, agentTimeSeriesData, agentBreakdown, unit, metricType } = data || {};

  // Simple helper: use the date string from API as the key directly
  const getDateKey = (dateString) => dateString;

  // Simple helper: parse date string to Date object
  const parseDateKey = (dateKey) => new Date(dateKey);

  // Get unique agents and assign colors
  const agents = useMemo(() => {
    if (!agentBreakdown || agentBreakdown.length === 0) return [];
    return agentBreakdown.map((agent, index) => ({
      name: agent.agentName,
      color: getColorForIndex(index + 1), // Start from index 1 to reserve index 0 for "Total"
    }));
  }, [agentBreakdown]);

  // Group agent data by date
  const agentChartData = useMemo(() => {
    if (!agentTimeSeriesData || agentTimeSeriesData.length === 0) return {};

    const grouped = {};
    const dateMap = new Map();
    
    agentTimeSeriesData.forEach((point) => {
      const dateKey = getDateKey(point.date);
      const date = new Date(point.date);
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = {};
        dateMap.set(dateKey, date);
      }
      // For time-based units (ms, milliseconds, seconds), calculate average; otherwise use primaryCount
      const isTimeUnit = unit && (unit === 'ms' || unit === 'milliseconds' || unit === 'seconds');
      const value = isTimeUnit && point.metrics.requestCount > 0
        ? point.metrics.primaryCount / point.metrics.requestCount
        : point.metrics.primaryCount;
      grouped[dateKey][point.agentName] = value;
    });

    const dates = Array.from(dateMap.entries())
      .sort((a, b) => a[1].getTime() - b[1].getTime())
      .map(([key]) => key);
    
      return { grouped, dates, dateMap };
  }, [agentTimeSeriesData, groupBy, unit]);

  // Combine all dates (from total and agents) and create unified dataset
  const allDates = useMemo(() => {
    const dateSet = new Set();
    const dateMap = new Map();

    // Add dates from total time series
    if (timeSeriesData) {
      timeSeriesData.forEach((d) => {
        const dateKey = getDateKey(d.date);
        const date = new Date(d.date);
        dateSet.add(dateKey);
        dateMap.set(dateKey, date);
      });
    }

    // Add dates from agent time series
    if (agentChartData.dates) {
      agentChartData.dates.forEach((dateKey) => {
        dateSet.add(dateKey);
        if (!dateMap.has(dateKey) && agentChartData.dateMap.has(dateKey)) {
          dateMap.set(dateKey, agentChartData.dateMap.get(dateKey));
        }
      });
    }

      return Array.from(dateSet)
      .sort((a, b) => {
        const dateA = dateMap.get(a) || parseDateKey(a);
        const dateB = dateMap.get(b) || parseDateKey(b);
        return dateA.getTime() - dateB.getTime();
      });
  }, [timeSeriesData, agentChartData, groupBy]);

  // Calculate chart dimensions and scale (considering both total and agent data)
  const chartConfig = useMemo(() => {
    let maxValue = 0;

    // Check total time series data
    if (timeSeriesData && timeSeriesData.length > 0) {
      maxValue = Math.max(maxValue, ...timeSeriesData.map(d => d.metrics.primaryCount));
    }

    // Check agent time series data
    if (agentChartData.grouped) {
      Object.values(agentChartData.grouped).forEach((agentData) => {
        Object.values(agentData).forEach((value) => {
          if (value > maxValue) maxValue = value;
        });
      });
    }

    if (maxValue === 0) return null;

    const minValue = 0;
    const range = maxValue - minValue;
    const padding = range * 0.1; // 10% padding

    return {
      maxValue: maxValue + padding,
      minValue: Math.max(0, minValue - padding),
      dataPoints: allDates.length,
    };
  }, [timeSeriesData, agentChartData, allDates]);

  if (!data || !chartConfig || allDates.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body2" color="text.secondary">
          No data available for the selected period
        </Typography>
      </Box>
    );
  }

  const chartWidth = 800;
  const chartHeight = 300;
  const padding = { top: 20, right: 20, bottom: 60, left: 60 };

  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  const xScale = (index) => {
    return (index / (allDates.length - 1 || 1)) * innerWidth;
  };

  const yScale = (value) => {
    const scale = innerHeight / (chartConfig.maxValue - chartConfig.minValue);
    return innerHeight - (value - chartConfig.minValue) * scale;
  };

  // Get value for a specific date from time series data
  const getValueForDate = (dateKey, dataArray) => {
    if (!dataArray) return null;
    for (const d of dataArray) {
      if (d.date === dateKey) {
        return d.metrics.primaryCount;
      }
    }
    return null;
  };

  // Generate line path for total
  const generateTotalLinePath = () => {
    if (!timeSeriesData || timeSeriesData.length === 0) return null;
    
    const points = allDates.map((dateKey, index) => {
      const value = getValueForDate(dateKey, timeSeriesData) || 0;
      const x = xScale(index);
      const y = yScale(value);
      return { x, y, value };
    });

    return points
      .map((point, i) => `${i === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
      .join(' ');
  };

  // Generate line path for an agent
  const generateAgentLinePath = (agentName) => {
    if (!agentChartData.grouped) return null;
    
    const points = allDates.map((dateKey, index) => {
      const value = agentChartData.grouped[dateKey]?.[agentName] || 0;
      const x = xScale(index);
      const y = yScale(value);
      return { x, y, value };
    });

    return points
      .map((point, i) => `${i === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
      .join(' ');
  };

  // Format numbers
  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // Format label based on metric type
  const getLabel = () => {
    if (!metricType) return 'Usage';
    // Convert snake_case to Title Case
    return metricType.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // Format response time (milliseconds)
  const formatResponseTime = (ms) => {
    if (ms >= 60000) return `${(ms / 60000).toFixed(1)}m`;
    if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`;
    return `${ms}ms`;
  };

  return (
    <Box>
      {/* Title and Summary */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          {getLabel()} Over Time
        </Typography>
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          {/* Total metric value */}
          <Box>
            <Typography variant="caption" color="text.secondary">
              Total {getLabel()}
            </Typography>
            <Typography variant="h5">
              {unit && (unit === 'ms' || unit === 'milliseconds' || unit === 'seconds')
                ? formatResponseTime(Math.round(totalMetrics.primaryCount / (totalMetrics.requestCount || 1)))
                : formatNumber(totalMetrics.primaryCount)}
            </Typography>
          </Box>
          
          {/* Optional breakdown (only if backend provides promptCount and completionCount) */}
          {totalMetrics.promptCount !== null && totalMetrics.promptCount !== undefined && (
            <>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Prompt Tokens
                </Typography>
                <Typography variant="h5">
                  {formatNumber(totalMetrics.promptCount)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Completion Tokens
                </Typography>
                <Typography variant="h5">
                  {formatNumber(totalMetrics.completionCount)}
                </Typography>
              </Box>
            </>
          )}
          
          {/* Total Requests (always shown, at the end) */}
          <Box>
            <Typography variant="caption" color="text.secondary">
              Total Requests
            </Typography>
            <Typography variant="h5">
              {formatNumber(totalMetrics.requestCount)}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Chart */}
      <Box sx={{ overflowX: 'auto' }}>
        <svg
          width={chartWidth}
          height={chartHeight}
          style={{ display: 'block' }}
        >
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = yScale(chartConfig.maxValue * ratio);
            return (
              <g key={ratio}>
                <line
                  x1={0}
                  y1={y + padding.top}
                  x2={innerWidth}
                  y2={y + padding.top}
                  stroke="var(--border-color)"
                  strokeDasharray="2,2"
                  opacity="0.5"
                />
                <text
                  x={padding.left - 10}
                  y={y + padding.top + 4}
                  textAnchor="end"
                  fontSize="12"
                  fill="var(--text-secondary)"
                >
                  {unit && (unit === 'ms' || unit === 'milliseconds' || unit === 'seconds')
                    ? formatResponseTime(Math.round(chartConfig.maxValue * ratio))
                    : formatNumber(Math.round(chartConfig.maxValue * ratio))}
                </text>
              </g>
            );
          })}

          {/* Chart area */}
          <g transform={`translate(${padding.left}, ${padding.top})`}>
            {/* Total line */}
            {generateTotalLinePath() && (
              <g>
                <path
                  d={generateTotalLinePath()}
                  fill="none"
                  stroke="var(--primary-color, #1976d2)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Total data points */}
                {allDates.map((dateKey, i) => {
                  const value = getValueForDate(dateKey, timeSeriesData);
                  if (value === null) return null;
                  const x = xScale(i);
                  const y = yScale(value);
                  const date = parseDateKey(dateKey);
                  return (
                    <g key={`total-${i}`}>
                      <circle
                        cx={x}
                        cy={y}
                        r="4"
                        fill="var(--primary-color, #1976d2)"
                      />
                      <title>
                        {format(date, groupBy === 'hour' ? 'MMM d, yyyy HH:mm' : 'MMM d, yyyy')}: Total - {
                          formatNumber(value)
                        } {getLabel()}
                      </title>
                    </g>
                  );
                })}
              </g>
            )}

            {/* Agent lines */}
            {agents.map((agent) => {
              const path = generateAgentLinePath(agent.name);
              if (!path) return null;
              
              return (
                <g key={agent.name}>
                  <path
                    d={path}
                    fill="none"
                    stroke={agent.color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Agent data points */}
                  {allDates.map((dateKey, i) => {
                    const value = agentChartData.grouped[dateKey]?.[agent.name] || 0;
                    if (value === 0) return null;
                    const x = xScale(i);
                    const y = yScale(value);
                    const date = agentChartData.dateMap.get(dateKey) || parseDateKey(dateKey);
                    return (
                      <g key={`${agent.name}-${i}`}>
                        <circle
                          cx={x}
                          cy={y}
                          r="4"
                          fill={agent.color}
                        />
                        <title>
                          {format(date, groupBy === 'hour' ? 'MMM d, yyyy HH:mm' : 'MMM d, yyyy')}: {agent.name} - {
                            unit && (unit === 'ms' || unit === 'milliseconds' || unit === 'seconds')
                              ? formatResponseTime(value) + ' (avg)'
                              : formatNumber(value)
                          } {getLabel()}
                        </title>
                      </g>
                    );
                  })}
                </g>
              );
            })}

            {/* X-axis labels */}
            {allDates.map((dateKey, i) => {
              const x = xScale(i);
              const showLabel = allDates.length <= 10 || i % Math.ceil(allDates.length / 10) === 0;
              
              if (!showLabel) return null;

              const date = parseDateKey(dateKey);
              
              // Format label based on grouping
              const labelFormat = groupBy === 'hour' ? 'HH:mm' : 
                                  groupBy === 'week' ? 'MMM d' :
                                  groupBy === 'month' ? 'MMM yyyy' : 
                                  'MMM d';
              
              return (
                <text
                  key={`label-${i}`}
                  x={x}
                  y={innerHeight + 20}
                  textAnchor="middle"
                  fontSize="11"
                  fill="var(--text-secondary)"
                >
                  {format(date, labelFormat)}
                </text>
              );
            })}
          </g>
        </svg>
      </Box>

      {/* Legend */}
      {(agents.length > 0 || timeSeriesData) && (
        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {/* Total legend */}
          {timeSeriesData && timeSeriesData.length > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 16,
                  height: 16,
                  backgroundColor: 'var(--primary-color, #1976d2)',
                  borderRadius: '2px',
                }}
              />
              <Typography variant="body2" color="text.secondary">
                Total
              </Typography>
            </Box>
          )}
          {/* Agent legends */}
          {agents.map((agent) => (
            <Box key={agent.name} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 16,
                  height: 16,
                  backgroundColor: agent.color,
                  borderRadius: '2px',
                }}
              />
              <Typography variant="body2" color="text.secondary">
                {agent.name}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

// Generate distinct colors for agents
const getColorForIndex = (index) => {
  const colors = [
    '#d32f2f', // Red
    '#388e3c', // Green
    '#f57c00', // Orange
    '#7b1fa2', // Purple
    '#0288d1', // Light Blue
    '#c2185b', // Pink
    '#00796b', // Teal
    '#5d4037', // Brown
    '#455a64', // Blue Grey
  ];
  return colors[index % colors.length];
};

export default UsageChart;

