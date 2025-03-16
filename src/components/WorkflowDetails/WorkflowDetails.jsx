import React, { useEffect, useRef, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Container, CircularProgress, Box, useMediaQuery, useTheme } from '@mui/material';
import { useSlider } from '../../contexts/SliderContext';
import { useNotification } from '../../contexts/NotificationContext';
import { handleApiError } from '../../utils/errorHandler';
import { useApi } from '../../services/workflow-api';
import WorkflowOverview from './WorkflowOverview';
import ActivityTimeline from './ActivityTimeline';

const WorkflowDetails = () => {
  const location = useLocation();
  const [workflow, setWorkflow] = useState(location.state?.workflow);
  const [loading, setLoading] = useState(!location.state?.workflow);
  const [error, setError] = useState(null);
  const { openSlider } = useSlider();
  const { showError } = useNotification();
  const containerRef = useRef(null);
  const [onActionComplete, setOnActionComplete] = useState(false);
  const api = useApi();
  const { id, runId } = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const fetchWorkflow = async () => {
      if (!workflow) {
        try {
          const data = await api.getWorkflow(id, runId);
          setWorkflow(data);
        } catch (error) {
          const errorMessage = handleApiError(error, 'Failed to load workflow');
          showError(errorMessage.description);
          setError(errorMessage);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchWorkflow();
  }, [id, runId, workflow, showError, api]);

  const handleWorkflowComplete = () => {
    setOnActionComplete(prev => !prev); // Toggle to trigger useEffect
  };

  // Add scroll to top effect when component mounts
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo(0, 0);
    }
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <div>Unable to load workflow. Please try again later.</div>
      </Box>
    );
  }

  return (
    <Container 
      ref={containerRef} 
      sx={{ 
        height: '100%', 
        overflow: 'auto',
        padding: isMobile ? '16px 8px' : '24px',
        maxWidth: '100%'
      }}
    >
      {workflow && (
        <>
          <WorkflowOverview 
            workflowId={workflow.id} 
            runId={workflow.runId} 
            onActionComplete={onActionComplete}
            isMobile={isMobile} 
          />
          {/* <WorkflowViewer workflowData={workflow} /> */}
          <ActivityTimeline 
            workflowId={workflow.id}
            runId={workflow.runId}
            openSlider={openSlider}
            onWorkflowComplete={handleWorkflowComplete}
            isMobile={isMobile}
          />
        </>
      )}
    </Container>
  );
};

export default WorkflowDetails; 