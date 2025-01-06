import React, { useState } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  List,
  IconButton,
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
        className="workflow-accordion"
        onChange={(_, expanded) => setIsExpanded(expanded)}
        disableGutters
      >
        <AccordionSummary 
          expandIcon={<ExpandMoreIcon className="expand-icon" />}
          className="workflow-accordion-header"
        >
          <div className="workflow-header-content">
            <div className="workflow-title-section">
              <Typography className="workflow-type-title">
                {formatWorkflowType(type)}
              </Typography>
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
            {isExpanded && false && (
              <IconButton
                onClick={handleStartNew}
                className="start-new-button"
                size="small"
                title="Start New Workflow"
              >
                <AddIcon />
                <span>Start New</span>
              </IconButton>
            )}
          </div>
        </AccordionSummary>
        <AccordionDetails className="workflow-accordion-details">
          <List>
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