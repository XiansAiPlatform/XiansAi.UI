import React, { useState, useEffect, useCallback } from 'react';
import { 
  Container, 
  Typography, 
  IconButton,
  Box
} from '@mui/material';
import { fetchWorkflowRuns } from '../../services/api';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useLoading } from '../../contexts/LoadingContext';
import { useNotification } from '../../contexts/NotificationContext';
import WorkflowAccordion from './WorkflowAccordion';

const WorkflowList = () => {  
  const [workflows, setWorkflows] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { setLoading } = useLoading();
  const { showError } = useNotification();

  const loadWorkflows = useCallback(async () => {
    setIsLoading(true);
    setLoading(true);
    try {
      const runs = await fetchWorkflowRuns();
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

  return (
    <Container>
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