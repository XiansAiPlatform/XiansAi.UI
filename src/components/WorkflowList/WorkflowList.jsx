import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Container, 
  Typography, 
  IconButton,
  Box,
  Stack,
  Paper
} from '@mui/material';
import { useApi } from '../../services/api';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useLoading } from '../../contexts/LoadingContext';
import WorkflowAccordion from './WorkflowAccordion';
import './WorkflowList.css';

const INITIAL_STATS = {
  running: 0,
  completed: 0,
  terminated: 0,
  canceled: 0,
  total: 0
};

const STATUS_CONFIG = [
  { label: 'Total', value: 'total', className: 'total' },
  { label: 'Running', value: 'running', className: 'running' },
  { label: 'Completed', value: 'completed', className: 'completed' },
  { label: 'Canceled', value: 'canceled', className: 'canceled' },
  { label: 'Terminated', value: 'terminated', className: 'terminated' }
];

const WorkflowList = () => {  
  const [workflows, setWorkflows] = useState({});
  const [stats, setStats] = useState(INITIAL_STATS);

  const { setLoading, isLoading } = useLoading();
  const { fetchWorkflowRuns } = useApi();

  const calculateStats = useCallback((runs) => {
    return runs.reduce((acc, run) => {
      acc.total++;
      const status = run.status.toUpperCase();
      if (acc[status.toLowerCase()] !== undefined) {
        acc[status.toLowerCase()]++;
      }
      return acc;
    }, { ...INITIAL_STATS });
  }, []);

  const groupWorkflows = useCallback((runs) => {
    return runs
      .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
      .reduce((acc, run) => {
        if (!acc[run.workflowType]) {
          acc[run.workflowType] = [];
        }
        acc[run.workflowType].push(run);
        return acc;
      }, {});
  }, []);

  const loadWorkflows = useCallback(async () => {
    setLoading(true);
    try {
      const runs = await fetchWorkflowRuns();
      setStats(calculateStats(runs));
      setWorkflows(groupWorkflows(runs));
    } catch (error) {
      // Error already handled in the api.js file
      console.error('Error loading workflows:', error);
    } finally {
      setLoading(false);
    }
  // In order to stop recursive calls:
  // eslint-disable-next-line react-hooks/exhaustive-deps 
  }, [calculateStats, groupWorkflows, setLoading]);

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

  return (
    <Container>
      <Paper 
        elevation={0}
        className="stats-container"
      >
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          spacing={3} 
          justifyContent="space-around"
          alignItems="center"
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

      <HeaderSection 
        isLoading={isLoading}
        onRefresh={loadWorkflows}
      />

      {Object.entries(workflows).map(([type, runs]) => (
        <WorkflowAccordion
          key={type}
          type={type}
          runs={runs}
          onWorkflowStarted={loadWorkflows}
        />
      ))}
    </Container>
  );
};

const StatusBox = ({ label, value, className }) => (
  <Box className={`status-box ${className}`}>
    <Typography className="status-value">{value}</Typography>
    <Typography className="status-label">{label}</Typography>
  </Box>
);

const HeaderSection = ({ isLoading, onRefresh }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
    <Typography variant="h4"></Typography>
    <IconButton 
      onClick={onRefresh}
      disabled={isLoading}
      sx={{
        borderRadius: '4px',
        '&:hover': {
          borderRadius: '4px'
        }
      }}
    >
      <RefreshIcon />
      <Typography 
        variant="button"
        sx={{ 
          display: { xs: 'none', sm: 'block' }
        }}
      >
        Refresh
      </Typography>
    </IconButton>
  </Box>
);

export default WorkflowList; 