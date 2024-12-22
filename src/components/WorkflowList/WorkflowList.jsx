import React, { useState, useEffect, useCallback } from 'react';
import { 
  Container, 
  Typography, 
  List,
  ListItem,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Box
} from '@mui/material';
import { fetchWorkflowRuns } from '../../services/api';
import { Link } from 'react-router-dom';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useLoading } from '../../contexts/LoadingContext';
import StatusChip from '../Common/StatusChip'
import { useError } from '../../contexts/ErrorContext';


const WorkflowList = () => {
  const [workflows, setWorkflows] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { setLoading } = useLoading();
  const { showError } = useError();


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

  const formatWorkflowType = (type) => {
    return type
      .replace(/([A-Z])/g, ' $1') // Add spaces before capital letters
      .trim();
  };

  return (
    <>
      <Container>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h4">Flows</Typography>
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
          <Accordion 
            key={type} 
            sx={{ 
              mb: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              borderRadius: '10px !important',
              '&:before': {
                display: 'none', // Removes the default divider
              },
              '& .MuiAccordionSummary-root': {
                borderRadius: '10px',
                backgroundColor: 'rgba(0, 0, 0, 0.02)',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                }
              },
              '& .MuiAccordionSummary-content': {
                my: 1.5 // Adds more vertical padding
              }
            }}
          >
            <AccordionSummary 
              expandIcon={<ExpandMoreIcon />}
              sx={{
                '& .MuiTypography-root': {
                  fontWeight: 500,
                  color: 'text.primary'
                }
              }}
            >
              <Typography variant="h6">
                {formatWorkflowType(type)} <Typography component="span" color="text.secondary">({runs.length})</Typography>
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <List sx={{ p: 0 }}>
                {runs.map((run) => (
                  <ListItem 
                    key={run.id}
                    component={Link}
                    to={`/workflows/${run.id}`}
                    state={{ workflow: run }}
                    sx={{
                      mb: 1,
                      borderRadius: 2,
                      backgroundColor: 'background.paper',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
                      transition: 'all 0.2s ease-in-out',
                      textDecoration: 'none',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.02)',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.08)',
                      },
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      p: 2,
                    }}
                  >
                    <ListItemText 
                      primary={
                        <Typography 
                          variant="subtitle1" 
                          component="div"
                          sx={{ 
                            fontWeight: 500,
                            color: 'text.primary',
                            mb: 0.5
                          }}
                        >
                          {run.id}
                        </Typography>
                      }
                      secondary={
                        <Typography
                          component="div"
                          variant="body2"
                          sx={{ color: 'text.secondary' }}
                        >
                          <Box component="span" sx={{ display: 'block', mb: 0.5 }}>
                            Start: {new Date(run.startTime).toLocaleString()}
                          </Box>
                          <Box component="span" sx={{ display: 'block' }}>
                            End: {run.closeTime ? new Date(run.closeTime).toLocaleString() : 'In Progress'}
                          </Box>
                        </Typography>
                      }
                    />
                    <StatusChip 
                      label={run.status}
                      status={run.status.toUpperCase()}
                      sx={{ ml: 2 }}
                    />
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        ))}
      </Container>
    </>
  );
};

export default WorkflowList; 