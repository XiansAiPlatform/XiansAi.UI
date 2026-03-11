import { useState, useEffect, useMemo } from 'react';
import { 
  Typography, 
  Box,
  Paper,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  useMediaQuery,
  IconButton,
  Alert,
  Collapse,
  Divider,
  Chip,
  TextField,
  InputAdornment
} from '@mui/material';
import { useWorkflowApi } from '../../services/workflow-api';
import RefreshIcon from '@mui/icons-material/Refresh';
import PersonIcon from '@mui/icons-material/Person';
import ViewListIcon from '@mui/icons-material/ViewList';
import LabelIcon from '@mui/icons-material/Label';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import SearchIcon from '@mui/icons-material/Search';
import { useLoading } from '../../contexts/LoadingContext';
import { useNotification } from '../../contexts/NotificationContext';
import { handleApiError } from '../../utils/errorHandler';
import AgentSelector from './AgentSelector';
import ActivationSelector from './ActivationSelector';
import WorkflowTypeSelector from './WorkflowTypeSelector';
import PaginationControls from './PaginationControls';
import WorkflowRunCard from './WorkflowRunCard';
import './WorkflowList.css';
import { useLocation } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ConfirmationDialog from '../Common/ConfirmationDialog';
import PageLayout from '../Common/PageLayout';
import PageFilters from '../Common/PageFilters';
import EmptyState from '../Common/EmptyState';

const WorkflowList = () => {  
  // New pagination state
  const [workflows, setWorkflows] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [selectedActivation, setSelectedActivation] = useState(null);
  const [selectedWorkflowType, setSelectedWorkflowType] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('');
  const [debouncedUser, setDebouncedUser] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [showHint, setShowHint] = useState(false);
  
  const location = useLocation();
  const isMobile = useMediaQuery('(max-width:768px)');
  const isSmallMobile = useMediaQuery('(max-width:480px)');

  const { setLoading, isLoading } = useLoading();
  const api = useWorkflowApi();
  const { showError, showSuccess } = useNotification();

  // Bulk terminate state
  const [confirmTerminateOpen, setConfirmTerminateOpen] = useState(false);
  const [isTerminatingAll, setIsTerminatingAll] = useState(false);
  const [terminateProgress, setTerminateProgress] = useState({ total: 0, completed: 0 });

  // Debounce user filter input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedUser(userFilter.trim());
    }, 500);
    return () => clearTimeout(timer);
  }, [userFilter]);

  // New paginated workflow loading
  const loadPaginatedWorkflows = async (pageToken = null, reset = false) => {
    setLoading(true);
    if (reset) {
      setWorkflows([]);
      setCurrentPage(1);
      setHasNextPage(false);
    }
    
    // Hide hint when refreshing
    setShowHint(false);
    
    try {
      const options = {
        status: statusFilter,
        agent: selectedAgent,
        workflowType: selectedWorkflowType,
        user: debouncedUser || null,
        idPostfix: selectedActivation || null,
        pageSize: pageSize,
        pageToken: pageToken
      };

      const response = await api.fetchPaginatedWorkflowRuns(options);
      
      if (response && response.workflows) {
        // Sort workflows by start time (newest first)
        const sortedWorkflows = response.workflows.sort((a, b) => 
          new Date(b.startTime) - new Date(a.startTime)
        );
        
        setWorkflows(sortedWorkflows);
        setHasNextPage(response.hasNextPage);
      } else {
        setWorkflows([]);
        setHasNextPage(false);
      }
    } catch (error) {
      console.error('Error loading paginated workflows:', error);
      setWorkflows([]);
      setHasNextPage(false);
      // Use the proper error handler for better user experience
      await handleApiError(error, 'Failed to load workflow runs', showError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Reset to page 1 and reload when filters change
    setCurrentPage(1);
    loadPaginatedWorkflows(null, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, selectedAgent, selectedActivation, selectedWorkflowType, debouncedUser, pageSize]);

  // Show hint when navigated from NewWorkflowForm
  useEffect(() => {
    if (location.state?.fromNewWorkflow) {
      setShowHint(true);
      // Clear the navigation state to prevent showing hint on refresh
      window.history.replaceState({}, document.title);
      
      // Auto-hide hint after 10 seconds
      const timer = setTimeout(() => {
        setShowHint(false);
      }, 10000);
      
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  const hasWorkflows = useMemo(() => {
    return workflows.length > 0;
  }, [workflows]);

  const handleStatusFilterChange = (event, newStatusFilter) => {
    if (newStatusFilter !== null) {
      setStatusFilter(newStatusFilter);
      setCurrentPage(1);
    }
  };

  const handleAgentChange = (agent) => {
    setSelectedAgent(agent);
    setSelectedWorkflowType(null); // Reset workflow type when agent changes
    setCurrentPage(1);
  };

  const handleWorkflowTypeChange = (workflowType) => {
    setSelectedWorkflowType(workflowType);
    setCurrentPage(1);
  };

  const handleActivationChange = (activation) => {
    setSelectedActivation(activation);
    setCurrentPage(1);
  };

  const handleUserChange = (event) => {
    setUserFilter(event.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    // Update current page first
    setCurrentPage(newPage);
    
    // Load the new page data
    const pageToken = newPage > 1 ? newPage.toString() : null;
    loadPaginatedWorkflows(pageToken, false); // Don't reset the current page state
  };

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  const openConfirmTerminate = () => setConfirmTerminateOpen(true);
  const closeConfirmTerminate = () => setConfirmTerminateOpen(false);

  const handleTerminateAll = async () => {
    try {
      setConfirmTerminateOpen(false);
      setIsTerminatingAll(true);

      // Gather all running workflow IDs across pages (respecting selected agent)
      let page = 1;
      const pageSizeForBulk = 100;
      let allIds = [];
      // Force status to running for bulk termination regardless of current filter
      // but if user selected a specific agent, respect it
      // Loop through pages until no next page
      // Use nextPageToken if provided, otherwise increment page
      while (true) {
        const response = await api.fetchPaginatedWorkflowRuns({
          status: 'running',
          agent: selectedAgent,
          workflowType: selectedWorkflowType,
          user: debouncedUser || null,
          idPostfix: selectedActivation || null,
          pageSize: pageSizeForBulk,
          pageToken: page > 1 ? String(page) : null,
        });
        const workflowsPage = response?.workflows || [];
        const ids = workflowsPage.map(w => w.workflowId).filter(Boolean);
        allIds.push(...ids);

        if (response?.hasNextPage) {
          if (response?.nextPageToken) {
            const next = parseInt(response.nextPageToken, 10);
            page = Number.isNaN(next) ? page + 1 : next;
          } else {
            page += 1;
          }
        } else {
          break;
        }
      }

      // Deduplicate IDs
      allIds = Array.from(new Set(allIds));

      if (allIds.length === 0) {
        showSuccess('No running workflows to terminate.');
        return;
      }

      setTerminateProgress({ total: allIds.length, completed: 0 });

      // Execute cancellations sequentially to avoid server overload
      for (let i = 0; i < allIds.length; i += 1) {
        const id = allIds[i];
        try {
          await api.executeWorkflowCancelAction(id, true);
        } catch (err) {
          console.error('Failed to terminate workflow', id, err);
        }
        setTerminateProgress(prev => ({ ...prev, completed: i + 1 }));
      }

      showSuccess(`Termination requests sent for ${allIds.length} workflow${allIds.length === 1 ? '' : 's'}.`);
      // Refresh list (stay on current page)
      await loadPaginatedWorkflows(currentPage > 1 ? String(currentPage) : null, false);
    } catch (error) {
      console.error('Bulk terminate failed', error);
      showError('Failed to terminate workflows. Please try again.');
    } finally {
      setIsTerminatingAll(false);
      setTerminateProgress({ total: 0, completed: 0 });
    }
  };

  return (
    <PageLayout 
      title="Workflow Runs"
      headerActions={
        <Box sx={{ display: 'flex', gap: 1 }}>
          {isMobile ? (
            <>
              <IconButton
                onClick={() => loadPaginatedWorkflows(null, true)}
                disabled={isLoading}
                className={isLoading ? 'loading' : ''}
                size="medium"
                sx={{
                  backgroundColor: 'var(--bg-paper)',
                  border: '1px solid var(--border-color)',
                  boxShadow: 'var(--shadow-sm)',
                  color: 'var(--text-secondary)',
                  '&:hover': {
                    backgroundColor: 'var(--bg-hover)',
                  }
                }}
              >
                <RefreshIcon className={isLoading ? 'spin-icon' : ''} />
              </IconButton>

              {statusFilter === 'running' && (
                <IconButton
                  onClick={openConfirmTerminate}
                  disabled={isLoading || isTerminatingAll}
                  size="medium"
                  sx={{
                    backgroundColor: 'var(--bg-paper)',
                    border: '1px solid var(--border-color)',
                    boxShadow: 'var(--shadow-sm)',
                    color: 'error.main',
                    '&:hover': {
                      backgroundColor: 'var(--bg-hover)',
                    }
                  }}
                >
                  <StopCircleIcon />
                </IconButton>
              )}
            </>
          ) : (
            <>
              <Button
                onClick={() => loadPaginatedWorkflows(null, true)}
                disabled={isLoading}
                className={`button-refresh ${isLoading ? 'loading' : ''}`}
                startIcon={<RefreshIcon />}
                size="small"
              >
                <span>Refresh</span>
              </Button>

              {statusFilter === 'running' && (
                <Button
                  onClick={openConfirmTerminate}
                  disabled={isLoading || isTerminatingAll}
                  color="error"
                  variant="outlined"
                  startIcon={<StopCircleIcon />}
                  size="small"
                >
                  Terminate All
                </Button>
              )}
            </>
          )}
        </Box>
      }
    >

      {/* Hint message for newly activated workflow */}
      <Collapse in={showHint}>
        <Box sx={{ mb: 2 }}>
          <Alert 
            severity="success" 
            icon={<CheckCircleIcon />}
            onClose={() => setShowHint(false)}
            sx={{
              borderRadius: 2,
              backgroundColor: 'rgba(76, 175, 80, 0.08)',
              border: '1px solid rgba(76, 175, 80, 0.2)',
              color: 'text.primary',
              '& .MuiAlert-icon': {
                color: 'success.main'
              }
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Workflow activated successfully!{' '}
                              <Button
                  onClick={() => loadPaginatedWorkflows(null, true)}
                  disabled={isLoading}
                  size="small"
                  variant="text"
                  sx={{
                  minWidth: 'auto',
                  p: 0,
                  textTransform: 'none',
                  fontWeight: 600,
                  color: 'success.main',
                  textDecoration: 'underline',
                  '&:hover': {
                    backgroundColor: 'transparent',
                    textDecoration: 'underline'
                  }
                }}
              >
                Refresh now
              </Button>{' '}
              to see the newly activated flow. It can take a few seconds to appear.
            </Typography>
          </Alert>
        </Box>
      </Collapse>

      <Box 
        className="filter-controls"
        sx={{ 
          mb: 3,
          position: 'relative',
          zIndex: 10
        }}
      >
        <PageFilters
          fullWidth
          additionalFilters={
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              gap: 2,
              width: '100%'
            }}>
              {/* First Row - Agent and Workflow Type Filters */}
              <Box sx={{ 
                display: 'flex', 
                flexDirection: isMobile ? 'column' : 'row',
                gap: 2,
                alignItems: isMobile ? 'stretch' : 'center'
              }}>
                {/* Agent Filter */}
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  gap: 1.5,
                  px: 2,
                  py: 1,
                  minWidth: isMobile ? 'auto' : '200px'
                }}>
                  <PersonIcon sx={{ fontSize: 20, color: 'var(--primary)' }} />
                  <AgentSelector
                    selectedAgent={selectedAgent}
                    onAgentChange={handleAgentChange}
                    disabled={isLoading}
                    size="small"
                    showAllOption={true}
                  />
                </Box>

                {/* Workflow Type Filter */}
                {selectedAgent && (
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    gap: 1.5,
                    px: 2,
                    py: 1,
                    minWidth: isMobile ? 'auto' : '200px'
                  }}>
                    <ViewListIcon sx={{ fontSize: 20, color: 'var(--primary)' }} />
                    <WorkflowTypeSelector
                      selectedAgent={selectedAgent}
                      selectedWorkflowType={selectedWorkflowType}
                      onWorkflowTypeChange={handleWorkflowTypeChange}
                      disabled={isLoading}
                      size="small"
                      showAllOption={true}
                    />
                  </Box>
                )}

                {/* Activation Filter */}
                <Box
                  className="filter-segment-activation"
                  sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  px: 2,
                  py: 1,
                  minWidth: isMobile ? 'auto' : '200px'
                }}>
                  <LabelIcon sx={{ fontSize: 20, color: 'var(--primary)' }} />
                  <ActivationSelector
                    selectedActivation={selectedActivation}
                    onActivationChange={handleActivationChange}
                    disabled={isLoading}
                    size="small"
                    showAllOption={true}
                  />
                </Box>

                {/* User Filter */}
                <TextField
                  size="small"
                  placeholder="Filter by user..."
                  value={userFilter}
                  onChange={handleUserChange}
                  disabled={isLoading}
                  sx={{
                    minWidth: isMobile ? 'auto' : '220px',
                    flex: isMobile ? 1 : 'none',
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-main)',
                      fontFamily: 'var(--font-family)',
                      fontSize: '0.875rem',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: 'var(--bg-paper)',
                      },
                      '&.Mui-focused': {
                        backgroundColor: 'var(--bg-paper)',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'var(--primary)',
                          borderWidth: '2px'
                        }
                      }
                    },
                    '& .MuiInputBase-input': {
                      fontFamily: 'var(--font-family)',
                      '&::placeholder': {
                        color: 'var(--text-light)',
                        opacity: 0.8
                      }
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ 
                          color: 'var(--text-light)', 
                          fontSize: '1.25rem'
                        }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              {/* Second Row - Status Filter */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: isMobile ? 'stretch' : 'flex-start'
              }}>
                <ToggleButtonGroup
                  value={statusFilter}
                  exclusive
                  onChange={handleStatusFilterChange}
                  size="small"
                  className="filter-toggle-group status-filter"
                  sx={{ 
                    borderRadius: 'var(--radius-md)',
                    width: isMobile ? '100%' : 'auto',
                    '& .MuiToggleButton-root': {
                      border: 'none',
                      borderRadius: 'var(--radius-md)',
                      px: isMobile ? 1.5 : 2,
                      py: 0.75,
                      flex: isMobile ? 1 : 'none',
                      fontSize: isMobile ? '0.75rem' : '0.875rem',
                      color: 'var(--text-secondary)',
                      fontFamily: 'var(--font-family)',
                      fontWeight: 500,
                      textTransform: 'none',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: 'var(--bg-hover)',
                        color: 'var(--text-primary)'
                      },
                      '&.Mui-selected': {
                        backgroundColor: 'var(--primary)',
                        color: 'white',
                        fontWeight: 600,
                        '&:hover': {
                          backgroundColor: 'var(--primary-dark)'
                        }
                      },
                      '&:first-of-type': {
                        borderTopLeftRadius: 'var(--radius-md)',
                        borderBottomLeftRadius: 'var(--radius-md)'
                      },
                      '&:last-of-type': {
                        borderTopRightRadius: 'var(--radius-md)',
                        borderBottomRightRadius: 'var(--radius-md)'
                      }
                    },
                    flexWrap: isSmallMobile ? 'wrap' : 'nowrap'
                  }}
                >
                  <ToggleButton value="all" className="total">
                    All
                  </ToggleButton>
                  <ToggleButton value="running" className="running">
                    Running
                  </ToggleButton>
                  <ToggleButton value="completed" className="completed">
                    Completed
                  </ToggleButton>
                  <ToggleButton value="continuedAsNew" className="continuedAsNew">
                    {isMobile ? 'Continued' : 'Continued As New'}
                  </ToggleButton>
                  <ToggleButton value="terminated" className="terminated">
                    Terminated
                  </ToggleButton>
                  <ToggleButton value="failed" className="failed">
                    Failed
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>

              {/* Third Row - Active Filters Display */}
              {(selectedAgent || selectedActivation || selectedWorkflowType || debouncedUser || (statusFilter && statusFilter !== 'all')) && (
                <Box sx={{ 
                  display: 'flex', 
                  gap: 1, 
                  flexWrap: 'wrap',
                  mt: 1 
                }}>
                  {selectedAgent && (
                    <Chip 
                      label={`Agent: ${selectedAgent}`}
                      size="small"
                      onDelete={() => handleAgentChange(null)}
                      sx={{
                        backgroundColor: 'rgba(25, 118, 210, 0.08)',
                        color: 'var(--primary-color)',
                        fontWeight: 500,
                        border: '1px solid rgba(25, 118, 210, 0.2)',
                        '& .MuiChip-deleteIcon': {
                          color: 'var(--primary-color)',
                          '&:hover': {
                            color: 'var(--primary-dark)'
                          }
                        }
                      }}
                    />
                  )}
                  {selectedActivation && (
                    <Chip 
                      label={`Activation: ${selectedActivation}`}
                      size="small"
                      onDelete={() => handleActivationChange(null)}
                      sx={{
                        backgroundColor: 'rgba(25, 118, 210, 0.08)',
                        color: 'var(--primary-color)',
                        fontWeight: 500,
                        border: '1px solid rgba(25, 118, 210, 0.2)',
                        '& .MuiChip-deleteIcon': {
                          color: 'var(--primary-color)',
                          '&:hover': {
                            color: 'var(--primary-dark)'
                          }
                        }
                      }}
                    />
                  )}
                  {selectedWorkflowType && (
                    <Chip 
                      label={`Type: ${selectedWorkflowType}`}
                      size="small"
                      onDelete={() => handleWorkflowTypeChange(null)}
                      sx={{
                        backgroundColor: 'rgba(25, 118, 210, 0.08)',
                        color: 'var(--primary-color)',
                        fontWeight: 500,
                        border: '1px solid rgba(25, 118, 210, 0.2)',
                        '& .MuiChip-deleteIcon': {
                          color: 'var(--primary-color)',
                          '&:hover': {
                            color: 'var(--primary-dark)'
                          }
                        }
                      }}
                    />
                  )}
                  {debouncedUser && (
                    <Chip 
                      label={`User: ${debouncedUser}`}
                      size="small"
                      onDelete={() => {
                        setUserFilter('');
                        setDebouncedUser('');
                      }}
                      sx={{
                        backgroundColor: 'rgba(25, 118, 210, 0.08)',
                        color: 'var(--primary-color)',
                        fontWeight: 500,
                        border: '1px solid rgba(25, 118, 210, 0.2)',
                        '& .MuiChip-deleteIcon': {
                          color: 'var(--primary-color)',
                          '&:hover': {
                            color: 'var(--primary-dark)'
                          }
                        }
                      }}
                    />
                  )}
                  {statusFilter && statusFilter !== 'all' && (
                    <Chip 
                      label={`Status: ${statusFilter === 'continuedAsNew' ? 'Continued As New' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}`}
                      size="small"
                      onDelete={() => handleStatusFilterChange(null, 'all')}
                      sx={{
                        backgroundColor: 'rgba(25, 118, 210, 0.08)',
                        color: 'var(--primary-color)',
                        fontWeight: 500,
                        border: '1px solid rgba(25, 118, 210, 0.2)',
                        '& .MuiChip-deleteIcon': {
                          color: 'var(--primary-color)',
                          '&:hover': {
                            color: 'var(--primary-dark)'
                          }
                        }
                      }}
                    />
                  )}
                </Box>
              )}
            </Box>
          }
        />
      </Box>

      <Box sx={{ position: 'relative', zIndex: 1 }}>
        {hasWorkflows ? (
          <Paper 
            elevation={0}
            sx={{ 
              borderRadius: 3,
              bgcolor: 'background.paper',
              border: '1px solid var(--border-color)',
              overflow: 'hidden'
            }}
          >
            {/* Results Header */}
            <Box sx={{ 
              px: isMobile ? 2 : 3, 
              py: 1.5,
              backgroundColor: 'var(--bg-muted)',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                {(() => {
                  const filters = [];
                  if (selectedAgent) filters.push(`agent "${selectedAgent}"`);
                  if (selectedActivation) filters.push(`activation "${selectedActivation}"`);
                  if (selectedWorkflowType) filters.push(`type "${selectedWorkflowType}"`);
                  if (debouncedUser) filters.push(`user "${debouncedUser}"`);
                  
                  return filters.length > 0 
                    ? `Showing runs for ${filters.join(', ')}`
                    : 'Showing all workflow runs';
                })()}
              </Typography>
            </Box>

            {isTerminatingAll && (
              <Box sx={{
                px: isMobile ? 2 : 3,
                py: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                color: 'error.main',
                borderBottom: '1px dashed var(--border-color)'
              }}>
                <StopCircleIcon fontSize="small" />
                <Typography variant="body2">
                  Terminating {terminateProgress.completed}/{terminateProgress.total} running workflow{terminateProgress.total === 1 ? '' : 's'}...
                </Typography>
              </Box>
            )}

            {/* Workflows List */}
            <Box sx={{ 
              minHeight: 200, // Ensure consistent height during loading
              position: 'relative'
            }}>
              {isLoading ? (
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  minHeight: 200,
                  color: 'text.secondary'
                }}>
                  <Typography variant="body2">Loading workflow runs...</Typography>
                </Box>
              ) : (
                workflows.map((workflow, index) => {
                  try {
                    return (
                      <WorkflowRunCard
                        key={`${workflow.workflowId}-${workflow.runId}-${index}`}
                        workflow={workflow}
                        isFirst={index === 0}
                        isLast={index === workflows.length - 1}
                        showAgent={!selectedAgent}
                        isMobile={isMobile}
                      />
                    );
                  } catch (error) {
                    console.error('Error rendering WorkflowRunCard:', error);
                    return (
                      <div key={`error-${index}`} style={{ padding: '20px', textAlign: 'center' }}>
                        Error loading workflow card. Please refresh the page.
                      </div>
                    );
                  }
                })
              )}
            </Box>
            
            {/* Pagination Controls */}
            <Divider />
            <PaginationControls
              currentPage={currentPage}
              pageSize={pageSize}
              hasNextPage={hasNextPage}
              hasPreviousPage={currentPage > 1}
              totalCount={null}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              loading={isLoading}
              itemName="workflow runs"
            />
          </Paper>
        ) : (
          <EmptyState
            title={isLoading ? 'Loading Workflow Runs...' : (selectedAgent || selectedActivation || debouncedUser) ? 'No Workflow Runs Found' : 'No Workflow Runs Found'}
            description={(selectedAgent || selectedActivation || debouncedUser) ? 
              'Try changing the filters or check if workflows have been started matching your criteria.' :
              'To get started, navigate to Flow Definitions to create and activate new workflow definitions.'}
            context="runs"
            actions={[
              {
                label: 'Refresh',
                onClick: () => loadPaginatedWorkflows(null, true),
                variant: 'contained',
                startIcon: <RefreshIcon />,
                disabled: isLoading
              },
              {
                label: 'Go to Agents',
                onClick: () => window.location.href = '/manager/definitions',
                variant: 'outlined'
              }
            ]}
          />  
        )}
      </Box>

      {/* Confirm bulk terminate */}
      <ConfirmationDialog
        open={confirmTerminateOpen}
        title={(() => {
          const filters = [];
          if (selectedAgent) filters.push(`"${selectedAgent}"`);
          if (selectedActivation) filters.push(`Activation: "${selectedActivation}"`);
          if (selectedWorkflowType) filters.push(`Type: "${selectedWorkflowType}"`);
          if (debouncedUser) filters.push(`User: "${debouncedUser}"`);
          
          return filters.length > 0 
            ? `Terminate all running for ${filters.join(', ')}?`
            : 'Terminate all running workflows?';
        })()}
        message={(() => {
          const filters = [];
          if (selectedAgent) filters.push('agent');
          if (selectedActivation) filters.push('activation');
          if (selectedWorkflowType) filters.push('workflow type');
          if (debouncedUser) filters.push('user');
          
          return filters.length > 0
            ? `This will send terminate requests for all currently running workflows for the selected ${filters.join(', ')}. This action cannot be undone.`
            : 'This will send terminate requests for all currently running workflows you have access to. This action cannot be undone.';
        })()}
        confirmLabel="Terminate all"
        cancelLabel="Cancel"
        severity="error"
        onConfirm={handleTerminateAll}
        onCancel={closeConfirmTerminate}
      />
    </PageLayout>
  );
};

export default WorkflowList; 