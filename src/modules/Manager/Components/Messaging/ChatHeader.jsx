import { useState, useEffect } from 'react';
import { Box, Typography, Button, useTheme, IconButton, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Tooltip, Chip, TextField, CircularProgress } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SendIcon from '@mui/icons-material/Send';
import SettingsIcon from '@mui/icons-material/Settings';
import DeleteIcon from '@mui/icons-material/Delete';
import { getRelativeTimeString } from './utils/ConversationUtils';
import { useMessagingApi } from '../../services/messaging-api';
import { useNotification } from '../../contexts/NotificationContext';
import { useLoading } from '../../contexts/LoadingContext';
import { handleApiError } from '../../utils/errorHandler';

/**
 * Component to display the header of a chat thread
 * 
 * @param {Object} props
 * @param {Object} props.selectedThread - Details of the selected thread
 * @param {string} props.lastUpdateTime - Time of the last update
 * @param {Function} props.onSendMessage - Callback to open send message form (Configure & Send)
 * @param {Function} props.sendMessage - Unified function to send messages with typing indicator and polling
 * @param {Function} props.onThreadDeleted - Callback when thread is deleted
 * @param {Function} props.onRefresh - Callback to refresh conversations list
 * @param {string} props.agentName - Name of the current agent
 * @param {string|null} props.selectedScope - Currently selected topic/scope for messages
 */
const ChatHeader = ({ selectedThread, lastUpdateTime, onSendMessage, sendMessage, onThreadDeleted, onRefresh, agentName, selectedScope }) => {
    const theme = useTheme();
    const messagingApi = useMessagingApi();
    const { showSuccess, showError } = useNotification();
    const { setLoading } = useLoading();
    const [anchorEl, setAnchorEl] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [quickMessage, setQuickMessage] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSending, setIsSending] = useState(false);

    // Load draft message from localStorage when thread changes
    useEffect(() => {
        if (selectedThread?.id) {
            const draftKey = `message_draft_${selectedThread.id}`;
            const savedDraft = localStorage.getItem(draftKey);
            if (savedDraft) {
                setQuickMessage(savedDraft);
            } else {
                setQuickMessage('');
            }
        }
    }, [selectedThread?.id]);

    // Save draft message to localStorage as user types
    useEffect(() => {
        if (selectedThread?.id) {
            const draftKey = `message_draft_${selectedThread.id}`;
            if (quickMessage.trim()) {
                localStorage.setItem(draftKey, quickMessage);
            } else {
                localStorage.removeItem(draftKey);
            }
        }
    }, [quickMessage, selectedThread?.id]);

    // Helper function to get display name for workflow
    const getWorkflowDisplayName = () => {
        if (!selectedThread.workflowType) return 'Bot';
        
        const workflowTypeParts = selectedThread.workflowType.split(':');
        const baseWorkflowName = workflowTypeParts[1]?.trim() || selectedThread.workflowType;
        
        // Check if name is available as a separate field
        if (selectedThread.name && selectedThread.name.trim()) {
            return `${baseWorkflowName} - ${selectedThread.name.trim()}`;
        }
        
        // Otherwise, check if name is part of workflowType (3rd part after splitting by ':')
        if (workflowTypeParts.length > 2 && workflowTypeParts[2]?.trim()) {
            return `${baseWorkflowName} - ${workflowTypeParts[2].trim()}`;
        }
        
        return baseWorkflowName;
    };

    if (!selectedThread) return null;

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleQuickSendSubmit = async () => {
        if (!quickMessage.trim()) {
            showError('Please enter a message');
            return;
        }

        // workflowId can be null for singleton instances
        if (!selectedThread.participantId || !selectedThread.workflowType) {
            console.error('Thread is missing required configuration:participantId:', selectedThread.participantId, 'workflowType:', selectedThread.workflowType, 'workflowId:', selectedThread.workflowId);
            showError('Thread is missing required configuration. Please use "Configure & Send" instead.');
            return;
        }

        if (!sendMessage) {
            showError('Send function not available');
            return;
        }

        setIsSending(true);
        try {
            // Retrieve persisted metadata from localStorage
            let parsedMetadata = null;
            const savedMetadata = localStorage.getItem('sendMessageForm_metadata');
            if (savedMetadata && savedMetadata.trim()) {
                try {
                    parsedMetadata = JSON.parse(savedMetadata);
                } catch (error) {
                    console.warn('Invalid metadata in localStorage, skipping:', error);
                    // Continue with null metadata rather than failing
                }
            }

            // Use the unified sendMessage function with the currently selected scope
            const result = await sendMessage({
                content: quickMessage.trim(),
                metadata: parsedMetadata,
                isNewThread: false,
                scope: selectedScope // Use the currently selected scope from Topics panel
            });
            
            if (result.success) {
                showSuccess('Message sent successfully!');
                setQuickMessage('');
                // Clear the draft from localStorage
                if (selectedThread?.id) {
                    const draftKey = `message_draft_${selectedThread.id}`;
                    localStorage.removeItem(draftKey);
                }
            }
        } catch (error) {
            showError(`Error sending message: ${error.message}`);
        } finally {
            setIsSending(false);
        }
    };

    const handleQuickSendKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey && !isSending && quickMessage.trim()) {
            e.preventDefault();
            handleQuickSendSubmit();
        }
    };

    const handleConfigureSend = () => {
        handleMenuClose();
        if (onSendMessage) {
            onSendMessage();
        }
    };

    const handleDeleteClick = () => {
        handleMenuClose();
        setDeleteDialogOpen(true);
    };

    const handleDeleteDialogClose = () => {
        setDeleteDialogOpen(false);
    };

    const handleDeleteConfirm = async () => {
        try {
            setIsDeleting(true);
            setLoading(true);
            await messagingApi.deleteThread(selectedThread.id);
            setDeleteDialogOpen(false);
            showSuccess('Conversation deleted successfully');
            
            if (onThreadDeleted) {
                onThreadDeleted(selectedThread.id);
            }
            
            if (onRefresh) {
                onRefresh();
            }
        } catch (error) {
            console.error('Failed to delete thread:', error);
            await handleApiError(error, 'Failed to delete conversation. Please try again', showError);
        } finally {
            setIsDeleting(false);
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{ 
                bgcolor: theme.palette.background.paper, 
                borderBottom: '1px solid',
                borderColor: theme.palette.divider,
                borderTopLeftRadius: 1,
                borderTopRightRadius: 1
            }}
        >
            {/* Main Header Content */}
            <Box sx={{ p: 1.5 }}>
                {/* Compact header row */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, gap: 2 }}>
                    <Box sx={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Tooltip title={selectedThread.participantId || 'User'} arrow>
                            <Chip 
                                label={selectedThread.participantId || 'User'}
                                size="small"
                                color={selectedThread.isInternalThread ? "default" : "primary"}
                                variant="outlined"
                                sx={{ 
                                    maxWidth: '180px',
                                    '& .MuiChip-label': {
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }
                                }}
                            />
                        </Tooltip>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                            ↔
                        </Typography>
                        <Tooltip title={selectedThread.workflowType || 'Bot'} arrow>
                            <Chip 
                                label={getWorkflowDisplayName()}
                                size="small"
                                color="secondary"
                                variant="outlined"
                                sx={{ 
                                    maxWidth: '180px',
                                    '& .MuiChip-label': {
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }
                                }}
                            />
                        </Tooltip>
                        {lastUpdateTime && (
                            <Typography variant="caption" color="text.secondary" sx={{ ml: 1, fontSize: '0.7rem' }}>
                                {getRelativeTimeString(lastUpdateTime)}
                            </Typography>
                        )}
                    </Box>
                    <IconButton 
                        size="small" 
                        onClick={handleMenuOpen}
                        aria-label="thread options"
                        sx={{ flexShrink: 0 }}
                    >
                        <MoreVertIcon fontSize="small" />
                    </IconButton>
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                    >
                        {!selectedThread.isInternalThread && (
                            <MenuItem onClick={handleConfigureSend}>
                                <SettingsIcon sx={{ mr: 1, fontSize: 20 }} />
                                Configure & Send
                            </MenuItem>
                        )}
                        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
                            <DeleteIcon sx={{ mr: 1, fontSize: 20 }} />
                            Delete Conversation
                        </MenuItem>
                    </Menu>
                </Box>

                {/* Quick Send Area - Compact */}
                {!selectedThread.isInternalThread && (
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                        <TextField
                            placeholder={
                                selectedScope === null 
                                    ? "Type message (No Topic)..." 
                                    : selectedScope === '' 
                                    ? 'Type message (Empty Topic)...' 
                                    : selectedScope 
                                    ? `Message for "${selectedScope}"...`
                                    : "Type your message..."
                            }
                            multiline
                            maxRows={2}
                            value={quickMessage}
                            onChange={(e) => setQuickMessage(e.target.value)}
                            onKeyDown={handleQuickSendKeyDown}
                            fullWidth
                            disabled={isSending}
                            variant="outlined"
                            size="small"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    backgroundColor: theme.palette.background.default,
                                    fontSize: '0.875rem'
                                }
                            }}
                        />
                        <Button 
                            onClick={handleQuickSendSubmit} 
                            disabled={isSending || !quickMessage.trim()}
                            variant="contained"
                            size="small"
                            startIcon={isSending ? <CircularProgress size={14} /> : <SendIcon fontSize="small" />}
                            sx={{ flexShrink: 0, minWidth: 65, height: 36, fontSize: '0.813rem' }}
                        >
                            {isSending ? '' : 'Send'}
                        </Button>
                    </Box>
                )}
            </Box>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={handleDeleteDialogClose}
            >
                <DialogTitle>Delete All Topics in Conversation</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete this conversation including all topics and messages? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteDialogClose} disabled={isDeleting}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleDeleteConfirm} 
                        color="error" 
                        variant="contained"
                        disabled={isDeleting}
                    >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ChatHeader; 
