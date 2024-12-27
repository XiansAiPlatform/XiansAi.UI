import React from 'react';
import {
  ListItem,
  ListItemText,
  Typography,
  Box,
} from '@mui/material';
import { Link } from 'react-router-dom';
import StatusChip from '../Common/StatusChip';

const WorkflowRunItem = ({ run }) => {
  return (
    <ListItem 
      component={Link}
      to={`/runs/${run.id}`}
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
  );
};

export default WorkflowRunItem; 