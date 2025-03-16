import React, { useState } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  List,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import WorkflowRunItem from './WorkflowRunItem';
import RightSlider from '../Layout/RightSlider';
import NewWorkflowForm from './NewWorkflowForm';
import './WorkflowAccordion.css';

const WorkflowAccordion = ({ type, assignment, runs, onWorkflowStarted }) => {
  const [showNewWorkflowForm, setShowNewWorkflowForm] = useState(false);

  const formatWorkflowType = (type) => {
    return type 
      .replace(/([A-Z])/g, ' $1')
      .trim();
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
        className="workflow-accordion"
        disableGutters
        sx={{
          boxShadow: 'none',
          backgroundColor: 'transparent',
          '&:before': {
            display: 'none',
          },
        }}
      >
        <AccordionSummary 
          expandIcon={<ExpandMoreIcon className="expand-icon" />}
          className="workflow-accordion-header"
          sx={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            margin: '8px 0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            '&:hover': {
              backgroundColor: '#f8f9fa',
            },
          }}
        >
          <div className="workflow-header-content">
            <div className="workflow-title-section">
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <Typography 
                  className="workflow-type-title"
                  variant="h5"
                  sx={{
                    fontWeight: 600,
                    fontSize: '1.5rem',
                    color: '#1a1a1a',
                    marginBottom: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span>{formatWorkflowType(type)}</span>
                  <span style={{
                    fontSize: '1rem',
                    color: '#666',
                    backgroundColor: '#f5f5f5',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                  }}>
                    <span style={{ opacity: 0.75 }}>Assignment: </span>
                    <span style={{ 
                      marginLeft: '4px', 
                      fontWeight: 600,
                      color: '#444'
                    }}>
                      {assignment}
                    </span>
                  </span>
                </Typography>
              </div>
              <div className="status-indicators">
                <div className="total-indicator">
                  {runs.length} total
                </div>
                {hasRunningWorkflows && (
                  <div className="running-indicator">
                    {runningWorkflowsCount} running
                  </div>
                )}
              </div>
            </div>
          </div>
        </AccordionSummary>
        <AccordionDetails className="workflow-accordion-details">
          <List>
            {runs.map((run, index) => (
              <WorkflowRunItem key={`${run.runId}-${index}`} run={run} />
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