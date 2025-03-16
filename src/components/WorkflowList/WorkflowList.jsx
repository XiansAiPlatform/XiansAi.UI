import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Container, 
  Typography, 
  Box,
  Stack,
  Paper,
  Button,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import { useApi } from '../../services/workflow-api';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useLoading } from '../../contexts/LoadingContext';
import WorkflowAccordion from './WorkflowAccordion';
import './WorkflowList.css';
import { Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';

const INITIAL_STATS = {
  running: 0,
  completed: 0,
  terminated: 0,
  total: 0
};

const STATUS_CONFIG = [
  { label: 'Total', value: 'total', className: 'total' },
  { label: 'Running', value: 'running', className: 'running' },
  { label: 'Completed', value: 'completed', className: 'completed' },
  { label: 'Terminated', value: 'terminated', className: 'terminated' }
];

const WorkflowList = () => {  
  const [workflows, setWorkflows] = useState({});
  const [stats, setStats] = useState(INITIAL_STATS);
  const [filter, setFilter] = useState('mine');
  const [timeFilter, setTimeFilter] = useState('7days');
  const { user } = useAuth0();

  const { setLoading, isLoading } = useLoading();
  const { fetchWorkflowRuns } = useApi();

  const calculateStats = useCallback((runs) => {
    return runs.reduce((acc, run) => {
      acc.total++;
      const status = (run.status || '').toUpperCase();
      if (status === 'TERMINATED' || status === 'CANCELED') {
        acc.terminated++;
      } else if (acc[status.toLowerCase()] !== undefined) {
        acc[status.toLowerCase()]++;
      }
      return acc;
    }, { ...INITIAL_STATS });
  }, []);

  const groupWorkflows = useCallback((runs) => {
    return runs
      .filter(run => filter === 'all' || (filter === 'mine' && run.owner === user?.sub))
      .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
      .reduce((acc, run) => {
        const groupKey = `${run.workflowType}:${run.assignment}`;
        if (!acc[groupKey]) {
          acc[groupKey] = [];
        }
        acc[groupKey].push(run);
        return acc;
      }, {});
  }, [filter, user?.sub]);

  const loadWorkflows = useCallback(async () => {
    setLoading(true);
    try {
      const runs = await fetchWorkflowRuns(timeFilter, filter);
      if (runs && runs.length > 0) {
        setStats(calculateStats(runs));
        setWorkflows(groupWorkflows(runs));
      } 
    } catch (error) {
      console.error('Error loading workflows:', error);
    } finally {
      setLoading(false);
    }
  }, [calculateStats, groupWorkflows, setLoading, fetchWorkflowRuns, timeFilter, filter]);

  useEffect(() => {
    loadWorkflows();
  }, [loadWorkflows]);

  const statusDisplayConfig = useMemo(() => {
    return STATUS_CONFIG.map(({ label, value, className }) => ({
      label,
      value: stats[value] > 0 ? stats[value] : '-',
      className
    }));
  }, [stats]);

  const hasWorkflows = useMemo(() => {
    return Object.keys(workflows).length > 0;
  }, [workflows]);

  const handleFilterChange = (event, newFilter) => {
    if (newFilter !== null) {
      setFilter(newFilter);
    }
  };

  const handleTimeFilterChange = (event, newTimeFilter) => {
    if (newTimeFilter !== null) {
      setTimeFilter(newTimeFilter);
    }
  };

  return (
    <Container>
      <Paper 
        elevation={0}
        className="stats-container"
      >
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          spacing={{ xs: 2, sm: 3 }}
          justifyContent="space-between"
          alignItems="center"
          sx={{ width: '100%' }}
        >
          {statusDisplayConfig.map(({ label, value, className }) => (
            <StatusBox 
              key={label}
              label={label}
              value={value}
              className={className}
            />
          ))}
        </Stack>
      </Paper>

      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'flex-end',
        mb: 2,
        gap: 2
      }}>
        <Button
          onClick={loadWorkflows}
          disabled={isLoading}
          className={`button-refresh ${isLoading ? 'loading' : ''}`}
          startIcon={<RefreshIcon />}
        >
          <span>Refresh</span>
        </Button>

        <ToggleButtonGroup
          value={filter}
          exclusive
          onChange={handleFilterChange}
          size="small"
        >
          <ToggleButton value="mine">Mine</ToggleButton>
          <ToggleButton value="all">All</ToggleButton>
        </ToggleButtonGroup>

        <ToggleButtonGroup
          value={timeFilter}
          exclusive
          onChange={handleTimeFilterChange}
          size="small"
        >
          <ToggleButton value="7days">Last 7 Days</ToggleButton>
          <ToggleButton value="30days">Last 30 Days</ToggleButton>
          <ToggleButton value="all">All Time</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {hasWorkflows ? (
        Object.entries(workflows).map(([groupKey, runs]) => {
          const [type, assignment] = groupKey.split(':');
          return (
            <WorkflowAccordion
              key={groupKey}
              type={type}
              assignment={assignment}
              runs={runs}
              onWorkflowStarted={loadWorkflows}
            />
          );
        })
      ) : (
        <Paper 
          elevation={0}
          className="empty-state-container"
          sx={{ 
            textAlign: 'center', 
            py: 8, 
            px: 4,
            borderRadius: 3,
            bgcolor: 'background.paper' 
          }}
        >
          <Typography variant="h6" gutterBottom>
            {isLoading ? 'Loading...' : 'Find Your Flow Runs here'}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            To get started, <Link to="/definitions">navigate to Flow Definitions</Link> to create and start new workflows.
          </Typography>
          <Button
            component={Link}
            to="/definitions"
            variant="contained"
            color="primary"
          >
            Go to Agent Definitions
          </Button>
        </Paper>
      )}
    </Container>
  );
};

const StatusBox = ({ label, value, className }) => (
  <Box className={`status-box ${className}`}>
    <Typography className="status-value">{value}</Typography>
    <Typography className="status-label">{label}</Typography>
  </Box>
);

export default WorkflowList; 