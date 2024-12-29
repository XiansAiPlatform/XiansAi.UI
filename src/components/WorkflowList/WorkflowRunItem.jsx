import React from 'react';
import {
  ListItem,
  ListItemText,
  Typography,
  Box,
} from '@mui/material';
import { Link } from 'react-router-dom';
import StatusChip from '../Common/StatusChip';
import './WorkflowList.css';

const WorkflowRunItem = ({ run }) => {
  return (
    <ListItem 
      component={Link}
      to={`/runs/${run.id}`}
      state={{ workflow: run }}
      className="workflow-run-item"
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
        status={run.status.toLowerCase()}
        sx={{ ml: 2 }}
      />
    </ListItem>
  );
};

export default WorkflowRunItem; 