import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  Stack,
  Divider,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip
} from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PersonIcon from '@mui/icons-material/Person';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useTasksApi } from '../../services/tasks-api';
import { useNotification } from '../../contexts/NotificationContext';
import { ContentLoader } from '../Common/StandardLoaders';
import StatusChip from '../Common/StatusChip';

/**
 * TaskDetails component for displaying and editing task details in the right slider
 * @param {Object} props
 * @param {Object} props.task - The task object from the list (may have partial data)
 * @param {string} props.workflowId - The workflow ID (used to fetch full details and perform actions)
 * @param {Function} props.onClose - Callback to close the slider
 * @param {Function} props.onTaskUpdated - Callback when task is updated/completed/rejected
 */
const TaskDetails = ({ task, workflowId, onClose, onTaskUpdated }) => {
  const [taskData, setTaskData] = useState(task || null);
  const [isLoading, setIsLoading] = useState(!task);
  const [error, setError] = useState(null);
  
  // Draft editing state
  const [isEditingDraft, setIsEditingDraft] = useState(false);
  const [draftContent, setDraftContent] = useState('');
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  
  // Action states
  const [isCompleting, setIsCompleting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  
  // Reject dialog state
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  
  const tasksApi = useTasksApi();
  const { showSuccess, showError } = useNotification();

  // Fetch full task details
  useEffect(() => {
    const fetchTaskDetails = async () => {
      const idToFetch = workflowId || task?.workflowId;
      if (!idToFetch) return;

      setIsLoading(true);
      setError(null);
      try {
        const fullTask = await tasksApi.getTaskById(idToFetch);
        setTaskData(fullTask);
        setDraftContent(fullTask.currentDraft || '');
      } catch (err) {
        console.error('Error fetching task details:', err);
        setError('Failed to load task details');
        // Fall back to the task data we already have
        if (task) {
          setTaskData(task);
          setDraftContent(task.currentDraft || '');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchTaskDetails();
  }, [task, workflowId, tasksApi]);

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return '';
    }
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

  const handleSaveDraft = async () => {
    if (!taskData?.workflowId) return;
    
    setIsSavingDraft(true);
    try {
      await tasksApi.updateTaskDraft(taskData.workflowId, draftContent);
      setTaskData(prev => ({ ...prev, currentDraft: draftContent }));
      setIsEditingDraft(false);
      showSuccess('Draft saved successfully');
    } catch (err) {
      console.error('Error saving draft:', err);
      showError('Failed to save draft: ' + (err.message || 'Unknown error'));
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleCompleteTask = async () => {
    if (!taskData?.workflowId) return;
    
    setIsCompleting(true);
    try {
      await tasksApi.completeTask(taskData.workflowId);
      showSuccess('Task completed successfully');
      setTaskData(prev => ({ ...prev, isCompleted: true, status: 'Completed' }));
      if (onTaskUpdated) onTaskUpdated();
    } catch (err) {
      console.error('Error completing task:', err);
      showError('Failed to complete task: ' + (err.message || 'Unknown error'));
    } finally {
      setIsCompleting(false);
    }
  };

  const handleRejectTask = async () => {
    if (!taskData?.workflowId || !rejectionReason.trim()) return;
    
    setIsRejecting(true);
    try {
      await tasksApi.rejectTask(taskData.workflowId, rejectionReason.trim());
      showSuccess('Task rejected successfully');
      setRejectDialogOpen(false);
      setRejectionReason('');
      setTaskData(prev => ({ ...prev, isCompleted: true, status: 'Terminated' }));
      if (onTaskUpdated) onTaskUpdated();
    } catch (err) {
      console.error('Error rejecting task:', err);
      showError('Failed to reject task: ' + (err.message || 'Unknown error'));
    } finally {
      setIsRejecting(false);
    }
  };

  const handleCancelEditDraft = () => {
    setDraftContent(taskData?.currentDraft || '');
    setIsEditingDraft(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showSuccess('Copied to clipboard');
  };

  const isTaskActive = taskData && !taskData.isCompleted;

  if (isLoading) {
    return (
      <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <ContentLoader />
      </Box>
    );
  }

  if (error && !taskData) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Button variant="outlined" onClick={onClose}>Close</Button>
      </Box>
    );
  }

  if (!taskData) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">No task data available</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%',
      minHeight: 0
    }}>
      {/* Task Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'flex-start', 
          justifyContent: 'space-between',
          gap: 2,
          mb: 2
        }}>
          <Box sx={{ flex: 1 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <AssignmentIcon sx={{ fontSize: 24, color: 'var(--primary)' }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                {taskData.title || 'Untitled Task'}
              </Typography>
            </Stack>
            <StatusChip 
              label={getStatusLabel(taskData.status, taskData.isCompleted)} 
              status={getStatusClass(taskData.status, taskData.isCompleted)} 
            />
          </Box>
        </Box>

        {taskData.description && (
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ mb: 2, lineHeight: 1.6 }}
          >
            {taskData.description}
          </Typography>
        )}

        {/* Metadata */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: 2, 
            backgroundColor: 'var(--bg-muted)', 
            borderRadius: 2,
            border: '1px solid var(--border-color)'
          }}
        >
          <Stack spacing={1.5}>
            {/* Workflow ID */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, flexWrap: 'wrap' }}>
              <Typography variant="caption" sx={{ color: 'var(--text-secondary)', minWidth: 80, flexShrink: 0 }}>
                Workflow ID:
              </Typography>
              <Tooltip title="Click to copy">
                <Box 
                  onClick={() => copyToClipboard(taskData.workflowId)}
                  sx={{ 
                    fontFamily: 'monospace', 
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    backgroundColor: 'var(--bg-muted)',
                    borderRadius: 1,
                    px: 1,
                    py: 0.5,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 0.5,
                    wordBreak: 'break-all',
                    '&:hover': { backgroundColor: 'var(--bg-hover)' }
                  }} 
                >
                  <ContentCopyIcon sx={{ fontSize: 14, flexShrink: 0, mt: 0.25 }} />
                  <Typography 
                    component="span" 
                    sx={{ 
                      fontFamily: 'monospace', 
                      fontSize: '0.75rem',
                      wordBreak: 'break-all'
                    }}
                  >
                    {taskData.workflowId}
                  </Typography>
                </Box>
              </Tooltip>
            </Box>

            {/* Participant */}
            {taskData.participantId && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="caption" sx={{ color: 'var(--text-secondary)', minWidth: 80 }}>
                  Assigned To:
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <PersonIcon sx={{ fontSize: 16, color: 'var(--text-secondary)' }} />
                  <Typography variant="body2">{taskData.participantId}</Typography>
                </Box>
              </Box>
            )}

            {/* Start Time */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="caption" sx={{ color: 'var(--text-secondary)', minWidth: 80 }}>
                Started:
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <AccessTimeIcon sx={{ fontSize: 16, color: 'var(--text-secondary)' }} />
                <Typography variant="body2">
                  {formatDateTime(taskData.startTime)}
                  {taskData.startTime && (
                    <Typography component="span" variant="caption" sx={{ ml: 1, color: 'var(--text-light)' }}>
                      ({formatTimeAgo(taskData.startTime)})
                    </Typography>
                  )}
                </Typography>
              </Box>
            </Box>

            {/* Close Time (if completed) */}
            {taskData.closeTime && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="caption" sx={{ color: 'var(--text-secondary)', minWidth: 80 }}>
                  Completed:
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <CheckCircleIcon sx={{ fontSize: 16, color: 'var(--success-color)' }} />
                  <Typography variant="body2">
                    {formatDateTime(taskData.closeTime)}
                  </Typography>
                </Box>
              </Box>
            )}
          </Stack>
        </Paper>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Draft Section */}
      <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', mb: 3 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 2
        }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'var(--text-primary)' }}>
            Draft Work
          </Typography>
          {isTaskActive && !isEditingDraft && (
            <Button
              size="small"
              startIcon={<EditIcon />}
              onClick={() => setIsEditingDraft(true)}
              sx={{ textTransform: 'none' }}
            >
              Edit Draft
            </Button>
          )}
        </Box>

        {isEditingDraft ? (
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 200 }}>
            <TextField
              multiline
              fullWidth
              value={draftContent}
              onChange={(e) => setDraftContent(e.target.value)}
              placeholder="Enter your draft work here..."
              sx={{
                flex: 1,
                '& .MuiOutlinedInput-root': {
                  height: '100%',
                  alignItems: 'flex-start',
                  backgroundColor: 'var(--bg-paper)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.875rem'
                },
                '& .MuiInputBase-input': {
                  height: '100% !important',
                  overflow: 'auto !important'
                }
              }}
              minRows={8}
            />
            <Box sx={{ display: 'flex', gap: 1, mt: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                size="small"
                onClick={handleCancelEditDraft}
                disabled={isSavingDraft}
                sx={{ textTransform: 'none' }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                size="small"
                startIcon={isSavingDraft ? <CircularProgress size={16} /> : <SaveIcon />}
                onClick={handleSaveDraft}
                disabled={isSavingDraft}
                sx={{ textTransform: 'none' }}
              >
                {isSavingDraft ? 'Saving...' : 'Save Draft'}
              </Button>
            </Box>
          </Box>
        ) : (
          <Paper
            elevation={0}
            sx={{
              p: 2,
              flex: 1,
              minHeight: 150,
              backgroundColor: 'var(--bg-muted)',
              borderRadius: 2,
              border: '1px solid var(--border-color)',
              overflow: 'auto',
              whiteSpace: 'pre-wrap',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.875rem',
              color: taskData.currentDraft ? 'var(--text-primary)' : 'var(--text-light)'
            }}
          >
            {taskData.currentDraft || 'No draft content yet. Click "Edit Draft" to add content.'}
          </Paper>
        )}
      </Box>

      {/* Action Buttons */}
      {isTaskActive && (
        <>
          <Divider sx={{ mb: 3 }} />
          <Box sx={{ 
            display: 'flex', 
            gap: 2, 
            justifyContent: 'flex-end',
            flexWrap: 'wrap'
          }}>
            <Button
              variant="outlined"
              color="error"
              startIcon={isRejecting ? <CircularProgress size={16} /> : <CancelIcon />}
              onClick={() => setRejectDialogOpen(true)}
              disabled={isCompleting || isRejecting || isSavingDraft}
              sx={{ textTransform: 'none' }}
            >
              Reject Task
            </Button>
            <Button
              variant="contained"
              color="success"
              startIcon={isCompleting ? <CircularProgress size={16} color="inherit" /> : <CheckCircleIcon />}
              onClick={handleCompleteTask}
              disabled={isCompleting || isRejecting || isSavingDraft}
              sx={{ textTransform: 'none' }}
            >
              {isCompleting ? 'Completing...' : 'Mark Complete'}
            </Button>
          </Box>
        </>
      )}

      {/* Completed message */}
      {!isTaskActive && (
        <Alert severity="info" sx={{ mt: 2 }}>
          This task has been completed and can no longer be modified.
        </Alert>
      )}

      {/* Reject Dialog */}
      <Dialog 
        open={rejectDialogOpen} 
        onClose={() => !isRejecting && setRejectDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Reject Task</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Please provide a reason for rejecting this task. This action cannot be undone.
          </Typography>
          <TextField
            autoFocus
            fullWidth
            multiline
            rows={4}
            label="Rejection Reason"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Enter the reason for rejection..."
            disabled={isRejecting}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={() => setRejectDialogOpen(false)} 
            disabled={isRejecting}
            sx={{ textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleRejectTask}
            disabled={isRejecting || !rejectionReason.trim()}
            startIcon={isRejecting ? <CircularProgress size={16} color="inherit" /> : null}
            sx={{ textTransform: 'none' }}
          >
            {isRejecting ? 'Rejecting...' : 'Reject Task'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TaskDetails;

