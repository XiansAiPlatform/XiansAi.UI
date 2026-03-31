import React, { useState, useEffect, useCallback } from 'react';
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
  Card,
  CardContent,
  Paper,
  IconButton,
  Divider,
  useMediaQuery
} from '@mui/material';
import { formatDistanceToNow, isBefore, addHours } from 'date-fns';
import RefreshIcon from '@mui/icons-material/Refresh';
import ScheduleIcon from '@mui/icons-material/Schedule';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import HistoryIcon from '@mui/icons-material/History';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import ScheduleDetails from './ScheduleDetails';
import { useScheduleApi, useAgentsApi } from '../../services';
import { useNotification } from '../../contexts/NotificationContext';
import { useLoading } from '../../contexts/LoadingContext';
import { useSlider } from '../../contexts/SliderContext';
import { handleApiError } from '../../utils/errorHandler';
import PageLayout from '../Common/PageLayout';
import PageFilters from '../Common/PageFilters';
import EmptyState from '../Common/EmptyState';
import StatusChip from '../Common/StatusChip';
import ConfirmationDialog from '../Common/ConfirmationDialog';
import PaginationControls from '../Runs/PaginationControls';
import './Schedules.css';
import { ReactComponent as AgentIcon } from '../../theme/agent.svg';

const SCHEDULE_STATUSES = [
  'Running', 'Suspended', 'Failed', 'Completed',
  'Canceled', 'Terminated', 'TimedOut', 'ContinuedAsNew'
];

const ScheduleList = () => {
  const [schedules, setSchedules] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [deleteAllDialogOpen, setDeleteAllDialogOpen] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);

  const isMobile = useMediaQuery('(max-width:768px)');
  const { setLoading, isLoading } = useLoading();
  const { showError, showSuccess } = useNotification();
  const { openSlider, closeSlider } = useSlider();
  const api = useScheduleApi();
  const agentsApi = useAgentsApi();

  // Debounce search input to avoid firing on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadAgents = useCallback(async () => {
    try {
      setLoadingAgents(true);
      const response = await agentsApi.getAllAgents();
      setAgents(Array.isArray(response) ? response : []);
    } catch (err) {
      console.error('Failed to load agents:', err);
      setAgents([]);
    } finally {
      setLoadingAgents(false);
    }
  }, [agentsApi]);

  useEffect(() => {
    loadAgents();
  }, [loadAgents]);

  const loadSchedules = async (pageToken = null, reset = false) => {
    try {
      setLoading(true);
      setError(null);

      if (reset) {
        setSchedules([]);
        setCurrentPage(1);
        setHasNextPage(false);
      }

      const filters = { pageSize };
      if (selectedAgent) filters.agentName = selectedAgent;
      if (selectedStatus) filters.status = selectedStatus;
      if (debouncedSearch) filters.searchTerm = debouncedSearch;
      if (pageToken) filters.pageToken = pageToken;

      const data = await api.getSchedules(filters);
      setSchedules(data);
      // If we received a full page there may be more; fewer means last page
      setHasNextPage(data.length >= pageSize);
    } catch (err) {
      console.error('Failed to load schedules:', err);
      const errorMessage = handleApiError(err, 'loading schedules');
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Reload from page 1 whenever any filter or page size changes
  useEffect(() => {
    setCurrentPage(1);
    loadSchedules(null, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAgent, selectedStatus, debouncedSearch, pageSize]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    const pageToken = newPage > 1 ? String(newPage) : null;
    loadSchedules(pageToken, false);
  };

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  const handleScheduleClick = (schedule) => {
    openSlider(
      <ScheduleDetails
        schedule={schedule}
        onClose={closeSlider}
        onUpdate={() => loadSchedules(currentPage > 1 ? String(currentPage) : null, false)}
        onDelete={() => {
          setSchedules(prev => prev.filter(s => s.id !== schedule.id));
        }}
      />,
      `${schedule.agentName}`
    );
  };

  const handleDeleteAll = async () => {
    try {
      setDeletingAll(true);
      await api.deleteAllSchedules();
      setSchedules([]);
      setHasNextPage(false);
      setCurrentPage(1);
      setDeleteAllDialogOpen(false);
      showSuccess('All schedules deleted successfully.');
    } catch (err) {
      console.error('Failed to delete all schedules:', err);
      showError(handleApiError(err, 'deleting all schedules'));
    } finally {
      setDeletingAll(false);
    }
  };

  const getNextRunStatus = (schedule) => {
    if (!schedule.nextRunTime) return 'No runs scheduled';
    try {
      const nextRun = new Date(schedule.nextRunTime);
      const now = new Date();
      if (isBefore(nextRun, now)) return 'Overdue';
      if (isBefore(nextRun, addHours(now, 1))) return 'Soon';
      return 'Scheduled';
    } catch {
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
    } catch {
      return 'Unknown';
    }
  };

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
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
            {/* Left section */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              {/* Header Row */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1, flexWrap: 'wrap' }}>
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: 'white',
                  borderRadius: '50%',
                  p: '5px',
                  boxShadow: '0 0 0 1px var(--border-light)',
                  flexShrink: 0
                }}>
                  <ScheduleIcon sx={{ width: 32, height: 32, opacity: 0.85, color: 'var(--primary-color)' }} />
                </Box>

                <StatusChip
                  label={schedule.status}
                  status={mapScheduleStatusForChip(schedule.status)}
                />

                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, color: 'var(--primary-color)', fontSize: '1.1rem' }}
                >
                  {schedule.workflowType}
                </Typography>

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

                {nextRunStatus !== 'Scheduled' && (
                  <Chip
                    size="small"
                    label={nextRunStatus}
                    color={getRunStatusColor(nextRunStatus)}
                    sx={{ height: 24, fontSize: '0.75rem', fontWeight: 500 }}
                  />
                )}
              </Box>

              {/* Schedule ID */}
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 1, fontFamily: 'monospace', fontSize: '0.875rem' }}
              >
                {schedule.id}
              </Typography>

              {/* Metadata Row */}
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', color: 'text.secondary', fontSize: '0.875rem', flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <ScheduleIcon sx={{ fontSize: 16 }} />
                  <Typography variant="body2" color="text.secondary">
                    Next: {schedule.nextRunTime ? formatTimeAgo(schedule.nextRunTime) : 'Not scheduled'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <AccessTimeIcon sx={{ fontSize: 16 }} />
                  <Typography variant="body2" color="text.secondary">
                    Last: {schedule.lastRunTime ? formatTimeAgo(schedule.lastRunTime) : 'Never'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <HistoryIcon sx={{ fontSize: 16 }} />
                  <Typography variant="body2" color="text.secondary">
                    Executions: {schedule.executionCount?.toLocaleString() || '0'}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Right section */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
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
          onClick={() => loadSchedules(null, true)}
          disabled={isLoading}
          size="medium"
          sx={{
            backgroundColor: 'var(--bg-paper)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-sm)',
            color: 'var(--text-secondary)',
            '&:hover': { backgroundColor: 'var(--bg-hover)' }
          }}
        >
          <RefreshIcon className={isLoading ? 'spin-icon' : ''} />
        </IconButton>
      ) : (
        <Button
          onClick={() => loadSchedules(null, true)}
          disabled={isLoading}
          className={`button-refresh ${isLoading ? 'loading' : ''}`}
          startIcon={<RefreshIcon />}
          size="small"
        >
          <span>Refresh</span>
        </Button>
      )}

      {schedules.length > 0 && (
        isMobile ? (
          <IconButton
            onClick={() => setDeleteAllDialogOpen(true)}
            disabled={isLoading || deletingAll}
            size="medium"
            sx={{
              backgroundColor: 'var(--bg-paper)',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-sm)',
              color: 'error.main',
              '&:hover': { backgroundColor: 'rgba(211, 47, 47, 0.04)' }
            }}
          >
            <DeleteSweepIcon />
          </IconButton>
        ) : (
          <Button
            onClick={() => setDeleteAllDialogOpen(true)}
            disabled={isLoading || deletingAll}
            startIcon={<DeleteSweepIcon />}
            size="small"
            color="error"
            variant="outlined"
            sx={{ textTransform: 'none' }}
          >
            Delete All
          </Button>
        )
      )}
    </Box>
  );

  if (error && schedules.length === 0) {
    return (
      <PageLayout title="Schedules" subtitle="Manage and monitor your workflow schedules">
        <Box sx={{ p: 6, bgcolor: 'grey.50', textAlign: 'center' }}>
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2, maxWidth: 600, mx: 'auto', textAlign: 'left' }}>
            {error}
          </Alert>
          <Button
            variant="contained"
            onClick={() => loadSchedules(null, true)}
            startIcon={<RefreshIcon />}
            disabled={isLoading}
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 1.5, px: 4, py: 1 }}
          >
            Retry
          </Button>
        </Box>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Schedules" headerActions={headerActions}>
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

      {/* Filters */}
      <Box className="filter-controls" sx={{ mb: 3, position: 'relative', zIndex: 10 }}>
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
                sx={{ minWidth: 120, '& .MuiOutlinedInput-root': { bgcolor: 'background.paper' } }}
              >
                <InputLabel>Agent</InputLabel>
                <Select
                  value={selectedAgent}
                  label="Agent"
                  onChange={(e) => setSelectedAgent(e.target.value)}
                  disabled={loadingAgents}
                >
                  <MenuItem value=""><em>All</em></MenuItem>
                  {agents.map(agent => (
                    <MenuItem key={agent} value={agent}>{agent}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl
                size="small"
                sx={{ minWidth: 110, '& .MuiOutlinedInput-root': { bgcolor: 'background.paper' } }}
              >
                <InputLabel>Status</InputLabel>
                <Select
                  value={selectedStatus}
                  label="Status"
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <MenuItem value=""><em>All</em></MenuItem>
                  {SCHEDULE_STATUSES.map(status => (
                    <MenuItem key={status} value={status}>{status}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          }
        />
      </Box>

      {schedules.length > 0 ? (
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
          <Box sx={{ minHeight: 200, position: 'relative' }}>
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200, py: 4 }}>
                <CircularProgress size={40} thickness={4} sx={{ mr: 2 }} />
                <Typography variant="body2" color="text.secondary">Loading schedules...</Typography>
              </Box>
            ) : (
              schedules.map((schedule, index) => renderScheduleItem(schedule, index))
            )}
          </Box>

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
            itemName="schedules"
          />
        </Paper>
      ) : (
        <EmptyState
          icon={<ScheduleIcon sx={{ fontSize: 56, color: 'grey.400' }} />}
          title={isLoading ? 'Loading Schedules...' : 'No schedules found'}
          description={
            searchQuery || selectedAgent || selectedStatus
              ? 'Try adjusting your filters to see more schedules.'
              : 'Schedules will appear here when agents create scheduled workflows.'
          }
          actions={
            (searchQuery || selectedAgent || selectedStatus) ? [
              {
                label: 'Clear Filters',
                onClick: () => {
                  setSearchQuery('');
                  setSelectedAgent('');
                  setSelectedStatus('');
                },
                variant: 'outlined'
              }
            ] : []
          }
        />
      )}

      <ConfirmationDialog
        open={deleteAllDialogOpen}
        title="Delete All Schedules"
        message="Are you sure you want to delete all schedules? This will permanently remove every schedule for your tenant."
        confirmLabel="Delete All"
        onConfirm={handleDeleteAll}
        onCancel={() => setDeleteAllDialogOpen(false)}
        dangerLevel="critical"
        loading={deletingAll}
      />
    </PageLayout>
  );
};

export default ScheduleList;
