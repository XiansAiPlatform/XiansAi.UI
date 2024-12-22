import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Container } from '@mui/material';
import { useSlider } from '../../contexts/SliderContext';
import { useLoading } from '../../contexts/LoadingContext';
import WorkflowOverview from './WorkflowOverview';
import ActivityTimeline from './ActivityTimeline';
import { fetchActivityEvents } from '../../services/api';

const WorkflowDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const workflow = location.state?.workflow;
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { openSlider } = useSlider();
  const { setLoading } = useLoading();

  const loadEvents = async () => {
    setIsLoading(true);
    setLoading(true);
    try {
      const data = await fetchActivityEvents(id);
      setEvents(data || []);
    } catch (error) {
      console.error('Failed to load events:', error);
      setEvents([]);
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [id]);

  return (
    <Container>
      <WorkflowOverview workflow={workflow} />
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