import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Container } from '@mui/material';
import { useSlider } from '../../contexts/SliderContext';
import { useLoading } from '../../contexts/LoadingContext';
import WorkflowOverview from './WorkflowOverview';
import ActivityTimeline from './ActivityTimeline';
import { useNotification } from '../../contexts/NotificationContext';
import WorkflowViewer from './WorkflowViewer';
import { useApi } from '../../services/api';

const WorkflowDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const workflow = location.state?.workflow;
  const { openSlider } = useSlider();
  const containerRef = useRef(null);

  // Add scroll to top effect when component mounts
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo(0, 0);
    }
  }, []);

  return (
    <Container ref={containerRef} sx={{ height: '100%', overflow: 'auto' }}>
      <WorkflowOverview workflow={workflow} />
      <WorkflowViewer workflowData={workflow} />
      <ActivityTimeline 
        workflowId={id}
        openSlider={openSlider}
      />
    </Container>
  );
};

export default WorkflowDetails; 