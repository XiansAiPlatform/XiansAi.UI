import React, { useState } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  List,
  Box,
  keyframes,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import WorkflowRunItem from './WorkflowRunItem';
import './WorkflowAccordion.css';
import { ReactComponent as AgentActivatedSvgIcon } from '../../theme/agent-activated.svg';

const WorkflowAccordion = ({ type, runs, isMobile }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Create a beacon effect animation
  const beaconEffect = keyframes`
    0% {
      box-shadow: 0 0 0 0 rgba(184, 224, 255, 0.7);
    }
    70% {
      box-shadow: 0 0 0 10px rgba(184, 224, 255, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(184, 224, 255, 0);
    }
  `;

  // Add a CSS rule for the running agent icon
  const runningAgentStyle = `
    .running-agent-icon circle[fill="#f0f9ff"] {
      fill: #e6f4ff;
    }
    .running-agent-icon rect[stroke="#3b82f6"] {
      stroke: #1e4976;
    }
    .running-agent-icon circle[fill="#2563eb"] {
      fill: #1e4976;
    }
    .running-agent-icon line[stroke="#3b82f6"] {
      stroke: #1e4976;
    }
    .running-agent-icon rect[fill="#2563eb"] {
      fill: #1e4976;
    }
    .running-agent-icon circle[stroke="#3b82f6"] {
      stroke: #1e4976;
    }
    .running-agent-icon circle[stroke="#93c5fd"] {
      stroke: #b8e0ff;
    }
  `;

  const formatWorkflowType = (type) => {
    return type 
      .replace(/([A-Z])/g, ' $1')
      .trim();
  };

  const runningWorkflowsCount = runs.filter(run => run.status.toLowerCase() === 'running').length;
  const hasRunningWorkflows = runningWorkflowsCount > 0;
  
  const continuedAsNewWorkflowsCount = runs.filter(run => run.status.toLowerCase() === 'continuedasnew').length;
  const hasContinuedAsNewWorkflows = continuedAsNewWorkflowsCount > 0;

  const completedWorkflowsCount = runs.filter(run => run.status.toLowerCase() === 'completed').length;
  const hasCompletedWorkflows = completedWorkflowsCount > 0;
  
  const terminatedWorkflowsCount = runs.filter(run => (run.status.toLowerCase() === 'terminated' || run.status.toLowerCase() === 'canceled')).length;
  const hasTerminatedWorkflows = terminatedWorkflowsCount > 0;

  const uniqueAssignments = [...new Set(runs.map(run => run.assignment))];
  const assignmentText = uniqueAssignments.length > 1 
    ? `${uniqueAssignments.length} assignments` 
    : uniqueAssignments[0];

  const handleChange = (event, expanded) => {
    setIsExpanded(expanded);
  };

  return (
    <>
      <Accordion 
        className="workflow-accordion"
        disableGutters
        onChange={handleChange}
        sx={{
          boxShadow: 'none',
          backgroundColor: 'transparent',
          '&:before': {
            display: 'none',
          },
          position: 'relative',
          zIndex: 1
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
                  <Box 
                    sx={{ 
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      p: '4px',
                      mr: 1,
                      width: '36px',
                      height: '36px',
                      boxShadow: 'none',
                      ...(hasRunningWorkflows && {
                        animation: `${beaconEffect} 2s infinite`,
                        boxShadow: '0 0 0 1px #1e4976',
                      })
                    }}
                  >
                    <style>{hasRunningWorkflows ? runningAgentStyle : ''}</style>
                    <AgentActivatedSvgIcon 
                      className={hasRunningWorkflows ? 'running-agent-icon' : ''}
                      style={{ 
                        width: '28px', 
                        height: '28px',
                      }} 
                    />
                  </Box>
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
                {isExpanded && hasContinuedAsNewWorkflows && (
                  <div className="continuedAsNew-indicator">
                    {continuedAsNewWorkflowsCount} continued
                  </div>
                )}
                {isExpanded && hasCompletedWorkflows && (
                  <div className="completed-indicator">
                    {completedWorkflowsCount} completed
                  </div>
                )}
                {isExpanded && hasTerminatedWorkflows && (
                  <div className="terminated-indicator">
                    {terminatedWorkflowsCount} terminated
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