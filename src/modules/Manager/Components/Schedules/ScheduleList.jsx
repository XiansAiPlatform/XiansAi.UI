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
  Pagination,
  Card,
  CardContent,
  Paper,
  IconButton,
  useMediaQuery
} from '@mui/material';
import { formatDistanceToNow, isBefore, addHours } from 'date-fns';
import RefreshIcon from '@mui/icons-material/Refresh';
import ScheduleIcon from '@mui/icons-material/Schedule';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import HistoryIcon from '@mui/icons-material/History';
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

  const isMobile = useMediaQuery('(max-width:768px)');
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


  const formatScheduleName = (workflowType) => {
    return `${workflowType}`;
  };

  // Get unique values for filters (memoized for performance)
  const uniqueAgents = useMemo(() => [...new Set(schedules.map(s => s.agentName))], [schedules]);
  const uniqueStatuses = useMemo(() => [...new Set(schedules.map(s => s.status))], [schedules]);
  const uniqueWorkflows = useMemo(() => [...new Set(schedules.map(s => s.workflowType))], [schedules]);

  const renderScheduleItem = (schedule, index) => {
    const nextRunStatus = getNextRunStatus(schedule);
    
    return (
      <Card
        key={schedule.id}
        elevation={0}
        className="schedule-card"
        onClick={() => handleScheduleClick(schedule)}
        sx={{
          border: 'none',
          borderRadius: 'var(--radius-md)',
          borderTop: index === 0 ? 'none' : '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-paper)',
          margin: '4px 0',
          '&:hover': {
            backgroundColor: 'var(--bg-hover)',
            transform: 'translateY(-1px)',
            boxShadow: 'var(--shadow-sm)'
          },
          transition: 'all 0.2s ease',
          cursor: 'pointer'
        }}
      >
        <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
          {/* Main content */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
            {/* Left section - Main info */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              {/* Header Row */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1.5,
                mb: 1,
                flexWrap: 'wrap'
              }}>
                {/* Schedule Icon */}
                <Box sx={{
                  mr: 0,
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: 'white',
                  borderRadius: '50%',
                  p: '5px',
                  boxShadow: '0 0 0 1px var(--border-light)',
                  flexShrink: 0
                }}>
                  <ScheduleIcon sx={{ 
                    width: 32, 
                    height: 32,
                    opacity: 0.85,
                    color: 'var(--primary-color)'
                  }} />
                </Box>

                {/* Status Chip */}
                <StatusChip 
                  label={schedule.status}
                  status={mapScheduleStatusForChip(schedule.status)}
                />
                
                {/* Workflow Type */}
                <Typography 
                  variant="h6"
                  sx={{ 
                    fontWeight: 600,
                    color: 'var(--primary-color)',
                    fontSize: '1.1rem',
                    textDecoration: 'none'
                  }}
                >
                  {formatScheduleName(schedule.workflowType)}
                </Typography>

                {/* Agent Badge */}
                <Chip
                  icon={<AgentIcon style={{ width: 14, height: 14 }} />}
                  label={schedule.agentName}
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

                {/* Next Run Status Badge */}
                {nextRunStatus !== 'Scheduled' && (
                  <Chip
                    size="small"
                    label={nextRunStatus}
                    color={getRunStatusColor(nextRunStatus)}
                    sx={{ 
                      height: 24, 
                      fontSize: '0.75rem',
                      fontWeight: 500
                    }}
                  />
                )}
              </Box>

              {/* Schedule ID */}
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ 
                  mb: 1,
                  fontFamily: 'monospace',
                  fontSize: '0.875rem'
                }}
              >
                {schedule.id}
              </Typography>

              {/* Metadata Row */}
              <Box sx={{ 
                display: 'flex',
                gap: 2,
                alignItems: 'center',
                color: 'text.secondary',
                fontSize: '0.875rem',
                flexWrap: 'wrap'
              }}>
                {/* Next Run */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <ScheduleIcon sx={{ fontSize: 16 }} />
                  <Typography variant="body2" color="text.secondary">
                    Next: {schedule.nextRunTime ? formatTimeAgo(schedule.nextRunTime) : 'Not scheduled'}
                  </Typography>
                </Box>

                {/* Last Run */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <AccessTimeIcon sx={{ fontSize: 16 }} />
                  <Typography variant="body2" color="text.secondary">
                    Last: {schedule.lastRunTime ? formatTimeAgo(schedule.lastRunTime) : 'Never'}
                  </Typography>
                </Box>

                {/* Executions */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <HistoryIcon sx={{ fontSize: 16 }} />
                  <Typography variant="body2" color="text.secondary">
                    Executions: {schedule.executionCount?.toLocaleString() || '0'}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Right section - View Button */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              flexShrink: 0
            }}>
              <Button
                size="small"
                variant="outlined"
                sx={{
                  minWidth: 'auto',
                  px: 2,
                  backgroundColor: 'var(--bg-paper)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)',
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: 'var(--bg-hover)',
                    borderColor: 'var(--border-hover)',
                  }
                }}
              >
                View Details
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  };

  const headerActions = (
    <Box sx={{ display: 'flex', gap: 1 }}>
      {isMobile ? (
        <IconButton
          onClick={loadSchedules}
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
          onClick={loadSchedules}
          disabled={isLoading}
          className={`button-refresh ${isLoading ? 'loading' : ''}`}
          startIcon={<RefreshIcon />}
          size="small"
        >
          <span>Refresh</span>
        </Button>
      )}
    </Box>
  );

  if (error && schedules.length === 0) {
    return (
      <PageLayout 
        title="Schedules"
        subtitle="Manage and monitor your workflow schedules"
      >
        <Box sx={{ p: 6, bgcolor: 'grey.50', textAlign: 'center' }}>
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              borderRadius: 2,
              maxWidth: 600,
              mx: 'auto',
              textAlign: 'left'
            }}
          >
            {error}
          </Alert>
          <Button 
            variant="contained" 
            onClick={loadSchedules}
            startIcon={<RefreshIcon />}
            disabled={isLoading}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 1.5,
              px: 4,
              py: 1
            }}
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
      headerActions={headerActions}
    >
      {error && schedules.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Alert 
            severity="warning" 
            sx={{ 
              borderRadius: 2,
              backgroundColor: 'rgba(255, 152, 0, 0.08)',
              border: '1px solid rgba(255, 152, 0, 0.2)',
              color: 'text.primary'
            }}
          >
            {error}
          </Alert>
        </Box>
      )}

      {/* Filters Section */}
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
          searchValue={searchQuery}
          onSearchChange={(e) => setSearchQuery(e.target.value)}
          searchPlaceholder="Search schedules..."
          additionalFilters={
            <Box sx={{ 
              display: 'flex', 
              flexDirection: isMobile ? 'column' : 'row',
              gap: 2,
              width: '100%',
              alignItems: isMobile ? 'stretch' : 'center',
              flexWrap: 'wrap'
            }}>
              <FormControl 
                size="small" 
                sx={{ 
                  minWidth: 120,
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'background.paper',
                    '&:hover': {
                      bgcolor: 'grey.50'
                    }
                  }
                }}
              >
                <InputLabel>Agent</InputLabel>
                <Select
                  value={selectedAgent}
                  label="Agent"
                  onChange={(e) => setSelectedAgent(e.target.value)}
                >
                  <MenuItem value=""><em>All</em></MenuItem>
                  {uniqueAgents.map(agent => (
                    <MenuItem key={agent} value={agent}>{agent}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl 
                size="small" 
                sx={{ 
                  minWidth: 110,
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'background.paper',
                    '&:hover': {
                      bgcolor: 'grey.50'
                    }
                  }
                }}
              >
                <InputLabel>Status</InputLabel>
                <Select
                  value={selectedStatus}
                  label="Status"
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <MenuItem value=""><em>All</em></MenuItem>
                  {uniqueStatuses.map(status => (
                    <MenuItem key={status} value={status}>{status}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl 
                size="small" 
                sx={{ 
                  minWidth: 130,
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'background.paper',
                    '&:hover': {
                      bgcolor: 'grey.50'
                    }
                  }
                }}
              >
                <InputLabel>Workflow</InputLabel>
                <Select
                  value={selectedWorkflow}
                  label="Workflow"
                  onChange={(e) => setSelectedWorkflow(e.target.value)}
                >
                  <MenuItem value=""><em>All</em></MenuItem>
                  {uniqueWorkflows.map(workflow => (
                    <MenuItem key={workflow} value={workflow}>{workflow}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl 
                size="small" 
                sx={{ 
                  minWidth: 90,
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'background.paper',
                    '&:hover': {
                      bgcolor: 'grey.50'
                    }
                  }
                }}
              >
                <InputLabel>Show</InputLabel>
                <Select
                  value={itemsPerPage}
                  label="Show"
                  onChange={handleItemsPerPageChange}
                >
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={15}>15</MenuItem>
                  <MenuItem value={25}>25</MenuItem>
                  <MenuItem value={50}>50</MenuItem>
                  <MenuItem value={100}>100</MenuItem>
                </Select>
              </FormControl>
            </Box>
          }
        />
      </Box>

      {filteredSchedules.length > 0 ? (
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
            px: 3, 
            py: 1.5,
            backgroundColor: 'var(--bg-muted)',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
              {selectedAgent ? `Showing schedules for "${selectedAgent}"` : 'Showing all schedules'}
            </Typography>
          </Box>

          {/* Schedules List */}
          <Box sx={{ 
            minHeight: 200,
            position: 'relative'
          }}>
            {isLoading ? (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                minHeight: 200,
                color: 'text.secondary',
                py: 4
              }}>
                <CircularProgress size={40} thickness={4} sx={{ mr: 2 }} />
                <Typography variant="body2">Loading schedules...</Typography>
              </Box>
            ) : (
              paginatedSchedules.map((schedule, index) => renderScheduleItem(schedule, index))
            )}
          </Box>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              gap: 2,
              px: 3,
              py: 2,
              bgcolor: 'var(--bg-muted)',
              borderTop: '1px solid var(--border-color)',
              flexWrap: 'wrap'
            }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, fontSize: '0.75rem' }}>
                {startIndex + 1}-{Math.min(endIndex, filteredSchedules.length)} of {filteredSchedules.length}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
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
                  sx={{
                    '& .MuiPaginationItem-root': {
                      borderRadius: 1.5,
                      fontWeight: 500,
                      fontSize: '0.8rem'
                    }
                  }}
                />
              </Box>
            </Box>
          )}
        </Paper>
      ) : (
        <EmptyState
          icon={<ScheduleIcon sx={{ fontSize: 56, color: 'grey.400' }} />}
          title={isLoading ? 'Loading Schedules...' : 'No schedules found'}
          description={
            searchQuery || selectedAgent || selectedStatus || selectedWorkflow
              ? "Try adjusting your filters to see more schedules."
              : "Schedules will appear here when agents create scheduled workflows."
          }
          actions={
            (searchQuery || selectedAgent || selectedStatus || selectedWorkflow) ? [
              {
                label: 'Clear Filters',
                onClick: () => {
                  setSearchQuery('');
                  setSelectedAgent('');
                  setSelectedStatus('');
                  setSelectedWorkflow('');
                },
                variant: 'outlined'
              }
            ] : []
          }
        />
      )}
    </PageLayout>
  );
};

export default ScheduleList;