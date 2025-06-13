import { useState } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  List,
  Box,
  keyframes,
  Icon,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Chip,
  Tooltip,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import StopIcon from '@mui/icons-material/Stop';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import WorkflowRunItem from './WorkflowRunItem';
import './WorkflowAccordion.css';
import { ReactComponent as AgentActivatedSvgIcon } from '../../theme/agent-activated.svg';
import { useWorkflowApi } from '../../services/workflow-api';
import { useNotification } from '../../contexts/NotificationContext';
import { useLoading } from '../../contexts/LoadingContext';
import { useAuth } from '../../auth/AuthContext';
import { handleApiError } from '../../utils/errorHandler';

const WorkflowAccordion = ({ agentInfo, runs, isMobile }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isTerminating, setIsTerminating] = useState(false);
  const open = Boolean(anchorEl);
  const api = useWorkflowApi();
  const { showSuccess, showError } = useNotification();
  const { setLoading } = useLoading();
  const { user } = useAuth();

  // Safety checks
  if (!agentInfo || !runs || !Array.isArray(runs)) {
    console.warn('WorkflowAccordion: Invalid props received', { agentInfo, runs });
    return null;
  }

  // Create a beacon effect animation
  const beaconEffect = keyframes`
    0% {
      box-shadow: 0 0 0 0 rgba(184, 224, 255, 0.7);
    }
    70% {
      box-shadow: 0 0 0 15px rgba(184, 224, 255, 0);
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


  const formatCreatedBy = (createdBy) => {
    if (!createdBy) return null;
    // Remove provider prefix (e.g., "github|")
    const cleanedCreatedBy = createdBy.includes('|') ? createdBy.split('|')[1] : createdBy;
    return cleanedCreatedBy;
  };

  const isOwner = agentInfo?.permissions?.ownerAccess?.includes(user?.id);

  const runningWorkflowsCount = runs.filter(run => run.status.toLowerCase() === 'running').length;
  const hasRunningWorkflows = runningWorkflowsCount > 0;
  
  const continuedAsNewWorkflowsCount = runs.filter(run => run.status.toLowerCase() === 'continuedasnew').length;
  const hasContinuedAsNewWorkflows = continuedAsNewWorkflowsCount > 0;

  const completedWorkflowsCount = runs.filter(run => run.status.toLowerCase() === 'completed').length;
  const hasCompletedWorkflows = completedWorkflowsCount > 0;
  
  const terminatedWorkflowsCount = runs.filter(run => (run.status.toLowerCase() === 'terminated' || run.status.toLowerCase() === 'canceled')).length;
  const hasTerminatedWorkflows = terminatedWorkflowsCount > 0;

  const handleChange = (event, expanded) => {
    setIsExpanded(expanded);
  };

  const handleMenuClick = (event) => {
    event.stopPropagation(); // Prevent accordion from expanding/collapsing
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleTerminateAll = async () => {
    try {
      setIsTerminating(true);
      setLoading(true);
      const runningWorkflows = runs.filter(run => run.status.toLowerCase() === 'running');
      for (const workflow of runningWorkflows) {
        await api.executeWorkflowCancelAction(workflow.workflowId, true);
      }
      showSuccess(`Termination requested for ${runningWorkflows.length} workflow(s). It may take sometime to complete.`);
      handleMenuClose();
    } catch (error) {
      await handleApiError(error, 'An unexpected error occurred while terminating workflows', showError);
      console.error('Error terminating workflows:', error);
    } finally {
      setIsTerminating(false);
      setLoading(false);
    }
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
          '&.Mui-expanded': {
            margin: '8px 0',
          },
          '& .MuiAccordionDetails-root': {
            backgroundColor: '#fff',
            borderRadius: '0 0 12px 12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            border: '1px solid rgba(0,0,0,0.06)',
            borderTop: 'none',
            margin: '0 0 8px 0'
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
            borderRadius: '12px !important',
            margin: '8px 0',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            border: '1px solid rgba(0,0,0,0.06)',
            '&:hover': {
              backgroundColor: '#f8f9fa',
              boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
              border: '1px solid rgba(0,0,0,0.08)',
              transform: 'translateY(-1px)',
            },
            '&.Mui-expanded': {
              borderRadius: '12px 12px 0 0 !important',
              marginBottom: 0,
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              border: '1px solid rgba(0,0,0,0.06)',
              borderBottom: 'none',
              '& .MuiAccordionSummary-expandIconWrapper': {
                transform: 'rotate(180deg) !important',
              }
            },
            '&:not(.Mui-expanded)': {
              borderRadius: '12px !important',
            },
            '& .MuiAccordionSummary-expandIconWrapper': {
              transition: 'transform 0.3s ease-in-out !important',
              transform: 'rotate(0deg)',
            },
            '& .expand-icon': {
              transition: 'transform 0.3s ease-in-out',
            },
            padding: isMobile ? '8px 14px' : '12px 18px',
            minHeight: isMobile ? '44px' : '48px',
            transition: 'all 0.2s ease-in-out',
            '& .MuiAccordionSummary-content': {
              margin: '2px 0',
            }
          }}
        >
          <div style={{ 
            width: '100%', 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: isMobile ? '8px' : '12px'
          }}>
            {/* Left section: Icon + Name + Status */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: isMobile ? '10px' : '14px',
              flex: 1,
              minWidth: 0,
              overflow: 'hidden'
            }}>
              <Box sx={{ 
                width: isMobile ? 32 : 40, 
                height: isMobile ? 32 : 40,
                animation: hasRunningWorkflows ? `${beaconEffect} 2s infinite` : 'none',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                backgroundColor: hasRunningWorkflows ? 'rgba(184, 224, 255, 0.1)' : 'transparent'
              }}>
                <AgentActivatedSvgIcon 
                  className={hasRunningWorkflows ? 'running-agent-icon' : ''}
                  style={{
                    width: isMobile ? '24px' : '32px',
                    height: isMobile ? '24px' : '32px'
                  }}
                />
                <style>{runningAgentStyle}</style>
              </Box>
              
              <div style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                alignItems: isMobile ? 'flex-start' : 'center',
                gap: isMobile ? '2px' : '12px',
                flex: 1,
                minWidth: 0,
                overflow: 'hidden'
              }}>
                <Typography 
                  className="workflow-type-title"
                  variant={isMobile ? "subtitle1" : "h6"}
                  sx={{
                    fontWeight: 600,
                    fontSize: isMobile ? '1.0rem' : '1.25rem',
                    color: '#1a1a1a',
                    margin: 0,
                    lineHeight: 1.3,
                    flexShrink: 1,
                    minWidth: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                  title={agentInfo?.name} // Add tooltip to show full name on hover
                >
                  {agentInfo?.name}
                </Typography>
                
                {/* Status indicators */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: isMobile ? '4px' : '8px',
                  flexWrap: isMobile ? 'wrap' : 'nowrap',
                  flexShrink: 0
                }}>
                  {hasRunningWorkflows && (
                    <div className="running-indicator" style={{ flexShrink: 0 }}>
                      {runningWorkflowsCount} running
                    </div>
                  )}
                  {isExpanded && hasContinuedAsNewWorkflows && (
                    <div className="continuedAsNew-indicator" style={{ flexShrink: 0 }}>
                      {continuedAsNewWorkflowsCount} continued
                    </div>
                  )}
                  {isExpanded && hasCompletedWorkflows && (
                    <div className="completed-indicator" style={{ flexShrink: 0 }}>
                      {completedWorkflowsCount} completed
                    </div>
                  )}
                  {isExpanded && hasTerminatedWorkflows && (
                    <div className="terminated-indicator" style={{ flexShrink: 0 }}>
                      {terminatedWorkflowsCount} terminated
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Right section: Metadata + Actions */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: isMobile ? '12px' : '18px',
              flexShrink: 0
            }}>
              {agentInfo?.createdBy && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <Tooltip title="Created by">
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '4px',
                      color: 'text.secondary',
                      fontSize: isMobile ? '0.75rem' : '0.85rem',
                      whiteSpace: 'nowrap'
                    }}>
                      <PersonIcon sx={{ fontSize: isMobile ? 12 : 14 }} />
                      <span>{formatCreatedBy(agentInfo.createdBy)}</span>
                    </Box>
                  </Tooltip>
                  
                  {isOwner && (
                    <Chip 
                      label="Owner" 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                      sx={{ 
                        fontSize: isMobile ? '0.65rem' : '0.7rem',
                        height: isMobile ? '16px' : '18px',
                        '& .MuiChip-label': {
                          padding: '0 6px'
                        }
                      }} 
                    />
                  )}
                </div>
              )}
              
              {agentInfo?.createdAt && !isMobile && (
                <Tooltip title="Created on">
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '4px',
                    color: 'text.secondary',
                    fontSize: '0.8rem',
                    whiteSpace: 'nowrap'
                  }}>
                    <CalendarTodayIcon sx={{ fontSize: 14 }} />
                    <span>{new Date(agentInfo.createdAt).toLocaleDateString()}</span>
                  </Box>
                </Tooltip>
              )}
              
              {hasRunningWorkflows && (
                <Icon
                  onClick={handleMenuClick}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '8px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    color: 'rgba(0, 0, 0, 0.54)',
                  }}
                  className="action-button"
                >
                  {isTerminating ? (
                    <CircularProgress size={20} />
                  ) : (
                    <MoreVertIcon />
                  )}
                </Icon>
              )}
            </div>
          </div>
        </AccordionSummary>
        <AccordionDetails className="workflow-accordion-details" sx={{
          padding: 0,
          paddingTop: 0,
          marginTop: 0,
          '&.MuiAccordionDetails-root': {
            paddingTop: 0,
            borderTop: 'none'
          }
        }}>
          <List sx={{ 
            padding: 0,
            margin: 0,
            '& .MuiListItem-root:first-of-type': {
              paddingTop: 0
            }
          }}>
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

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()} // Prevent accordion from expanding/collapsing
      >
        <MenuItem onClick={handleTerminateAll} disabled={isTerminating}>
          <ListItemIcon>
            {isTerminating ? (
              <CircularProgress size={20} />
            ) : (
              <StopIcon fontSize="small" />
            )}
          </ListItemIcon>
          <ListItemText>Terminate All Running</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

export default WorkflowAccordion; 
