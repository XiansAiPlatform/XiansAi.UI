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
import { useAuth } from '../../../auth/AuthContext';

const INITIAL_STATS = {
  running: 0,
  completed: 0,
  terminated: 0,
  continuedAsNew: 0,
  total: 0
};


const WorkflowList = () => {  
  const [workflows, setWorkflows] = useState({});
  const [stats, setStats] = useState(INITIAL_STATS);
  const [ownerFilter, setOwnerFilter] = useState('mine');
  const [timeFilter, setTimeFilter] = useState('30days');
  const [statusFilter, setStatusFilter] = useState('running');
  const { user } = useAuth();
  const isMobile = useMediaQuery('(max-width:768px)');
  const isSmallMobile = useMediaQuery('(max-width:480px)');

  const { setLoading, isLoading } = useLoading();
  const api = useWorkflowApi();

  const calculateStats = useCallback((runs) => {
    return runs.reduce((acc, run) => {
      acc.total++;
      const status = (run.status || '').toUpperCase();
      if (status === 'TERMINATED' || status === 'CANCELED') {
        acc.terminated++;
      } else if (status === 'CONTINUEDASNEW') {
        acc.continuedAsNew++;
      } else if (acc[status.toLowerCase()] !== undefined) {
        acc[status.toLowerCase()]++;
      }
      return acc;
    }, { ...INITIAL_STATS });
  }, []);

  const groupWorkflows = useCallback((runs) => {
    return runs
      .filter(run => ownerFilter === 'all' || (ownerFilter === 'mine' && run.owner === user?.id))
      .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
      .reduce((acc, run) => {
        const groupKey = run.agent;
        if (!acc[groupKey]) {
          acc[groupKey] = [];
        }
        acc[groupKey].push(run);
        return acc;
      }, {});
  }, [ownerFilter, user?.id]);

  const loadWorkflows = useCallback(async () => {
    setLoading(true);
    try {
      const runs = await api.fetchWorkflowRuns(timeFilter, ownerFilter, statusFilter);
      if (runs && runs.length > 0) {
        setStats(calculateStats(runs));
        setWorkflows(groupWorkflows(runs));
      } else {
        setWorkflows({});
        setStats(INITIAL_STATS);
      }
    } catch (error) {
      console.error('Error loading workflows:', error);
      setWorkflows({});
      setStats(INITIAL_STATS);
    } finally {
      setLoading(false);
    }
  }, [calculateStats, groupWorkflows, setLoading, api, timeFilter, ownerFilter, statusFilter]);

  useEffect(() => {
    loadWorkflows();
  }, [loadWorkflows]);

  const hasWorkflows = useMemo(() => {
    return Object.keys(workflows).length > 0;
  }, [workflows]);

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
              Running {stats.running > 0 && `(${stats.running})`}
            </ToggleButton>
            <ToggleButton value="completed" className="completed">
              Completed {stats.completed > 0 && `(${stats.completed})`}
            </ToggleButton>
            <ToggleButton value="continuedAsNew" className="continuedAsNew">
              Continued As New {stats.continuedAsNew > 0 && `(${stats.continuedAsNew})`}
            </ToggleButton>
            <ToggleButton value="terminated" className="terminated">
              Terminated {stats.terminated > 0 && `(${stats.terminated})`}
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      <Box sx={{ px: isMobile ? 2 : 0, position: 'relative', zIndex: 1 }}>
        {hasWorkflows ? (
          Object.entries(workflows).map(([type, runs]) => {
            return (
              <WorkflowAccordion
                key={type}
                type={type}
                runs={runs}
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
              {isLoading ? 'Loading...' : 'Find Your Flow Runs here'}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              To get started, <Link to="/definitions">navigate to Flow Definitions</Link> to create and start new workflows.
            </Typography>
            <Button
              component={Link}
              to="/definitions"
              variant="contained"
              color="primary"
            >
              Go to Agent Definitions
            </Button>
          </Paper>
        )}
      </Box>
    </Container>
  );
};

export default WorkflowList; 