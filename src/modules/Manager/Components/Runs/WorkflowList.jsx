import { useState, useEffect, useMemo } from 'react';
import { 
  Container, 
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
  Divider
} from '@mui/material';
import { useWorkflowApi } from '../../services/workflow-api';
import RefreshIcon from '@mui/icons-material/Refresh';
import PersonIcon from '@mui/icons-material/Person';
import { useLoading } from '../../contexts/LoadingContext';
import AgentSelector from './AgentSelector';
import PaginationControls from './PaginationControls';
import WorkflowRunCard from './WorkflowRunCard';
import './WorkflowList.css';
import { Link, useLocation } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const WorkflowList = () => {  
  // New pagination state
  const [workflows, setWorkflows] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [statusFilter, setStatusFilter] = useState('running');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [showHint, setShowHint] = useState(false);
  
  const location = useLocation();
  const isMobile = useMediaQuery('(max-width:768px)');
  const isSmallMobile = useMediaQuery('(max-width:480px)');

  const { setLoading, isLoading } = useLoading();
  const api = useWorkflowApi();

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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Reset to page 1 and reload when filters change
    setCurrentPage(1);
    loadPaginatedWorkflows(null, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, selectedAgent, pageSize]);

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

  return (
    <Container className="workflow-list-container" disableGutters={isMobile} maxWidth={isMobile ? false : "lg"}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'row',
        mb: isMobile ? 2 : 3,
        mt: isMobile ? 0.5 : 2,
        px: isMobile ? 2 : 0
      }}>
        <Typography 
          variant={isMobile ? "h5" : "h4"} 
          component="h1"
          sx={{
            fontWeight: 'var(--font-weight-semibold)',
            letterSpacing: 'var(--letter-spacing-tight)',
            color: 'var(--text-primary)',
          }}
        >
          Agent Runs
        </Typography>
        
        {isMobile ? (
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
        ) : (
          <Button
            onClick={() => loadPaginatedWorkflows(null, true)}
            disabled={isLoading}
            className={`button-refresh ${isLoading ? 'loading' : ''}`}
            startIcon={<RefreshIcon />}
            size="small"
          >
            <span>Refresh</span>
          </Button>
        )}
      </Box>

      {/* Hint message for newly activated workflow */}
      <Collapse in={showHint}>
        <Box sx={{ px: isMobile ? 2 : 0, mb: 2 }}>
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
          display: 'flex', 
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          mb: 3,
          flexDirection: 'column',
          gap: 2,
          px: isMobile ? 2 : 0,
          width: '100%',
          overflowX: 'auto',
          position: 'relative',
          zIndex: 10
        }}
      >
        {/* Agent Selector */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          gap: 2,
          width: '100%',
          p: 2,
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 2,
          border: '1px solid var(--border-color)',
          transition: 'all 0.2s ease',
          '&:hover': {
            borderColor: 'var(--border-hover)',
            boxShadow: 'var(--shadow-sm)',
          }
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            color: 'var(--text-secondary)'
          }}>
            <PersonIcon sx={{ fontSize: 18 }} />
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                minWidth: 'max-content',
                fontWeight: 500,
                fontSize: isMobile ? '0.8rem' : '0.875rem'
              }}
            >
              {isMobile ? 'Agent' : 'Filter by Agent'}
            </Typography>
          </Box>
          <AgentSelector
            selectedAgent={selectedAgent}
            onAgentChange={handleAgentChange}
            disabled={isLoading}
            size="small"
            showAllOption={true}
          />
        </Box>

        {/* Status Filter */}
        <Box sx={{ 
          display: 'flex', 
          gap: 1,
          flexWrap: isSmallMobile ? 'wrap' : 'nowrap',
          width: '100%',
          alignItems: 'center'
        }}>
          <Typography variant="body2" color="text.secondary" sx={{ minWidth: 'max-content', mr: 1 }}>
            Status:
          </Typography>
          <ToggleButtonGroup
            value={statusFilter}
            exclusive
            onChange={handleStatusFilterChange}
            size="small"
            className="filter-toggle-group status-filter"
            sx={{ 
              minWidth: isMobile ? 'max-content' : 'auto',
              '& .MuiToggleButton-root': {
                px: isMobile ? 1 : 2
              },
              zIndex: 2
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
              Continued As New
            </ToggleButton>
            <ToggleButton value="terminated" className="terminated">
              Terminated
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      <Box sx={{ px: isMobile ? 2 : 0, position: 'relative', zIndex: 1 }}>
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
                {selectedAgent ? `Showing runs for "${selectedAgent}"` : 'Showing all workflow runs'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {workflows.length} {workflows.length === 1 ? 'run' : 'runs'} on page {currentPage}
              </Typography>
            </Box>

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
          <Paper 
            elevation={0}
            className="empty-state-container"
            sx={{ 
              textAlign: 'center', 
              py: isMobile ? 4 : 8, 
              px: isMobile ? 2 : 4,
              borderRadius: 3,
              bgcolor: 'background.paper',
              border: '1px solid var(--border-color)'
            }}
          >
            <Typography variant="h6" gutterBottom>
              {isLoading ? 'Loading workflow runs...' : selectedAgent ? `No workflow runs found for "${selectedAgent}"` : 'No workflow runs found'}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              {selectedAgent ? 
                'Try changing the status filter, selecting a different agent, or check if workflows have been started for this agent.' :
                <>To get started, <Link to="/manager/definitions" style={{ color: 'var(--primary-color)' }}>navigate to Flow Definitions</Link> to create and activate new workflow definitions.</>
              }
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                onClick={() => loadPaginatedWorkflows(null, true)}
                variant="contained"
                color="primary"
                disabled={isLoading}
                startIcon={<RefreshIcon />}
              >
                Refresh
              </Button>
              <Button
                component={Link}
                to="/manager/definitions"
                variant="outlined"
                color="primary"
              >
                Go to Agent Definitions
              </Button>
            </Box>
          </Paper>  
        )}
      </Box>
    </Container>
  );
};

export default WorkflowList; 