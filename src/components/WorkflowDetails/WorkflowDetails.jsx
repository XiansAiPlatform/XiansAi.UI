import React, { useEffect, useRef, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Container, CircularProgress, Box } from '@mui/material';
import { useSlider } from '../../contexts/SliderContext';
import { useNotification } from '../../contexts/NotificationContext';
import { handleApiError } from '../../utils/errorHandler';
import { useApi } from '../../services/workflow-api';
import WorkflowOverview from './WorkflowOverview';
import ActivityTimeline from './ActivityTimeline';
import WorkflowViewer from './WorkflowViewer';

const WorkflowDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const [workflow, setWorkflow] = useState(location.state?.workflow);
  const [loading, setLoading] = useState(!location.state?.workflow);
  const [error, setError] = useState(null);
  const { openSlider } = useSlider();
  const { showError } = useNotification();
  const containerRef = useRef(null);
  const [onActionComplete, setOnActionComplete] = useState(false);
  const api = useApi();

  useEffect(() => {
    const fetchWorkflow = async () => {
      if (!workflow) {
        try {
          const data = await api.getWorkflow(id);
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
  }, [id, workflow, showError, api]);

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
    <Container ref={containerRef} sx={{ height: '100%', overflow: 'auto' }}>
      {workflow && (
        <>
          <WorkflowOverview workflowId={workflow.id} onActionComplete={onActionComplete} />
          <WorkflowViewer workflowData={workflow} />
          <ActivityTimeline 
            workflowId={id}
            openSlider={openSlider}
            onWorkflowComplete={handleWorkflowComplete}
          />
        </>
      )}
    </Container>
  );
};

export default WorkflowDetails; 