import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Container, 
  Typography, 
  Box,
  Paper,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  useMediaQuery,
  IconButton
} from '@mui/material';
import { useWorkflowApi } from '../../services/workflow-api';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useLoading } from '../../contexts/LoadingContext';
import WorkflowAccordion from './WorkflowAccordion';
import './WorkflowList.css';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';

const WorkflowList = () => {  
  const [agentGroups, setAgentGroups] = useState([]);
  const [ownerFilter, setOwnerFilter] = useState('mine');
  const [timeFilter, setTimeFilter] = useState('30days');
  const [statusFilter, setStatusFilter] = useState('running');
  const [autoRefreshCount, setAutoRefreshCount] = useState(0);
  const { user } = useAuth();
  const isMobile = useMediaQuery('(max-width:768px)');
  const isSmallMobile = useMediaQuery('(max-width:480px)');

  const { setLoading, isLoading } = useLoading();
  const api = useWorkflowApi();

  const filterAgentGroups = useCallback((agentGroups) => {
    if (!agentGroups || !Array.isArray(agentGroups)) return [];
    
    return agentGroups
      .map(group => {
        const filteredWorkflows = (group.workflows || []).filter(workflow => {
          return ownerFilter === 'all' || (ownerFilter === 'mine' && workflow.owner === user?.id);
        });
        
        if (filteredWorkflows.length > 0) {
          return {
            ...group,
            workflows: filteredWorkflows.sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
          };
        }
        return null;
      })
      .filter(Boolean);
  }, [ownerFilter, user?.id]);

  const loadWorkflows = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.fetchWorkflowRuns(timeFilter, ownerFilter, statusFilter);
      
      if (data && Array.isArray(data) && data.length > 0) {
        // Validate that each item in the array has the expected structure
        const validData = data.filter(item => 
          item && 
          typeof item === 'object' && 
          item.agent && 
          Array.isArray(item.workflows)
        );
        
        if (validData.length > 0) {
          const filteredGroups = filterAgentGroups(validData);
          setAgentGroups(filteredGroups);
        } else {
          console.warn('No valid agent groups found in server response');
          setAgentGroups([]);
        }
      } else {
        setAgentGroups([]);
      }
    } catch (error) {
      console.error('Error loading workflows:', error);
      setAgentGroups([]);
    } finally {
      setLoading(false);
    }
  }, [filterAgentGroups, setLoading, api, timeFilter, ownerFilter, statusFilter]);

  useEffect(() => {
    loadWorkflows();
  }, [loadWorkflows]);

  // Auto-refresh effect - runs every 5 seconds for 3 times
  useEffect(() => {
    let timeoutId;
    
    const scheduleNextRefresh = () => {
      if (autoRefreshCount < 2) {
        timeoutId = setTimeout(() => {
          loadWorkflows();
          setAutoRefreshCount(count => count + 1);
        }, 10000);
      }
    };
    
    // Start the auto-refresh cycle
    scheduleNextRefresh();
    
    // Cleanup timeout on unmount or when auto-refresh is complete
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [autoRefreshCount, loadWorkflows]);

  const hasWorkflows = useMemo(() => {
    return agentGroups.length > 0;
  }, [agentGroups]);

  const handleOwnerFilterChange = (event, newOwnerFilter) => {
    if (newOwnerFilter !== null) {
      setOwnerFilter(newOwnerFilter);
    }
  };

  const handleTimeFilterChange = (event, newTimeFilter) => {
    if (newTimeFilter !== null) {
      setTimeFilter(newTimeFilter);
    }
  };

  const handleStatusFilterChange = (event, newStatusFilter) => {
    if (newStatusFilter !== null) {
      setStatusFilter(newStatusFilter);
    }
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
            onClick={loadWorkflows}
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
            onClick={loadWorkflows}
            disabled={isLoading}
            className={`button-refresh ${isLoading ? 'loading' : ''}`}
            startIcon={<RefreshIcon />}
            size="small"
          >
            <span>Refresh</span>
          </Button>
        )}
      </Box>

      <Box 
        className="filter-controls"
        sx={{ 
          display: 'flex', 
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          mb: 3,
          flexDirection: 'column',
          gap: 1.5,
          px: isMobile ? 2 : 0,
          width: '100%',
          overflowX: 'auto',
          position: 'relative',
          zIndex: 10
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          gap: 1,
          flexWrap: isSmallMobile ? 'wrap' : 'nowrap',
          width: '100%'
        }}>
          <ToggleButtonGroup
            value={ownerFilter}
            exclusive
            onChange={handleOwnerFilterChange}
            size="small"
            className="filter-toggle-group owner-filter"
            sx={{ flexGrow: isSmallMobile ? 1 : 0, zIndex: 2 }}
          >
            <ToggleButton value="mine">Mine</ToggleButton>
            <ToggleButton value="all">All</ToggleButton>
          </ToggleButtonGroup>

          <ToggleButtonGroup
            value={timeFilter}
            exclusive
            onChange={handleTimeFilterChange}
            size="small"
            className="filter-toggle-group time-filter"
            sx={{ flexGrow: isSmallMobile ? 1 : 0, zIndex: 2 }}
          >
            <ToggleButton value="7days">7 Days</ToggleButton>
            <ToggleButton value="30days">30 Days</ToggleButton>
            <ToggleButton value="all">All</ToggleButton>
          </ToggleButtonGroup>

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
          agentGroups.map((agentGroup) => {
            return (
              <WorkflowAccordion
                key={agentGroup.agent?.id || agentGroup.agent?.name}
                agentInfo={agentGroup.agent}
                runs={agentGroup.workflows}
                isMobile={isMobile}
              />
            );
          })
        ) : (
          <Paper 
            elevation={0}
            className="empty-state-container"
            sx={{ 
              textAlign: 'center', 
              py: isMobile ? 4 : 8, 
              px: isMobile ? 2 : 4,
              borderRadius: 3,
              bgcolor: 'background.paper' 
            }}
          >
            <Typography variant="h6" gutterBottom>
              {isLoading ? 'Loading...' : 'It can take a few seconds to load the workflows'}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              To get started, <Link to="/definitions">navigate to Flow Definitions</Link> to create and start new workflows.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                onClick={loadWorkflows}
                variant="contained"
                color="primary"
                disabled={isLoading}
                startIcon={<RefreshIcon />}
              >
                Refresh
              </Button>
              <Button
                component={Link}
                to="/definitions"
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