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
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { openSlider } = useSlider();
  const { setLoading } = useLoading();
  const { showError } = useNotification();
  const api = useApi();
  const containerRef = useRef(null);

  // Add scroll to top effect when component mounts
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo(0, 0);
    }
  }, []);

  const loadEvents = useCallback(async () => {
    setIsLoading(true);
    setLoading(true);
    try {
      const data = await api.fetchActivityEvents(id);
      setEvents(data || []);
    } catch (error) {
      showError(error.message || 'Failed to load events');
      console.error('Failed to load events:', error);
      setEvents([]);
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, setLoading, showError]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  return (
    <Container ref={containerRef} sx={{ height: '100%', overflow: 'auto' }}>
      <WorkflowOverview workflow={workflow} />
      <WorkflowViewer workflowData={workflow} />
      <ActivityTimeline 
        events={events}
        isLoading={isLoading}
        loadEvents={loadEvents}
        openSlider={openSlider}
      />
    </Container>
  );
};

export default WorkflowDetails; 