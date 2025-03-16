import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Container, 
  Typography, 
  Box,
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
  const [ownerFilter, setOwnerFilter] = useState('mine');
  const [timeFilter, setTimeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('running');
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
      .filter(run => ownerFilter === 'all' || (ownerFilter === 'mine' && run.owner === user?.sub))
      .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
      .reduce((acc, run) => {
        const groupKey = `${run.workflowType}:${run.assignment}`;
        if (!acc[groupKey]) {
          acc[groupKey] = [];
        }
        acc[groupKey].push(run);
        return acc;
      }, {});
  }, [ownerFilter, user?.sub]);

  const loadWorkflows = useCallback(async () => {
    setLoading(true);
    try {
      const runs = await fetchWorkflowRuns(timeFilter, ownerFilter, statusFilter);
      if (runs && runs.length > 0) {
        setStats(calculateStats(runs));
        setWorkflows(groupWorkflows(runs));
      } else {
        setWorkflows({});
        setStats(INITIAL_STATS);
      }
    } catch (error) {
      console.error('Error loading workflows:', error);
      setWorkflows({});
      setStats(INITIAL_STATS);
    } finally {
      setLoading(false);
    }
  }, [calculateStats, groupWorkflows, setLoading, fetchWorkflowRuns, timeFilter, ownerFilter, statusFilter]);

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

  const handleOwnerFilterChange = (event, newOwnerFilter) => {
    if (newOwnerFilter !== null) {
      setOwnerFilter(newOwnerFilter);
    }
  };

  const handleTimeFilterChange = (event, newTimeFilter) => {
    if (newTimeFilter !== null) {
      setTimeFilter(newTimeFilter);
    }
  };

  const handleStatusFilterChange = (event, newStatusFilter) => {
    if (newStatusFilter !== null) {
      setStatusFilter(newStatusFilter);
    }
  };

  return (
    <Container>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 3,
        mt: 2
      }}>
        <Typography 
          variant="h4" 
          component="h1"
          sx={{
            fontWeight: 'var(--font-weight-semibold)',
            letterSpacing: 'var(--letter-spacing-tight)',
            color: 'var(--text-primary)',
          }}
        >
          Agent Runs
        </Typography>
        
        <Button
          onClick={loadWorkflows}
          disabled={isLoading}
          className={`button-refresh ${isLoading ? 'loading' : ''}`}
          startIcon={<RefreshIcon />}
          size="small"
        >
          <span>Refresh</span>
        </Button>
      </Box>

      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'flex-end',
        alignItems: 'center',
        mb: 3,
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Box sx={{ 
          display: 'flex', 
          gap: 2,
          flexWrap: 'wrap'
        }}>
          <ToggleButtonGroup
            value={ownerFilter}
            exclusive
            onChange={handleOwnerFilterChange}
            size="small"
          >
            <ToggleButton value="mine">Mine</ToggleButton>
            <ToggleButton value="all">All</ToggleButton>
          </ToggleButtonGroup>

          <ToggleButtonGroup
            value={statusFilter}
            exclusive
            onChange={handleStatusFilterChange}
            size="small"
          >
            <ToggleButton value="all" className="total">
              All {stats.total > 0 && `(${stats.total})`}
            </ToggleButton>
            <ToggleButton value="running" className="running">
              Running {stats.running > 0 && `(${stats.running})`}
            </ToggleButton>
            <ToggleButton value="completed" className="completed">
              Completed {stats.completed > 0 && `(${stats.completed})`}
            </ToggleButton>
            <ToggleButton value="terminated" className="terminated">
              Terminated {stats.terminated > 0 && `(${stats.terminated})`}
            </ToggleButton>
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

export default WorkflowList; 