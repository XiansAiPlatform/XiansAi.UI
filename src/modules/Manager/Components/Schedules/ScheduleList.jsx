import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Chip,
  Button,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Pagination
} from '@mui/material';
import { formatDistanceToNow, format, isBefore, addHours } from 'date-fns';
import RefreshIcon from '@mui/icons-material/Refresh';
import ScheduleIcon from '@mui/icons-material/Schedule';
import ScheduleDetails from './ScheduleDetails';
import { useScheduleApi } from '../../services';
import { useNotification } from '../../contexts/NotificationContext';
import { useLoading } from '../../contexts/LoadingContext';
import { useSlider } from '../../contexts/SliderContext';
import { handleApiError } from '../../utils/errorHandler';
import PageLayout from '../Common/PageLayout';
import PageFilters from '../Common/PageFilters';
import EmptyState from '../Common/EmptyState';
import StatusChip from '../Common/StatusChip';
import './Schedules.css';
import { ReactComponent as AgentIcon } from '../../theme/agent.svg';

const ScheduleList = () => {
  const [schedules, setSchedules] = useState([]);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedWorkflow, setSelectedWorkflow] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);

  const { setLoading, isLoading } = useLoading();
  const { showError, showSuccess } = useNotification();
  const { openSlider, closeSlider } = useSlider();
  const api = useScheduleApi();

  // Filter schedules based on search and filters (memoized for performance)
  const filteredSchedules = useMemo(() => {
    return schedules.filter(schedule => {
      const matchesSearch = !searchQuery || 
        schedule.agentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        schedule.workflowType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        schedule.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesAgent = !selectedAgent || schedule.agentName === selectedAgent;
      const matchesStatus = !selectedStatus || schedule.status === selectedStatus;
      const matchesWorkflow = !selectedWorkflow || schedule.workflowType === selectedWorkflow;
      
      return matchesSearch && matchesAgent && matchesStatus && matchesWorkflow;
    });
  }, [schedules, searchQuery, selectedAgent, selectedStatus, selectedWorkflow]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredSchedules.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedSchedules = filteredSchedules.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedAgent, selectedStatus, selectedWorkflow]);

  // Handle edge case where current page is beyond available pages after filtering
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(Math.max(1, totalPages));
    }
  }, [currentPage, totalPages]);

  const loadSchedules = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await api.getSchedules();
      setSchedules(data);
      
      if (data.length === 0) {
        showSuccess('No schedules found. Schedules will appear here when agents create them.');
      }
    } catch (error) {
      console.error('Failed to load schedules:', error);
      const errorMessage = handleApiError(error, 'loading schedules');
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [api, setLoading, showError, showSuccess]);

  useEffect(() => {
    loadSchedules();
  }, [loadSchedules]);

  const handleScheduleClick = (schedule) => {
    openSlider(
      <ScheduleDetails
        schedule={schedule}
        onClose={closeSlider}
        onUpdate={loadSchedules}
        onDelete={() => {
          setSchedules(prev => prev.filter(s => s.id !== schedule.id));
        }}
      />,
      `${schedule.agentName}`
    );
  };

  const handlePageChange = (event, newPage) => {
    setCurrentPage(newPage);
    // Scroll to top when page changes for better UX
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (event) => {
    const newItemsPerPage = parseInt(event.target.value, 10);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  // Keyboard navigation for pagination
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'ArrowLeft':
            if (currentPage > 1) {
              event.preventDefault();
              setCurrentPage(prev => prev - 1);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
            break;
          case 'ArrowRight':
            if (currentPage < totalPages) {
              event.preventDefault();
              setCurrentPage(prev => prev + 1);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentPage, totalPages]);

  const getNextRunStatus = (schedule) => {
    if (!schedule.nextRunTime) return 'No runs scheduled';
    
    try {
      const nextRun = new Date(schedule.nextRunTime);
      const now = new Date();
      
      if (isBefore(nextRun, now)) {
        return 'Overdue';
      }
      
      if (isBefore(nextRun, addHours(now, 1))) {
        return 'Soon';
      }
      
      return 'Scheduled';
    } catch (error) {
      return 'Unknown';
    }
  };

  const getRunStatusColor = (status) => {
    switch (status) {
      case 'Soon': return 'warning';
      case 'Overdue': return 'error';
      case 'Scheduled': return 'primary';
      default: return 'default';
    }
  };

  const mapScheduleStatusForChip = (status) => {
    // Map schedule status to the format expected by StatusChip
    switch (status) {
      case 'Running': return 'running';
      case 'Suspended': return 'suspended';
      case 'Failed': return 'failed';
      case 'Completed': return 'completed';
      case 'Canceled': return 'canceled';
      case 'Terminated': return 'terminated';
      case 'TimedOut': return 'timedout';
      case 'ContinuedAsNew': return 'continuedAsNew';
      default: return 'unknown';
    }
  };

  const formatTimeAgo = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return 'Unknown';
    }
  };

  const formatDateTime = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    } catch (error) {
      return 'Unknown';
    }
  };

  const formatScheduleName = (workflowType) => {
    return `${workflowType}`;
  };

  // Get unique values for filters (memoized for performance)
  const uniqueAgents = useMemo(() => [...new Set(schedules.map(s => s.agentName))], [schedules]);
  const uniqueStatuses = useMemo(() => [...new Set(schedules.map(s => s.status))], [schedules]);
  const uniqueWorkflows = useMemo(() => [...new Set(schedules.map(s => s.workflowType))], [schedules]);

  const renderScheduleItem = (schedule) => {
    const nextRunStatus = getNextRunStatus(schedule);
    
    return (
      <Box
        key={schedule.id}
        className="schedule-card"
        onClick={() => handleScheduleClick(schedule)}
        sx={{
          borderRadius: 2,
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            transform: 'translateY(-2px)'
          },
          mb: 2,
          border: '1px solid',
          borderColor: 'divider',
          cursor: 'pointer',
          backgroundColor: 'background.paper',
          p: 3
        }}
      >
        {/* Header */}
        <Box className="schedule-header" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'white',
              borderRadius: '50%',
              p: 1,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <AgentIcon style={{ 
                width: 32, 
                height: 32,
                opacity: 0.85 
              }} />
            </Box>
            <Box>
              <Typography variant="h6" className="schedule-name" sx={{ fontWeight: 600, mb: 0.5 }}>
                {formatScheduleName(schedule.workflowType)}
              </Typography>
              {schedule.description && (
                <Typography variant="body2" color="text.secondary">
                  {schedule.description}
                </Typography>
              )}
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <StatusChip 
              label={schedule.status}
              status={mapScheduleStatusForChip(schedule.status)}
            />
          </Box>
        </Box>

        {/* Schedule info chips */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, ml: 6 }}>
          <Chip
            size="small"
            label={schedule.agentName}
            variant="outlined"
            className="schedule-chip"
            sx={{ fontWeight: 500 }}
          />
          <Chip
            size="small"
            label={schedule.workflowType}
            variant="outlined"
            className="schedule-chip"
            sx={{ fontWeight: 500 }}
          />
          <Chip
            size="small"
            label={nextRunStatus}
            color={getRunStatusColor(nextRunStatus)}
            variant="outlined"
            className="schedule-chip"
            sx={{ fontWeight: 500 }}
          />
        </Box>

        {/* Key metrics */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', ml: 6, mb: 1 }}>
          <Box sx={{ display: 'flex', gap: 4 }}>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, display: 'block' }}>
                Next Run
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {schedule.nextRunTime ? formatTimeAgo(schedule.nextRunTime) : 'Not scheduled'}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, display: 'block' }}>
                Last Run
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {schedule.lastRunTime ? formatTimeAgo(schedule.lastRunTime) : 'Never'}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, display: 'block' }}>
                Total Executions
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {schedule.executionCount?.toLocaleString() || '0'}
              </Typography>
            </Box>
          </Box>
          
          <Typography variant="caption" color="text.secondary">
            Created: {formatDateTime(schedule.createdAt)}
          </Typography>
        </Box>
      </Box>
    );
  };

  const headerActions = (
    <PageFilters
      searchValue={searchQuery}
      onSearchChange={(e) => setSearchQuery(e.target.value)}
      searchPlaceholder="Search schedules..."
      additionalFilters={
        <>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Agent</InputLabel>
            <Select
              value={selectedAgent}
              label="Agent"
              onChange={(e) => setSelectedAgent(e.target.value)}
            >
              <MenuItem value=""><em>All Agents</em></MenuItem>
              {uniqueAgents.map(agent => (
                <MenuItem key={agent} value={agent}>{agent}</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={selectedStatus}
              label="Status"
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <MenuItem value=""><em>All Statuses</em></MenuItem>
              {uniqueStatuses.map(status => (
                <MenuItem key={status} value={status}>{status}</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Workflow</InputLabel>
            <Select
              value={selectedWorkflow}
              label="Workflow"
              onChange={(e) => setSelectedWorkflow(e.target.value)}
            >
              <MenuItem value=""><em>All Workflows</em></MenuItem>
              {uniqueWorkflows.map(workflow => (
                <MenuItem key={workflow} value={workflow}>{workflow}</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadSchedules}
            disabled={isLoading}
            size="small"
          >
            Refresh
          </Button>
          
          <FormControl size="small" sx={{ minWidth: 100 }}>
            <InputLabel>Per Page</InputLabel>
            <Select
              value={itemsPerPage}
              label="Per Page"
              onChange={handleItemsPerPageChange}
            >
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={15}>15</MenuItem>
              <MenuItem value={25}>25</MenuItem>
              <MenuItem value={50}>50</MenuItem>
              <MenuItem value={100}>100</MenuItem>
            </Select>
          </FormControl>
        </>
      }
    />
  );

  if (error && schedules.length === 0) {
    return (
      <PageLayout 
        title="Schedules"
        subtitle="Manage and monitor your workflow schedules"
      >
        <Box sx={{ p: 3 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Button 
            variant="contained" 
            onClick={loadSchedules}
            startIcon={<RefreshIcon />}
            disabled={isLoading}
          >
            Retry
          </Button>
        </Box>
      </PageLayout>
    );
  }

  return (
    <PageLayout 
      title="Schedules"
      subtitle={`${filteredSchedules.length} schedule${filteredSchedules.length !== 1 ? 's' : ''}`}
      headerActions={headerActions}
    >
      {error && schedules.length > 0 && (
        <Box sx={{ p: 3, pb: 0 }}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            {error}
          </Alert>
        </Box>
      )}

      {isLoading ? (
        <Box sx={{ p: 6, textAlign: 'center' }}>
          <CircularProgress />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Loading schedules...
          </Typography>
        </Box>
      ) : filteredSchedules.length > 0 ? (
        <>
          <Box className="schedule-list" sx={{ p: 3, minHeight: '400px' }}>
            {paginatedSchedules.map(schedule => renderScheduleItem(schedule))}
          </Box>
          {totalPages > 1 && (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              gap: 2,
              p: 3, 
              pt: 1,
              borderTop: '1px solid',
              borderColor: 'divider',
              flexWrap: 'wrap'
            }}>
              <Typography variant="body2" color="text.secondary">
                Showing {startIndex + 1}-{Math.min(endIndex, filteredSchedules.length)} of {filteredSchedules.length} schedules
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Page {currentPage} of {totalPages}
                </Typography>
                <Pagination 
                  count={totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  color="primary"
                  showFirstButton
                  showLastButton
                  size="small"
                  siblingCount={1}
                  boundaryCount={1}
                />
              </Box>
            </Box>
          )}
        </>
      ) : (
        <Box sx={{ p: 3 }}>
          <EmptyState
            icon={<ScheduleIcon sx={{ fontSize: 64, color: 'text.secondary' }} />}
            title="No schedules found"
            description={
              searchQuery || selectedAgent || selectedStatus || selectedWorkflow
                ? "Try adjusting your filters to see more schedules."
                : "Schedules will appear here when agents create scheduled workflows."
            }
            action={
              (searchQuery || selectedAgent || selectedStatus || selectedWorkflow) && (
                <Button 
                  variant="outlined" 
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedAgent('');
                    setSelectedStatus('');
                    setSelectedWorkflow('');
                  }}
                >
                  Clear Filters
                </Button>
              )
            }
          />
        </Box>
      )}
    </PageLayout>
  );
};

export default ScheduleList;