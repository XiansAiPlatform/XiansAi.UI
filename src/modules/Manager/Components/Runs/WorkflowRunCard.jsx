import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Collapse,
  Stack,
  Button
} from '@mui/material';
import {
  ExpandMore,
  ExpandLess,
  Person,
  Schedule,
  Timeline,
  WorkHistory
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import StatusChip from '../Common/StatusChip';

const WorkflowRunCard = ({ 
  workflow, 
  isFirst = false, 
  isLast = false, 
  showAgent = true, 
  isMobile = false 
}) => {
  const [expanded, setExpanded] = useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return 'Invalid Date';
    }
  };

  const formatDuration = (startTime, endTime) => {
    if (!startTime) return 'N/A';
    try {
      const start = new Date(startTime);
      const end = endTime ? new Date(endTime) : new Date();
      const diffMs = end - start;
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const diffSeconds = Math.floor((diffMs % (1000 * 60)) / 1000);
      
      if (diffHours > 0) {
        return `${diffHours}h ${diffMinutes}m`;
      } else if (diffMinutes > 0) {
        return `${diffMinutes}m ${diffSeconds}s`;
      } else {
        return `${diffSeconds}s`;
      }
    } catch {
      return 'N/A';
    }
  };



  return (
    <Card
      elevation={0}
      sx={{
        border: 'none',
        borderRadius: 0,
        borderTop: isFirst ? 'none' : '1px solid var(--border-color)',
        borderBottom: isLast ? 'none' : 'none',
        backgroundColor: 'transparent',
        '&:hover': {
          backgroundColor: 'var(--bg-hover)',
        },
        transition: 'background-color 0.2s ease'
      }}
    >
      <CardContent sx={{ p: isMobile ? 2 : 3, '&:last-child': { pb: isMobile ? 2 : 3 } }}>
        {/* Main Content Row */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 2,
          flexDirection: isMobile ? 'column' : 'row'
        }}>
          
          {/* Left Section - Workflow Info */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            
            {/* Header Row */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1.5,
              mb: 1,
              flexWrap: 'wrap'
            }}>
              
              {/* Status Chip */}
              <StatusChip 
                label={workflow.status || 'Unknown'}
                status={workflow.status || 'unknown'}
              />
              {/* Workflow ID */}
              <Typography 
                variant="h6" 
                component={Link}
                to={`/manager/runs/${workflow.workflowId}/${workflow.runId}`}
                sx={{ 
                  fontWeight: 600,
                  color: 'var(--primary-color)',
                  textDecoration: 'none',
                  fontSize: isMobile ? '1rem' : '1.1rem',
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }}
              >
                {workflow.workflowId || 'Unknown Workflow'}
              </Typography>


              {/* Agent Badge (if showing multiple agents) */}
              {showAgent && (
                <Chip
                  icon={<Person sx={{ fontSize: 16 }} />}
                  label={workflow.agent || 'Unknown'}
                  size="small"
                  variant="outlined"
                  sx={{
                    height: 24,
                    fontSize: '0.75rem',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-secondary)',
                    backgroundColor: 'var(--bg-paper)'
                  }}
                />
              )}
            </Box>

            {/* Workflow Type */}
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ 
                mb: 1,
                fontFamily: 'monospace',
                fontSize: isMobile ? '0.8rem' : '0.875rem'
              }}
            >
              {workflow.workflowType || 'Unknown Type'}
            </Typography>

            {/* Metadata Row */}
            <Stack 
              direction={isMobile ? 'column' : 'row'} 
              spacing={isMobile ? 0.5 : 2}
              sx={{ 
                alignItems: isMobile ? 'flex-start' : 'center',
                color: 'text.secondary',
                fontSize: '0.875rem'
              }}
            >
              
              {/* Start Time */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Schedule sx={{ fontSize: 16 }} />
                <Typography variant="body2" color="text.secondary">
                  Started: {formatDate(workflow.startTime)}
                </Typography>
              </Box>

              {/* Duration */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Timeline sx={{ fontSize: 16 }} />
                <Typography variant="body2" color="text.secondary">
                  Duration: {formatDuration(workflow.startTime, workflow.closeTime)}
                </Typography>
              </Box>

              {/* History Length */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <WorkHistory sx={{ fontSize: 16 }} />
                <Typography variant="body2" color="text.secondary">
                  Events: {workflow.historyLength || 0}
                </Typography>
              </Box>
            </Stack>
          </Box>

          {/* Right Section - Actions */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            flexShrink: 0,
            alignSelf: isMobile ? 'stretch' : 'flex-start'
          }}>
            
            {/* Action Buttons */}
            <Button
              component={Link}
              to={`/manager/runs/${workflow.workflowId}/${workflow.runId}`}
              size="small"
              variant="outlined"
              sx={{
                minWidth: 'auto',
                px: 2,
                backgroundColor: 'var(--bg-paper)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)',
                '&:hover': {
                  backgroundColor: 'var(--bg-hover)',
                  borderColor: 'var(--border-hover)',
                }
              }}
            >
              View Details
            </Button>

            {/* Expand Button */}
            <IconButton
              onClick={handleExpandClick}
              size="small"
              sx={{
                backgroundColor: 'var(--bg-paper)',
                border: '1px solid var(--border-color)',
                '&:hover': {
                  backgroundColor: 'var(--bg-hover)',
                }
              }}
            >
              {expanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>
        </Box>

        {/* Expandable Details */}
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid var(--border-color)' }}>
            
            {/* Additional Details Grid */}
            <Box sx={{ 
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 2,
              mb: 2
            }}>
              
              {/* Run ID */}
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Run ID
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                  {workflow.runId || 'N/A'}
                </Typography>
              </Box>

              {/* Task Queue */}
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Task Queue
                </Typography>
                <Typography variant="body2">
                  {workflow.taskQueue || 'N/A'}
                </Typography>
              </Box>

              {/* Workers */}
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Active Workers
                </Typography>
                <Typography variant="body2">
                  {workflow.numOfWorkers || 'N/A'}
                </Typography>
              </Box>

              {/* Close Time */}
              {workflow.closeTime && (
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Completed
                  </Typography>
                  <Typography variant="body2">
                    {formatDate(workflow.closeTime)}
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Current Activity */}
            {workflow.currentActivity && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
                  Current Activity
                </Typography>
                <Box sx={{ 
                  p: 1.5, 
                  backgroundColor: 'var(--bg-paper)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 1
                }}>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                    {JSON.stringify(workflow.currentActivity, null, 2)}
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Last Log */}
            {workflow.lastLog && (
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
                  Latest Log
                </Typography>
                <Box sx={{ 
                  p: 1.5, 
                  backgroundColor: 'var(--bg-paper)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 1
                }}>
                  <Typography variant="body2">
                    {workflow.lastLog.message || JSON.stringify(workflow.lastLog, null, 2)}
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
};

export default WorkflowRunCard;
