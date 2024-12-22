import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  List,
  ListItem,
  ListItemText,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Box
} from '@mui/material';
import { fetchWorkflowRuns } from '../../services/api';
import { Link } from 'react-router-dom';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { styled, keyframes } from '@mui/material/styles';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useLoading } from '../../contexts/LoadingContext';

const pulse = keyframes`
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
  100% {
    opacity: 1;
  }
`;

const StatusChip = styled(Chip)(({ status }) => ({
  '&.MuiChip-root': {
    fontWeight: 500,
    minWidth: '100px',
    justifyContent: 'center',
    ...(status === 'COMPLETED' && {
      backgroundColor: '#a8e6cf', // pastel green
      color: '#2d6a4f'
    }),
    ...(status === 'RUNNING' && {
      backgroundColor: '#b8e0ff', // pastel blue
      color: '#1e4976',
      animation: `${pulse} 1.5s ease-in-out infinite`,
      '&::before': {
        content: '""',
        display: 'inline-block',
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        backgroundColor: 'currentColor',
        marginRight: '8px',
        animation: `${pulse} 1.5s ease-in-out infinite`
      }
    }),
    ...(status === 'CANCELED' && {
      backgroundColor: '#e9ecef', // pastel gray
      color: '#495057'
    }),
    ...(status === 'TERMINATED' && {
      backgroundColor: '#ffd3d1', // pastel red
      color: '#842029'
    })
  }
}));

const WorkflowList = () => {
  const [workflows, setWorkflows] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { setLoading } = useLoading();

  const loadWorkflows = async () => {
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
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkflows();
  }, []);

  const formatWorkflowType = (type) => {
    return type
      .replace(/([A-Z])/g, ' $1') // Add spaces before capital letters
      .trim();
  };

  return (
    <>
      <Container>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h4">Workflows</Typography>
          <IconButton 
            onClick={loadWorkflows}
            disabled={isLoading}
            sx={{ 
              '&.Mui-disabled': {
                animation: `${pulse} 1.5s ease-in-out infinite`
              },
              display: 'flex',
              gap: 1,
              borderRadius: 2,
              padding: '8px 16px'
            }}
          >
            <RefreshIcon />
            <Typography 
              variant="button"
              sx={{ 
                display: { xs: 'none', sm: 'block' }  // Hide text on extra small screens
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
                        <Box sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                          <Box component="span" sx={{ display: 'block', mb: 0.5 }}>
                            Start: {new Date(run.startTime).toLocaleString()}
                          </Box>
                          <Box component="span" sx={{ display: 'block' }}>
                            End: {run.closeTime ? new Date(run.closeTime).toLocaleString() : 'In Progress'}
                          </Box>
                        </Box>
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