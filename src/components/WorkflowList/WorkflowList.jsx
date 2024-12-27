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
import { alpha } from '@mui/material/styles';
import styles from '../../styles/workflowStatus.module.css';

const INITIAL_STATS = {
  running: 0,
  completed: 0,
  terminated: 0,
  canceled: 0,
  total: 0
};

const STATUS_CONFIG = [
  { label: 'Total', value: 'total', className: '' },
  { label: 'Running', value: 'running', className: styles.running },
  { label: 'Completed', value: 'completed', className: styles.completed },
  { label: 'Canceled', value: 'canceled', className: styles.canceled },
  { label: 'Terminated', value: 'terminated', className: styles.terminated }
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
        sx={{ 
          mb: 3, 
          p: 3,
          background: (theme) => alpha(theme.palette.background.default, 0.7),
          backdropFilter: 'blur(10px)',
          borderRadius: 4,
          border: (theme) => `1px solid ${alpha(theme.palette.divider, 0.1)}`
        }}
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
        <WorkflowAccordion key={type} type={type} runs={runs} />
      ))}
    </Container>
  );
};

const StatusBox = ({ label, value, className }) => (
  <Box
    sx={{
      px: 3,
      py: 2,
      borderRadius: 2,
      background: className ? `var(--status-bg)` : (theme) => alpha(theme.palette.primary.main, 0.1),
      minWidth: 120,
      textAlign: 'center'
    }}
    className={className}
  >
    <Typography 
      variant="h3" 
      sx={{ 
        color: className ? `var(--status-color)` : 'primary.main',
        fontSize: '2rem',
        fontWeight: 'bold',
        mb: 1
      }}
    >
      {value}
    </Typography>
    <Typography 
      variant="body2"
      sx={{ 
        color: 'text.secondary',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        fontWeight: 500
      }}
    >
      {label}
    </Typography>
  </Box>
);

const HeaderSection = ({ isLoading, onRefresh }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
    <Typography variant="h4">All Flows</Typography>
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