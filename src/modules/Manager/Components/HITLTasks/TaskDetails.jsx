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
  const [isPerformingAction, setIsPerformingAction] = useState(false);
  
  // Action dialog state
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const [actionComment, setActionComment] = useState('');
  
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
        // Initialize draft with FinalWork (current state) or InitialWork (starting point)
        setDraftContent(fullTask.finalWork || fullTask.initialWork || '');
      } catch (err) {
        console.error('Error fetching task details:', err);
        setError('Failed to load task details');
        // Fall back to the task data we already have
        if (task) {
          setTaskData(task);
          setDraftContent(task.finalWork || task.initialWork || '');
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
      // Update finalWork with the saved draft content
      setTaskData(prev => ({ ...prev, finalWork: draftContent }));
      setIsEditingDraft(false);
      showSuccess('Draft saved successfully');
    } catch (err) {
      console.error('Error saving draft:', err);
      showError('Failed to save draft: ' + (err.message || 'Unknown error'));
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleActionClick = (action) => {
    setSelectedAction(action);
    setActionComment('');
    setActionDialogOpen(true);
  };

  const handlePerformAction = async () => {
    if (!taskData?.workflowId || !selectedAction) return;
    
    // Check if comment is required for reject action
    const actionLower = selectedAction.toLowerCase();
    if (actionLower === 'reject' && !actionComment.trim()) {
      showError('Please provide a comment for rejection');
      return;
    }

    setIsPerformingAction(true);
    try {
      await tasksApi.performAction(
        taskData.workflowId, 
        selectedAction, 
        actionComment.trim() || null
      );
      
      const actionName = selectedAction.charAt(0).toUpperCase() + selectedAction.slice(1);
      showSuccess(`Task ${actionName.toLowerCase()}d successfully`);
      setActionDialogOpen(false);
      setActionComment('');
      setSelectedAction(null);
      
      // Update task state
      const newStatus = actionLower === 'approve' || actionLower === 'complete' 
        ? 'Completed' 
        : actionLower === 'reject' 
        ? 'Terminated' 
        : 'Completed';
      
      setTaskData(prev => ({ 
        ...prev, 
        isCompleted: true, 
        status: newStatus,
        performedAction: selectedAction,
        comment: actionComment.trim() || null
      }));
      
      if (onTaskUpdated) onTaskUpdated();
    } catch (err) {
      console.error('Error performing action:', err);
      showError('Failed to perform action: ' + (err.message || 'Unknown error'));
    } finally {
      setIsPerformingAction(false);
    }
  };

  const handleCloseActionDialog = () => {
    if (!isPerformingAction) {
      setActionDialogOpen(false);
      setActionComment('');
      setSelectedAction(null);
    }
  };

  const handleCancelEditDraft = () => {
    setDraftContent(taskData?.finalWork || taskData?.initialWork || '');
    setIsEditingDraft(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showSuccess('Copied to clipboard');
  };

  // Get action button configuration
  const getActionConfig = (action) => {
    const actionLower = action.toLowerCase();
    switch (actionLower) {
      case 'approve':
      case 'complete':
        return {
          color: 'success',
          icon: <CheckCircleIcon />,
          label: 'Approve'
        };
      case 'reject':
        return {
          color: 'error',
          icon: <CancelIcon />,
          label: 'Reject'
        };
      default:
        return {
          color: 'primary',
          icon: <AssignmentIcon />,
          label: action.charAt(0).toUpperCase() + action.slice(1)
        };
    }
  };

  const isTaskActive = taskData && !taskData.isCompleted;
  // Only show actions when task is in Running status
  const canPerformActions = isTaskActive && taskData?.status === 'Running';
  const availableActions = taskData?.availableActions || [];

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

            {/* Performed Action (if completed) */}
            {taskData.performedAction && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="caption" sx={{ color: 'var(--text-secondary)', minWidth: 80 }}>
                  Action:
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <AssignmentIcon sx={{ fontSize: 16, color: 'var(--primary)' }} />
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {taskData.performedAction.charAt(0).toUpperCase() + taskData.performedAction.slice(1)}
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Comment (if provided) */}
            {taskData.comment && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography variant="caption" sx={{ color: 'var(--text-secondary)' }}>
                  Comment:
                </Typography>
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.5,
                    backgroundColor: 'var(--bg-paper)',
                    borderRadius: 1,
                    border: '1px solid var(--border-color)',
                    whiteSpace: 'pre-wrap',
                    fontSize: '0.875rem',
                    color: 'var(--text-primary)'
                  }}
                >
                  {taskData.comment}
                </Paper>
              </Box>
            )}
          </Stack>
        </Paper>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Work Content Section */}
      <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', mb: 3 }}>
        {/* For Active Tasks: Show Editable Draft */}
        {isTaskActive ? (
          <>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 2
            }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                Work Content
              </Typography>
              {!isEditingDraft && canPerformActions && (
                <Button
                  size="small"
                  startIcon={<EditIcon />}
                  onClick={() => setIsEditingDraft(true)}
                  sx={{ textTransform: 'none' }}
                >
                  Edit
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
                  placeholder="Enter your work content here..."
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
                  color: (taskData.finalWork || taskData.initialWork) ? 'var(--text-primary)' : 'var(--text-light)'
                }}
              >
                {taskData.finalWork || taskData.initialWork || 'No content yet. Click "Edit" to add content.'}
              </Paper>
            )}
          </>
        ) : (
          /* For Completed Tasks: Show Side-by-Side Comparison */
          <>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'var(--text-primary)', mb: 2 }}>
              Work Content Comparison
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              gap: 2, 
              flex: 1,
              minHeight: 200,
              flexDirection: { xs: 'column', md: 'row' }
            }}>
              {/* Initial Work */}
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="caption" sx={{ color: 'var(--text-secondary)', mb: 1, fontWeight: 600 }}>
                  Initial Work
                </Typography>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    flex: 1,
                    backgroundColor: 'var(--bg-muted)',
                    borderRadius: 2,
                    border: '1px solid var(--border-color)',
                    overflow: 'auto',
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.875rem',
                    color: taskData.initialWork ? 'var(--text-primary)' : 'var(--text-light)'
                  }}
                >
                  {taskData.initialWork || 'No initial work content'}
                </Paper>
              </Box>

              {/* Final Work */}
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="caption" sx={{ color: 'var(--text-secondary)', mb: 1, fontWeight: 600 }}>
                  Final Work
                </Typography>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    flex: 1,
                    backgroundColor: 'var(--bg-muted)',
                    borderRadius: 2,
                    border: '1px solid var(--border-color)',
                    overflow: 'auto',
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.875rem',
                    color: taskData.finalWork ? 'var(--text-primary)' : 'var(--text-light)'
                  }}
                >
                  {taskData.finalWork || 'No final work content'}
                </Paper>
              </Box>
            </Box>
          </>
        )}
      </Box>

      {/* Action Buttons */}
      {canPerformActions && availableActions.length > 0 && (
        <>
          <Divider sx={{ mb: 3 }} />
          <Box sx={{ 
            display: 'flex', 
            gap: 2, 
            justifyContent: 'flex-end',
            flexWrap: 'wrap'
          }}>
            {availableActions.map((action) => {
              const config = getActionConfig(action);
              return (
                <Button
                  key={action}
                  variant={config.color === 'success' ? 'contained' : 'outlined'}
                  color={config.color}
                  startIcon={config.icon}
                  onClick={() => handleActionClick(action)}
                  disabled={isPerformingAction || isSavingDraft}
                  sx={{ textTransform: 'none' }}
                >
                  {config.label}
                </Button>
              );
            })}
          </Box>
        </>
      )}

      {/* Status message for non-active tasks */}
      {!isTaskActive && (
        <Alert severity="info" sx={{ mt: 2 }}>
          This task has been completed and can no longer be modified.
        </Alert>
      )}
      {isTaskActive && !canPerformActions && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          This task is not in a running state and cannot be modified (Status: {taskData?.status}).
        </Alert>
      )}

      {/* Action Dialog */}
      <Dialog 
        open={actionDialogOpen} 
        onClose={handleCloseActionDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedAction ? `${selectedAction.charAt(0).toUpperCase() + selectedAction.slice(1)} Task` : 'Perform Action'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {selectedAction?.toLowerCase() === 'reject' 
              ? 'Please provide a reason for rejecting this task. This action cannot be undone.'
              : 'You can optionally add a comment to explain this action.'}
          </Typography>
          <TextField
            autoFocus
            fullWidth
            multiline
            rows={4}
            label={selectedAction?.toLowerCase() === 'reject' ? 'Rejection Reason *' : 'Comment (Optional)'}
            value={actionComment}
            onChange={(e) => setActionComment(e.target.value)}
            placeholder={selectedAction?.toLowerCase() === 'reject' 
              ? 'Enter the reason for rejection...' 
              : 'Add a comment (optional)...'}
            disabled={isPerformingAction}
            error={selectedAction?.toLowerCase() === 'reject' && !actionComment.trim()}
            helperText={selectedAction?.toLowerCase() === 'reject' && !actionComment.trim() 
              ? 'Rejection reason is required' 
              : ''}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={handleCloseActionDialog} 
            disabled={isPerformingAction}
            sx={{ textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color={selectedAction ? getActionConfig(selectedAction).color : 'primary'}
            onClick={handlePerformAction}
            disabled={isPerformingAction}
            startIcon={isPerformingAction ? <CircularProgress size={16} color="inherit" /> : null}
            sx={{ textTransform: 'none' }}
          >
            {isPerformingAction 
              ? `${selectedAction?.charAt(0).toUpperCase() + selectedAction?.slice(1)}ing...` 
              : `${selectedAction?.charAt(0).toUpperCase() + selectedAction?.slice(1)} Task`}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TaskDetails;

