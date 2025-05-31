import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    CircularProgress,
    Paper,
    List,
    ListItemText,
    ListItemButton,
    Divider,
    Badge,
    useTheme,
    IconButton,
    Button,
    Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { format } from 'date-fns';
import SendMessageForm from './SendMessageForm';
import { useSlider } from '../../contexts/SliderContext';
import { useLoading } from '../../contexts/LoadingContext';

/**
 * Displays a list of conversation threads for a selected agent
 * 
 * @param {Object} props
 * @param {string} props.selectedAgentName - Name of the selected agent
 * @param {Object} props.messagingApi - API hook for messaging operations
 * @param {Function} props.showError - Function to display error notifications
 * @param {string} props.selectedThreadId - Currently selected thread ID
 * @param {Function} props.onThreadSelect - Callback when a thread is selected
 */
const ConversationThreads = ({ 
    selectedAgentName,
    messagingApi,
    showError,
    selectedThreadId,
    onThreadSelect
}) => {
    const theme = useTheme();
    const [threads, setThreads] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const { openSlider, closeSlider } = useSlider();
    const { setLoading } = useLoading();
    const [page, setPage] = useState(0);
    const [pageSize] = useState(20);
    const [hasMore, setHasMore] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);

    // Function to handle opening the form in the slider
    const handleOpenForm = () => {
        openSlider(
            <SendMessageForm
                agentName={selectedAgentName}
                threadId={null}
                onClose={() => closeSlider()}
                onMessageSent={handleMessageSent}
                initialWorkflowType={''}
                initialWorkflowId={''}
            />,
            'New Conversation'
        );
    };

    // Function to refresh threads after sending a message
    const handleMessageSent = async (newThread) => {
        if (!selectedAgentName) return;
        
        closeSlider();
        setPage(0); // Reset to first page
        setLoading(true);
        try {
            const fetchedThreads = await messagingApi.getThreads(selectedAgentName, 0, pageSize);
            setThreads(fetchedThreads || []);
            setHasMore(fetchedThreads && fetchedThreads.length === pageSize);
            
            // If we have a new thread, select it
            if (newThread && fetchedThreads.length > 0) {
                // Find the newly created thread in the fetched threads
                const createdThread = fetchedThreads.find(t => t.id === newThread.id);
                if (createdThread) {
                    onThreadSelect(createdThread.id, createdThread);
                } else if (fetchedThreads[0]) {
                    // If not found (which shouldn't happen), select the first thread
                    onThreadSelect(fetchedThreads[0].id, fetchedThreads[0]);
                }
            }
        } catch (err) {
            showError(`Failed to refresh threads: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Function to load more threads
    const handleLoadMore = async () => {
        if (!selectedAgentName || loadingMore) return;
        
        setLoadingMore(true);
        try {
            const nextPage = page + 1;
            const moreThreads = await messagingApi.getThreads(selectedAgentName, nextPage, pageSize);
            
            if (moreThreads && moreThreads.length > 0) {
                setThreads(prevThreads => [...prevThreads, ...moreThreads]);
                setPage(nextPage);
                setHasMore(moreThreads.length === pageSize);
            } else {
                setHasMore(false);
            }
        } catch (err) {
            showError(`Failed to load more threads: ${err.message}`);
        } finally {
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        // Don't fetch if no agent is selected
        if (!selectedAgentName) {
            setThreads([]);
            setError(null);
            setIsLoading(false);
            setHasMore(false);
            setPage(0);
            return;
        }

        const fetchConversationThreads = async () => {
            setLoading(true);
            setError(null);
            setPage(0); // Reset to first page when agent changes
            try {
                const fetchedThreads = await messagingApi.getThreads(selectedAgentName, 0, pageSize);
                setThreads(fetchedThreads || []);
                setHasMore(fetchedThreads && fetchedThreads.length === pageSize);

                // Check if the currently selected thread still exists
                // If not, or if no thread was selected, select the first one if available
                const currentSelectionExists = fetchedThreads.some(t => t.id === selectedThreadId);
                if ((!selectedThreadId || !currentSelectionExists) && fetchedThreads.length > 0) {
                     // Pass both the ID and the full thread object
                     onThreadSelect(fetchedThreads[0].id, fetchedThreads[0]); 
                }
            } catch (err) {
                const errorMsg = 'Failed to fetch conversation threads.';
                setError(errorMsg);
                showError(`${errorMsg}: ${err.message}`);
                console.error(err);
                setThreads([]);
                setHasMore(false);
                onThreadSelect(null); // Deselect thread on error
            } finally {
                setIsLoading(false);
                setLoading(false);
            }
        };

        fetchConversationThreads();
        // Dependency array ensures refetch when agent name, api, or notification changes
    }, [selectedAgentName, messagingApi, showError, onThreadSelect, selectedThreadId, pageSize, setLoading]);

    if (isLoading) {
        return (
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                p: 3 
            }}>
                <CircularProgress size={24} />
            </Box>
        );
    }

    return (
        <Paper 
            sx={{
                bgcolor: theme.palette.background.paper,
                border: '1px solid',
                borderColor: theme.palette.divider,
                borderRadius: 2,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            <Box sx={{ 
                    p: 2, 
                    borderBottom: '1px solid', 
                    borderColor: theme.palette.divider,
                    backgroundColor: theme.palette.background.paper,
                    borderTopLeftRadius: 1,
                    borderTopRightRadius: 1,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                <Typography variant="subtitle1" fontWeight="bold">
                    Conversations
                </Typography>
                <IconButton 
                    size="small" 
                    color="primary" 
                    onClick={handleOpenForm}
                    disabled={!selectedAgentName}
                    title="Start new conversation"
                >
                    <AddIcon />
                </IconButton>
            </Box>
            
            <Box sx={{ flex: '1 1 auto' }}>
                {error && (
                     <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                         <Typography color="error" align="center">
                             {error}
                         </Typography>
                     </Box>
                )}
                {!error && threads.length === 0 && !isLoading && (
                    <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <Typography color="text.secondary" align="center">
                            No conversation threads found
                        </Typography>
                    </Box>
                )}
                {!error && threads.length > 0 && (
                    <List disablePadding>
                        {threads.map(thread => (
                            <React.Fragment key={thread.id}>
                                <ListItemButton 
                                    selected={selectedThreadId === thread.id}
                                    onClick={() => onThreadSelect(thread.id, thread)} 
                                    sx={{
                                        px: 2,
                                        py: 1.5,
                                        minWidth: 0,
                                        '&.Mui-selected': {
                                            bgcolor: theme.palette.action.selected,
                                            borderLeft: '3px solid',
                                            borderLeftColor: theme.palette.primary.main,
                                            '&:hover': {
                                                bgcolor: theme.palette.action.hover
                                            }
                                        }
                                    }}
                                >
                                    <ListItemText 
                                        primary={
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', minWidth: 0 }}>
                                                <Tooltip title={thread.participantId || 'Unknown Participant'} arrow placement="top">
                                                    <Typography 
                                                        variant="body1" 
                                                        component="span" 
                                                        fontWeight={400}
                                                        sx={{ 
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap',
                                                            pr: 1,
                                                            flex: 1,
                                                            minWidth: 0,
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        {thread.participantId || 'Unknown Participant'}
                                                    </Typography>
                                                </Tooltip>
                                                {thread.hasUnread && (
                                                    <Badge badgeContent=" " color="primary" variant="dot" sx={{ ml: 1, flexShrink: 0 }} />
                                                )}
                                            </Box>
                                        }
                                        secondary={
                                            <Box sx={{ display: 'flex', flexDirection: 'column', mt: 0.5, minWidth: 0 }}>
                                                {thread.title && (
                                                    <Tooltip title={thread.title} arrow placement="bottom">
                                                        <Typography 
                                                            variant="caption" 
                                                            color="text.primary" 
                                                            sx={{ 
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                                whiteSpace: 'nowrap',
                                                                fontWeight: 500,
                                                                mb: 0.5,
                                                                cursor: 'pointer'
                                                            }}
                                                        >
                                                            {thread.title}
                                                        </Typography>
                                                    </Tooltip>
                                                )}
                                                <Typography 
                                                    variant="caption" 
                                                    color="text.secondary" 
                                                    sx={{ 
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap'
                                                    }}
                                                >
                                                    {thread.updatedAt ? format(new Date(thread.updatedAt), 'MMM d, h:mm a') : 'No messages yet.'}
                                                </Typography>
                                                {thread.lastMessageTime && thread.lastMessageTime !== thread.updatedAt && (
                                                    <Typography 
                                                        variant="caption" 
                                                        color="text.secondary" 
                                                        sx={{ 
                                                            mt: 0.5,
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap'
                                                        }}
                                                    >
                                                        Last: {format(new Date(thread.lastMessageTime), 'MMM d, h:mm a')}
                                                    </Typography>
                                                )}
                                                {thread.workflowType && (
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                                        <Typography 
                                                            variant="caption" 
                                                            color="text.secondary"
                                                            sx={{ fontStyle: 'italic' }}
                                                        >
                                                            Agent:
                                                        </Typography>
                                                        <Tooltip title={thread.workflowType} arrow placement="bottom">
                                                            <Typography 
                                                                variant="caption" 
                                                                color="text.secondary" 
                                                                sx={{ 
                                                                    overflow: 'hidden',
                                                                    textOverflow: 'ellipsis',
                                                                    whiteSpace: 'nowrap',
                                                                    fontStyle: 'italic',
                                                                    cursor: 'pointer',
                                                                    flex: 1,
                                                                    minWidth: 0
                                                                }}
                                                            >
                                                                {thread.workflowType}
                                                            </Typography>
                                                        </Tooltip>
                                                    </Box>
                                                )}
                                            </Box>
                                        }
                                    />
                                </ListItemButton>
                                <Divider component="li" />
                            </React.Fragment>
                        ))}
                    </List>
                )}
            </Box>
            
            {hasMore && (
                <Box sx={{ p: 1, borderTop: '1px solid', borderColor: theme.palette.divider }}>
                    <Button 
                        fullWidth 
                        onClick={handleLoadMore} 
                        disabled={loadingMore}
                        size="small"
                        sx={{ textTransform: 'none' }}
                    >
                        {loadingMore ? <CircularProgress size={16} /> : "Load more"}
                    </Button>
                </Box>
            )}
        </Paper>
    );
};

export default ConversationThreads; 