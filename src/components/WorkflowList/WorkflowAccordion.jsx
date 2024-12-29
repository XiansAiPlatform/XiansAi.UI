import React, { useState } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  List,
  Box,
  Button,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import WorkflowRunItem from './WorkflowRunItem';
import RightSlider from '../Layout/RightSlider';
import NewWorkflowForm from './NewWorkflowForm';

const WorkflowAccordion = ({ type, runs, onWorkflowStarted }) => {
  const [showNewWorkflowForm, setShowNewWorkflowForm] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const formatWorkflowType = (type) => {
    return type
      .replace(/([A-Z])/g, ' $1')
      .trim();
  };

  const handleStartNew = (e) => {
    e.stopPropagation();
    setShowNewWorkflowForm(true);
  };

  const handleWorkflowSuccess = () => {
    setShowNewWorkflowForm(false);
    if (onWorkflowStarted) {
      onWorkflowStarted();
    }
  };

  const runningWorkflowsCount = runs.filter(run => run.status.toLowerCase() === 'running').length;
  const hasRunningWorkflows = runningWorkflowsCount > 0;

  return (
    <>
      <Accordion 
        sx={{ 
          mb: 2,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          borderRadius: '10px !important',
          '&:before': {
            display: 'none',
          },
          '&.Mui-expanded': {
            borderRadius: '10px 10px 0 0 !important',
          },
          '& .MuiAccordionSummary-root': {
            borderRadius: '10px',
            backgroundColor: 'rgba(0, 0, 0, 0.02)',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
            },
            '&.Mui-expanded': {
              borderRadius: '10px 10px 0 0',
            }
          },
          '& .MuiAccordionSummary-content': {
            my: 1.5
          }
        }}
        onChange={(_, expanded) => setIsExpanded(expanded)}
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
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h6">
                {formatWorkflowType(type)}
              </Typography>
              <Box className="status-indicators">
                <Box className="total-indicator">
                  {runs.length} total
                </Box>
                {hasRunningWorkflows && (
                  <Box className="running-indicator">
                    {runningWorkflowsCount} running
                  </Box>
                )}
              </Box>
            </Box>
            {isExpanded && (
              <Button
                startIcon={<AddIcon />}
                variant="outlined"
                size="small"
                onClick={handleStartNew}
                sx={{
                  mr: 2,
                  borderColor: 'rgba(0, 0, 0, 0.12)',
                  color: 'text.secondary',
                  backgroundColor: 'transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    borderColor: 'rgba(0, 0, 0, 0.23)',
                  },
                  textTransform: 'none',
                  boxShadow: 'none'
                }}
              >
                Start New
              </Button>
            )}
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <List sx={{ p: 0 }}>
            {runs.map((run, index) => (
              <WorkflowRunItem key={`${run.id}-${index}`} run={run} />
            ))}
          </List>
        </AccordionDetails>
      </Accordion>

      {showNewWorkflowForm && (
        <RightSlider onClose={() => setShowNewWorkflowForm(false)}>
          <NewWorkflowForm
            workflowType={type}
            onSuccess={handleWorkflowSuccess}
            onCancel={() => setShowNewWorkflowForm(false)}
          />
        </RightSlider>
      )}
    </>
  );
};

export default WorkflowAccordion; 