import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Typography, 
  Box,
  Paper,
  Button,
  TextField,
  InputAdornment,
  useMediaQuery,
  IconButton,
  Divider,
  Chip,
  Tooltip
} from '@mui/material';
import { useTasksApi } from '../../services/tasks-api';
import RefreshIcon from '@mui/icons-material/Refresh';
import PersonIcon from '@mui/icons-material/Person';
import SearchIcon from '@mui/icons-material/Search';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useLoading } from '../../contexts/LoadingContext';
import { useNotification } from '../../contexts/NotificationContext';
import { useSlider } from '../../contexts/SliderContext';
import { handleApiError } from '../../utils/errorHandler';
import AgentSelector from '../Runs/AgentSelector';
import TaskDetails from './TaskDetails';
import PaginationControls from '../Runs/PaginationControls';
import PageLayout from '../Common/PageLayout';
import PageFilters from '../Common/PageFilters';
import EmptyState from '../Common/EmptyState';
import StatusChip from '../Common/StatusChip';

/**
 * Task card component to display individual task information
 */
const TaskCard = ({ task, isFirst, isLast, isMobile, onClick }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusLabel = (status, isCompleted) => {
    if (isCompleted) return 'Completed';
    const statusMap = {
      'Running': 'In Progress',
      'Pending': 'Pending',
      'Completed': 'Completed',
      'Failed': 'Failed',
      'Terminated': 'Terminated',
      'Canceled': 'Canceled'
    };
    return statusMap[status] || status || 'Unknown';
  };

  const getStatusClass = (status, isCompleted) => {
    if (isCompleted) return 'completed';
    const statusClass = status?.toLowerCase() || 'unknown';
    if (statusClass === 'running') return 'running';
    return statusClass;
  };

  return (
    <Box
      onClick={onClick}
      sx={{
        p: { xs: 2, md: 3 },
        borderBottom: isLast ? 'none' : '1px solid var(--border-color)',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        '&:hover': {
          backgroundColor: 'var(--bg-hover)',
        },
        borderRadius: isFirst ? '12px 12px 0 0' : isLast ? '0 0 12px 12px' : 0
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'flex-start' : 'center',
        gap: 2
      }}>
        {/* Task Info */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
            <AssignmentIcon sx={{ fontSize: 20, color: 'var(--primary)' }} />
            <Typography 
              variant="subtitle1" 
              sx={{ 
                fontWeight: 600,
                color: 'var(--text-primary)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {task.title || 'Untitled Task'}
            </Typography>
            <Box sx={{ marginLeft: 'auto' }}>
              <StatusChip 
                label={getStatusLabel(task.status, task.isCompleted)} 
                status={getStatusClass(task.status, task.isCompleted)} 
              />
            </Box>
          </Box>
          
          {task.description && (
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ 
                mb: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical'
              }}
            >
              {task.description}
            </Typography>
          )}

          {/* Workflow ID - Full Row */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: 1,
            mt: 1
          }}>
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'var(--text-light)',
                fontWeight: 500,
                flexShrink: 0
              }}
            >
              Workflow ID:
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'var(--text-secondary)',
                fontFamily: 'monospace',
                backgroundColor: 'var(--bg-muted)',
                px: 1,
                py: 0.5,
                borderRadius: 1,
                wordBreak: 'break-all'
              }}
            >
              {task.workflowId}
            </Typography>
          </Box>

          <Box sx={{ 
            display: 'flex', 
            gap: { xs: 1, md: 3 }, 
            flexWrap: 'wrap',
            alignItems: 'center',
            mt: 1
          }}>
            {/* Participant */}
            {task.participantId && (
              <Tooltip title="Assigned To">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <PersonIcon sx={{ fontSize: 14, color: 'var(--text-secondary)' }} />
                  <Typography variant="caption" color="text.secondary">
                    {task.participantId}
                  </Typography>
                </Box>
              </Tooltip>
            )}

            {/* Start Time */}
            <Tooltip title="Started">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <AccessTimeIcon sx={{ fontSize: 14, color: 'var(--text-secondary)' }} />
                <Typography variant="caption" color="text.secondary">
                  {formatDate(task.startTime)}
                </Typography>
              </Box>
            </Tooltip>

            {/* Close Time (if completed) */}
            {task.closeTime && (
              <Tooltip title="Completed">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <CheckCircleOutlineIcon sx={{ fontSize: 14, color: 'var(--success-color)' }} />
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(task.closeTime)}
                  </Typography>
                </Box>
              </Tooltip>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

/**
 * HITL Tasks page component
 * Displays a paginated list of Human-In-The-Loop tasks with filtering
 */
const HITLTasks = () => {
  // State
  const [tasks, setTasks] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [participantFilter, setParticipantFilter] = useState('');
  const [debouncedParticipant, setDebouncedParticipant] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [hasNextPage, setHasNextPage] = useState(false);
  
  const isMobile = useMediaQuery('(max-width:768px)');

  const { setLoading, isLoading } = useLoading();
  const api = useTasksApi();
  const { showError } = useNotification();
  const { openSlider, closeSlider } = useSlider();

  // Debounce participant filter input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedParticipant(participantFilter.trim());
    }, 500);
    return () => clearTimeout(timer);
  }, [participantFilter]);

  // Load tasks with pagination
  const loadTasks = useCallback(async (pageToken = null, reset = false) => {
    setLoading(true);
    if (reset) {
      setTasks([]);
      setCurrentPage(1);
      setHasNextPage(false);
    }
    
    try {
      const options = {
        agent: selectedAgent,
        participantId: debouncedParticipant || null,
        pageSize: pageSize,
        pageToken: pageToken
      };

      const response = await api.fetchTasks(options);
      
      if (response && response.tasks) {
        setTasks(response.tasks);
        setHasNextPage(response.hasNextPage);
      } else {
        setTasks([]);
        setHasNextPage(false);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
      setTasks([]);
      setHasNextPage(false);
      await handleApiError(error, 'Failed to load tasks', showError);
    } finally {
      setLoading(false);
    }
  }, [api, selectedAgent, debouncedParticipant, pageSize, setLoading, showError]);

  // Reload when filters change
  useEffect(() => {
    setCurrentPage(1);
    loadTasks(null, true);
  }, [selectedAgent, debouncedParticipant, pageSize, loadTasks]);

  const hasTasks = useMemo(() => {
    return tasks.length > 0;
  }, [tasks]);

  const handleAgentChange = (agent) => {
    setSelectedAgent(agent);
    setCurrentPage(1);
  };

  const handleParticipantChange = (event) => {
    setParticipantFilter(event.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    const pageToken = newPage > 1 ? newPage.toString() : null;
    loadTasks(pageToken, false);
  };

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    loadTasks(currentPage > 1 ? String(currentPage) : null, false);
  };

  const handleTaskClick = (task) => {
    openSlider(
      <TaskDetails
        task={task}
        workflowId={task.workflowId}
        onClose={closeSlider}
        onTaskUpdated={() => {
          // Refresh the task list when a task is updated
          loadTasks(currentPage > 1 ? String(currentPage) : null, false);
        }}
      />,
      task.title || 'Task Details'
    );
  };

  return (
    <PageLayout 
      title="HITL Tasks"
      subtitle="Human-In-The-Loop task management"
      headerActions={
        <Box sx={{ display: 'flex', gap: 1 }}>
          {isMobile ? (
            <IconButton
              onClick={handleRefresh}
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
              onClick={handleRefresh}
              disabled={isLoading}
              className={`button-refresh ${isLoading ? 'loading' : ''}`}
              startIcon={<RefreshIcon />}
              size="small"
            >
              <span>Refresh</span>
            </Button>
          )}
        </Box>
      }
    >
      {/* Filters */}
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
              flexDirection: isMobile ? 'column' : 'row',
              gap: 2,
              width: '100%',
              alignItems: isMobile ? 'stretch' : 'center'
            }}>
              {/* Agent Filter */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: 1.5,
                backgroundColor: 'var(--bg-main)',
                px: 2,
                py: 1,
                borderRadius: 'var(--radius-md)',
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

              {/* Participant Filter */}
              <TextField
                size="small"
                placeholder="Filter by participant..."
                value={participantFilter}
                onChange={handleParticipantChange}
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

              {/* Active filters indicator */}
              {(selectedAgent || debouncedParticipant) && (
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {selectedAgent && (
                    <Chip 
                      label={`Agent: ${selectedAgent}`}
                      size="small"
                      onDelete={() => setSelectedAgent(null)}
                      sx={{
                        backgroundColor: 'var(--primary-light)',
                        color: 'var(--primary-color)',
                        fontWeight: 500
                      }}
                    />
                  )}
                  {debouncedParticipant && (
                    <Chip 
                      label={`Participant: ${debouncedParticipant}`}
                      size="small"
                      onDelete={() => {
                        setParticipantFilter('');
                        setDebouncedParticipant('');
                      }}
                      sx={{
                        backgroundColor: 'var(--success-light)',
                        color: 'var(--success-dark)',
                        fontWeight: 500
                      }}
                    />
                  )}
                </Box>
              )}
            </Box>
          }
        />
      </Box>

      {/* Tasks List */}
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        {hasTasks ? (
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
                {selectedAgent 
                  ? `Showing tasks for "${selectedAgent}"` 
                  : debouncedParticipant 
                    ? `Showing tasks for participant "${debouncedParticipant}"`
                    : 'Showing all HITL tasks'}
              </Typography>
            </Box>

            {/* Tasks */}
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
                  color: 'text.secondary'
                }}>
                  <Typography variant="body2">Loading tasks...</Typography>
                </Box>
              ) : (
                tasks.map((task, index) => (
                  <TaskCard
                    key={`${task.workflowId}-${index}`}
                    task={task}
                    isFirst={index === 0}
                    isLast={index === tasks.length - 1}
                    isMobile={isMobile}
                    onClick={() => handleTaskClick(task)}
                  />
                ))
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
              itemName="tasks"
            />
          </Paper>
        ) : (
          <EmptyState
            title={isLoading ? 'Loading Tasks...' : 'No HITL Tasks Found'}
            description={
              selectedAgent || debouncedParticipant
                ? 'Try changing the filters or check if there are any tasks matching your criteria.'
                : 'Human-In-The-Loop tasks will appear here when workflows require human intervention.'
            }
            context="audits"
            actions={[
              {
                label: 'Refresh',
                onClick: handleRefresh,
                variant: 'contained',
                startIcon: <RefreshIcon />,
                disabled: isLoading
              }
            ]}
          />  
        )}
      </Box>
    </PageLayout>
  );
};

export default HITLTasks;

