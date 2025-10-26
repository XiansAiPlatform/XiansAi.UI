import { Fragment, useEffect, useState, useRef } from 'react';
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
import EmptyState from '../Common/EmptyState';
import { useSlider } from '../../contexts/SliderContext';
import { useLoading } from '../../contexts/LoadingContext';
import { handleApiError } from '../../utils/errorHandler';

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
    const [page, setPage] = useState(1); // 1-based pagination
    const [pageSize] = useState(20);
    const [hasMore, setHasMore] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const previousAgentRef = useRef(null);

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
        setPage(1); // Reset to first page (1-based)
        setLoading(true);
        try {
            const fetchedThreads = await messagingApi.getThreads(selectedAgentName, 1, pageSize);
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
            await handleApiError(err, 'Failed to refresh threads', showError);
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
            console.log(`Loading more threads: current page=${page}, fetching page=${nextPage}`);
            const moreThreads = await messagingApi.getThreads(selectedAgentName, nextPage, pageSize);
            
            if (moreThreads && moreThreads.length > 0) {
                // Filter out duplicates by checking existing thread IDs
                const existingIds = new Set(threads.map(t => t.id));
                const uniqueNewThreads = moreThreads.filter(t => !existingIds.has(t.id));
                
                if (uniqueNewThreads.length > 0) {
                    // We have new unique threads, append them
                    console.log(`Added ${uniqueNewThreads.length} new threads from page ${nextPage}`);
                    setThreads(prevThreads => [...prevThreads, ...uniqueNewThreads]);
                    setPage(nextPage);
                    setHasMore(moreThreads.length === pageSize);
                } else {
                    // All threads were duplicates - likely a backend pagination issue
                    // Disable "Load More" to prevent infinite duplicates
                    console.warn('Load more returned only duplicate threads - disabling pagination');
                    setHasMore(false);
                }
            } else {
                setHasMore(false);
            }
        } catch (err) {
            await handleApiError(err, 'Failed to load more threads', showError);
        } finally {
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        // Check if agent has actually changed
        const agentChanged = previousAgentRef.current !== selectedAgentName;
        previousAgentRef.current = selectedAgentName;

        // Don't fetch if no agent is selected
        if (!selectedAgentName) {
            setThreads([]);
            setError(null);
            setIsLoading(false);
            setHasMore(false);
            setPage(1);
            return;
        }

        // Only fetch if agent changed (not on every re-render)
        if (!agentChanged) {
            return;
        }

        const fetchConversationThreads = async () => {
            setLoading(true);
            setError(null);
            setPage(1); // Reset to first page when agent changes (1-based)
            try {
                const fetchedThreads = await messagingApi.getThreads(selectedAgentName, 1, pageSize);
                setThreads(fetchedThreads || []);
                setHasMore(fetchedThreads && fetchedThreads.length === pageSize);

                // Select the first thread if available
                if (fetchedThreads.length > 0) {
                     // Pass both the ID and the full thread object
                     onThreadSelect(fetchedThreads[0].id, fetchedThreads[0]); 
                }
            } catch (err) {
                const errorMsg = 'Failed to fetch conversation threads.';
                setError(errorMsg);
                await handleApiError(err, errorMsg, showError);
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
        // Only re-run when selectedAgentName changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedAgentName]);

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
        (<Paper 
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
                    <EmptyState
                        title=""
                        description="No conversation threads found for this agent. Start a new conversation to begin."
                        context="conversations"
                    />
                )}
                {!error && threads.length > 0 && (
                    <List disablePadding>
                        {threads.map(thread => (
                            <Fragment key={thread.id}>
                                <ListItemButton 
                                    selected={selectedThreadId === thread.id}
                                    onClick={() => onThreadSelect(thread.id, thread)} 
                                    sx={{
                                        px: 2,
                                        py: 1.5,
                                        minWidth: 0,
                                        borderRadius: 'var(--radius-md)',
                                        margin: '4px 8px',
                                        transition: 'all 0.2s ease',
                                        '&.Mui-selected': {
                                            bgcolor: 'var(--primary-lighter)',
                                            borderLeft: '3px solid var(--primary)',
                                            '&:hover': {
                                                bgcolor: 'var(--bg-hover)'
                                            }
                                        },
                                        '&:hover': {
                                            bgcolor: 'var(--bg-hover)',
                                            transform: 'translateX(4px)'
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
                                                        {thread.participantId 
                                                            ? thread.participantId.substring(0, 12) + (thread.participantId.length > 12 ? '...' : '')
                                                            : 'Unknown Participant'
                                                        }
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
                                                            
                                                        </Typography>
                                                        <Tooltip title={thread.workflowType} arrow placement="bottom">
                                                            <Typography 
                                                                variant="caption" 
                                                                color="text.secondary" 
                                                                sx={{ 
                                                                    fontStyle: 'italic',
                                                                    cursor: 'pointer',
                                                                    flex: 1,
                                                                    minWidth: 0
                                                                }}
                                                            >
                                                                {thread.workflowType 
                                                                    ? thread.workflowType.split(':')[1] || thread.workflowType
                                                                    : ''
                                                                }
                                                            </Typography>
                                                        </Tooltip>
                                                    </Box>
                                                )}
                                            </Box>
                                        }
                                        secondaryTypographyProps={{ component: 'div' }}
                                    />
                                </ListItemButton>
                                <Divider component="li" />
                            </Fragment>
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
        </Paper>)
    );
};

export default ConversationThreads; 
