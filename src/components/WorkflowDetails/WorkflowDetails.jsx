import React, { useEffect,  useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Container } from '@mui/material';
import { useSlider } from '../../contexts/SliderContext';
import WorkflowOverview from './WorkflowOverview';
import ActivityTimeline from './ActivityTimeline';
import WorkflowViewer from './WorkflowViewer';
import { useState } from 'react';

const WorkflowDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const workflow = location.state?.workflow;
  const { openSlider } = useSlider();
  const containerRef = useRef(null);
  const [onActionComplete, setOnActionComplete] = useState(false);

  const handleWorkflowComplete = () => {
    setOnActionComplete(prev => !prev); // Toggle to trigger useEffect
  };

  // Add scroll to top effect when component mounts
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo(0, 0);
    }
  }, []);

  return (
    <Container ref={containerRef} sx={{ height: '100%', overflow: 'auto' }}>
      <WorkflowOverview workflowId={workflow.id} onActionComplete={onActionComplete} />
      <WorkflowViewer workflowData={workflow} />
      <ActivityTimeline 
        workflowId={id}
        openSlider={openSlider}
        onWorkflowComplete={handleWorkflowComplete}
      />
    </Container>
  );
};

export default WorkflowDetails; 