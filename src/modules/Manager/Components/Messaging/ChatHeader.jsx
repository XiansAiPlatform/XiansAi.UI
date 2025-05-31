import React, { useState } from 'react';
import { Box, Typography, Button, useTheme, IconButton, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Tooltip, Chip, TextField, CircularProgress } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SendIcon from '@mui/icons-material/Send';
import SettingsIcon from '@mui/icons-material/Settings';
import DeleteIcon from '@mui/icons-material/Delete';
import { getRelativeTimeString } from './utils/ConversationUtils';
import { useMessagingApi } from '../../services/messaging-api';
import { useNotification } from '../../contexts/NotificationContext';
import { useLoading } from '../../contexts/LoadingContext';

/**
 * Component to display the header of a chat thread
 * 
 * @param {Object} props
 * @param {Object} props.selectedThread - Details of the selected thread
 * @param {string} props.lastUpdateTime - Time of the last update
 * @param {Function} props.onSendMessage - Callback to open send message form (Configure & Send)
 * @param {Function} props.onQuickSend - Callback for quick send option
 * @param {Function} props.onThreadDeleted - Callback when thread is deleted
 * @param {Function} props.onRefresh - Callback to refresh conversations list
 * @param {string} props.agentName - Name of the current agent
 */
const ChatHeader = ({ selectedThread, lastUpdateTime, onSendMessage, onQuickSend, onThreadDeleted, onRefresh, agentName }) => {
    const theme = useTheme();
    const messagingApi = useMessagingApi();
    const { showSuccess, showError } = useNotification();
    const { setLoading } = useLoading();
    const [anchorEl, setAnchorEl] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [quickMessage, setQuickMessage] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSending, setIsSending] = useState(false);

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

        if (!selectedThread.participantId || !selectedThread.workflowType || !selectedThread.workflowId) {
            showError('Thread is missing required configuration. Please use "Configure & Send" instead.');
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

            await messagingApi.sendMessage(
                selectedThread.id,
                agentName,
                selectedThread.workflowType,
                selectedThread.workflowId,
                selectedThread.participantId,
                quickMessage.trim(),
                parsedMetadata // use persisted metadata if available
            );
            
            showSuccess('Message sent successfully!');
            setQuickMessage('');
            
            // Call onRefresh to update the conversation
            if (onRefresh) {
                onRefresh();
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
            showError('Failed to delete conversation. Please try again.');
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
            <Box sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1, gap: 2 }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                            <Tooltip title={selectedThread.participantId || 'User'} arrow>
                                <Chip 
                                    label={selectedThread.participantId || 'User'}
                                    size="small"
                                    color={selectedThread.isInternalThread ? "default" : "primary"}
                                    variant="outlined"
                                    sx={{ 
                                        maxWidth: '200px',
                                        '& .MuiChip-label': {
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }
                                    }}
                                />
                            </Tooltip>
                            <Typography variant="body2" color="text.secondary">
                                ↔
                            </Typography>
                            <Tooltip title={selectedThread.workflowType || 'Bot'} arrow>
                                <Chip 
                                    label={selectedThread.workflowType || 'Bot'}
                                    size="small"
                                    color="secondary"
                                    variant="outlined"
                                />
                            </Tooltip>
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0, gap: 1 }}>
                        <IconButton 
                            size="small" 
                            onClick={handleMenuOpen}
                            aria-label="thread options"
                        >
                            <MoreVertIcon />
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
                </Box>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                    {selectedThread.id && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                                Thread ID:
                            </Typography>
                            <Tooltip title={selectedThread.id} arrow>
                                <Typography 
                                    variant="body2" 
                                    color="text.secondary"
                                    sx={{ 
                                        maxWidth: '150px',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    {selectedThread.id}
                                </Typography>
                            </Tooltip>
                        </Box>
                    )}
                    {selectedThread.title && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                                Topic:
                            </Typography>
                            <Tooltip title={selectedThread.title} arrow>
                                <Typography 
                                    variant="body2" 
                                    color="text.secondary"
                                    sx={{ 
                                        maxWidth: '200px',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    {selectedThread.title}
                                </Typography>
                            </Tooltip>
                        </Box>
                    )}
                    {lastUpdateTime && (
                        <Typography variant="body2" color="text.secondary">
                            <strong>Updated:</strong> {getRelativeTimeString(lastUpdateTime)}
                        </Typography>
                    )}
                    {selectedThread.createdAt && (
                        <Typography variant="body2" color="text.secondary">
                            <strong>Started:</strong> {getRelativeTimeString(selectedThread.createdAt)}
                        </Typography>
                    )}
                </Box>

                {/* Quick Send Area - Always Visible */}
                {!selectedThread.isInternalThread && (
                    <Box sx={{ 
                        borderTop: '1px solid',
                        borderColor: theme.palette.divider,
                        pt: 2,
                        mt: 2
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                            <TextField
                                placeholder="Type your message here and press Enter to send..."
                                multiline
                                maxRows={3}
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
                                    }
                                }}
                            />
                            <Button 
                                onClick={handleQuickSendSubmit} 
                                disabled={isSending || !quickMessage.trim()}
                                variant="contained"
                                size="small"
                                startIcon={isSending ? <CircularProgress size={16} /> : <SendIcon />}
                                sx={{ flexShrink: 0, minWidth: 70, height: 40 }}
                            >
                                {isSending ? '' : 'Send'}
                            </Button>
                        </Box>
                    </Box>
                )}
            </Box>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={handleDeleteDialogClose}
            >
                <DialogTitle>Delete Conversation</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete this conversation? This action cannot be undone.
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