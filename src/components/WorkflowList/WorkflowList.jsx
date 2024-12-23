import React, { useState, useEffect, useCallback } from 'react';
import { 
  Container, 
  Typography, 
  IconButton,
  Box,
  Stack,
  Paper
} from '@mui/material';
import { fetchWorkflowRuns } from '../../services/api';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useLoading } from '../../contexts/LoadingContext';
import { useNotification } from '../../contexts/NotificationContext';
import WorkflowAccordion from './WorkflowAccordion';
import { alpha } from '@mui/material/styles';
import styles from '../../styles/workflowStatus.module.css';

const WorkflowList = () => {  
  const [workflows, setWorkflows] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { setLoading } = useLoading();
  const { showError } = useNotification();

  const [stats, setStats] = useState({
    running: 0,
    completed: 0,
    terminated: 0,
    canceled: 0
  });

  const loadWorkflows = useCallback(async () => {
    setIsLoading(true);
    setLoading(true);
    try {
      const runs = await fetchWorkflowRuns();
      
      const newStats = runs.reduce((acc, run) => {
        acc.total++;
        if (run.status.toUpperCase() === 'RUNNING') acc.running++;
        else if (run.status.toUpperCase() === 'COMPLETED') acc.completed++;
        else if (run.status.toUpperCase() === 'TERMINATED') acc.terminated++;
        else if (run.status.toUpperCase() === 'CANCELED') acc.cancelled++;
        return acc;
      }, { running: 0, completed: 0, terminated: 0, cancelled: 0, total: 0 });
      setStats(newStats);

      const grouped = runs
        .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
        .reduce((acc, run) => {
          if (!acc[run.workflowType]) {
            acc[run.workflowType] = [];
          }
          acc[run.workflowType].push(run);
          return acc;
        }, {});
      setWorkflows(grouped);
    } catch (error) {
      showError(error.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  }, [setLoading, showError]);

  useEffect(() => {
    loadWorkflows();
  }, [loadWorkflows]);

  const statusConfig = [
    { label: 'Total', value: stats.total, className: '' },
    { label: 'Running', value: stats.running, className: styles.running },
    { label: 'Completed', value: stats.completed, className: styles.completed },
    { label: 'Canceled', value: stats.cancelled, className: styles.canceled },
    { label: 'Terminated', value: stats.terminated, className: styles.terminated }
  ];

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
          {statusConfig.map(({ label, value, className }) => (
            <Box
              key={label}
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
          ))}
        </Stack>
      </Paper>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4">All Flows</Typography>
        <IconButton 
          onClick={loadWorkflows}
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
      {Object.entries(workflows).map(([type, runs]) => (
        <WorkflowAccordion key={type} type={type} runs={runs} />
      ))}
    </Container>
  );
};

export default WorkflowList; 