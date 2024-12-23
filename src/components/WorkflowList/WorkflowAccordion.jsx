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

const WorkflowAccordion = ({ type, runs }) => {
  const formatWorkflowType = (type) => {
    return type
      .replace(/([A-Z])/g, ' $1')
      .trim();
  };

  return (
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
          {runs.map((run, index) => (
            <WorkflowRunItem key={`${run.id}-${index}`} run={run} />
          ))}
        </List>
      </AccordionDetails>
    </Accordion>
  );
};

export default WorkflowAccordion; 