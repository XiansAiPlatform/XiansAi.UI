import React, { useState } from 'react';
import { Box, Typography, Button, useTheme, IconButton, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Tooltip, Chip } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
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
 * @param {Function} props.onSendMessage - Callback to open send message form
 * @param {Function} props.onThreadDeleted - Callback when thread is deleted
 * @param {Function} props.onRefresh - Callback to refresh conversations list
 */
const ChatHeader = ({ selectedThread, lastUpdateTime, onSendMessage, onThreadDeleted, onRefresh }) => {
    const theme = useTheme();
    const messagingApi = useMessagingApi();
    const { showSuccess, showError } = useNotification();
    const { setLoading } = useLoading();
    const [anchorEl, setAnchorEl] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    if (!selectedThread) return null;

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
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
                p: 2, 
                bgcolor: theme.palette.background.paper, 
                borderBottom: '1px solid',
                borderColor: theme.palette.divider,
                borderTopLeftRadius: 1,
                borderTopRightRadius: 1
            }}
        >
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
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                    {!selectedThread.isInternalThread && (
                        <Button 
                            variant="outlined" 
                            color="primary" 
                            size="small"
                            onClick={onSendMessage}
                            sx={{ 
                                fontWeight: 500,
                                textTransform: 'none',
                                px: 2,
                                mr: 1
                            }}
                        >
                            Send Message
                        </Button>
                    )}
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
                        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
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