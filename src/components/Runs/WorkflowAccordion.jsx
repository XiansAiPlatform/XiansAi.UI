import React from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  List,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import WorkflowRunItem from './WorkflowRunItem';
import './WorkflowAccordion.css';

const WorkflowAccordion = ({ type, runs, isMobile }) => {

  const formatWorkflowType = (type) => {
    return type 
      .replace(/([A-Z])/g, ' $1')
      .trim();
  };

  const runningWorkflowsCount = runs.filter(run => run.status.toLowerCase() === 'running').length;
  const hasRunningWorkflows = runningWorkflowsCount > 0;

  const uniqueAssignments = [...new Set(runs.map(run => run.assignment))];
  const assignmentText = uniqueAssignments.length > 1 
    ? `${uniqueAssignments.length} assignments` 
    : uniqueAssignments[0];

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
            padding: isMobile ? '8px 12px' : '12px 16px',
          }}
        >
          <div className="workflow-header-content" style={{ 
            width: '100%', 
            display: 'flex', 
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between', 
            alignItems: isMobile ? 'flex-start' : 'center',
            gap: isMobile ? '8px' : '0'
          }}>
            <div className="workflow-title-section" style={{
              display: 'flex',
              flexDirection: isMobile ? 'row' : 'row',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: isMobile ? '8px' : '16px',
              width: '100%'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <Typography 
                  className="workflow-type-title"
                  variant={isMobile ? "h6" : "h5"}
                  sx={{
                    fontWeight: 600,
                    fontSize: isMobile ? '1.1rem' : '1.5rem',
                    color: '#1a1a1a',
                    marginBottom: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span>{formatWorkflowType(type)}</span>
                </Typography>
              </div>
              <div className="status-indicators" style={{
                display: 'flex',
                gap: isMobile ? '8px' : '16px',
                marginLeft: '0',
                flexWrap: 'nowrap'
              }}>
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
            
            {uniqueAssignments.length > 0 && (
              <span style={{
                fontSize: '.75rem',
                color: '#666',
                backgroundColor: '#f5f5f5',
                padding: '4px 8px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                marginRight: isMobile ? '0' : '16px',
                marginTop: isMobile ? '4px' : '0',
                alignSelf: isMobile ? 'flex-start' : 'center',
                maxWidth: isMobile ? 'fit-content' : 'auto'
              }}>
                {uniqueAssignments.length > 1 ? (
                  <span style={{ opacity: 0.75 }}>{assignmentText}</span>
                ) : (
                  <>
                    <span style={{ opacity: 0.75 }}>Assignment: </span>
                    <span style={{ 
                      marginLeft: '4px', 
                      fontWeight: 600,
                      color: '#444'
                    }}>
                      {assignmentText}
                    </span>
                  </>
                )}
              </span>
            )}
          </div>
        </AccordionSummary>
        <AccordionDetails className="workflow-accordion-details" sx={{
          padding: isMobile ? '8px' : '16px'
        }}>
          <List sx={{ padding: 0 }}>
            {runs.map((run, index) => (
              <WorkflowRunItem 
                key={`${run.runId}-${index}`} 
                run={run} 
                isMobile={isMobile}
              />
            ))}
          </List>
        </AccordionDetails>
      </Accordion>
    </>
  );
};

export default WorkflowAccordion; 