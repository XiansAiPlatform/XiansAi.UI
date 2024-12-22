import React from 'react';
import { Typography, Box, Paper } from '@mui/material';
import StatusChip from '../Common/StatusChip';

const WorkflowOverview = ({ workflow }) => {
  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 3, 
        mb: 4, 
        backgroundColor: 'rgba(0, 0, 0, 0.02)',
        borderRadius: 2
      }}
    >
      <Typography variant="h4" gutterBottom>{workflow?.id || 'N/A'}</Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3 }}>
      <Box>
          <StatusChip 
            label={workflow?.status || 'N/A'}
            status={workflow?.status?.toUpperCase()}
          />
        </Box>
        <Box>
          <Typography variant="subtitle2" color="text.secondary">Workflow Type</Typography>
          <Typography variant="body1">{workflow?.workflowType || 'N/A'}</Typography>
        </Box>

        <Box>
          <Typography variant="subtitle2" color="text.secondary">Start Time</Typography>
          <Typography variant="body1">
            {workflow?.startTime ? new Date(workflow.startTime).toLocaleString() : 'N/A'}
          </Typography>
        </Box>
        <Box>
          <Typography variant="subtitle2" color="text.secondary">End Time</Typography>
          <Typography variant="body1">
            {workflow?.closeTime ? new Date(workflow.closeTime).toLocaleString() : 'In Progress'}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default WorkflowOverview; 