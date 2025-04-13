import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import {
    Box,
    Typography,
    CircularProgress,
    Paper,
    List,
    ListItemText,
    ListItemButton,
    Divider,
    Chip,
    Badge,
    useTheme,
    Button,
    IconButton,
    Collapse,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow
} from '@mui/material';
import { format } from 'date-fns';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

// Added hooks
import { useMessagingApi } from '../../services/messaging-api'; 
import { useNotification } from '../../contexts/NotificationContext';

// Utility function for relative time
const getRelativeTimeString = (dateString) => {
    if (!dateString) return 'Unknown date';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInSecs = Math.floor(diffInMs / 1000);
    const diffInMins = Math.floor(diffInSecs / 60);
    const diffInHours = Math.floor(diffInMins / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (diffInSecs < 60) {
        return 'just now';
    } else if (diffInMins < 60) {
        return `${diffInMins} ${diffInMins === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffInHours < 24) {
        return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffInDays === 1) {
        return 'yesterday';
    } else if (diffInDays < 7) {
        return `${diffInDays} days ago`;
    } else {
        // For older dates, show the actual date
        return date.toLocaleDateString();
    }
};

export const MessageItem = ({ message }) => {
    const theme = useTheme();
    const [expanded, setExpanded] = useState(false);
    const isIncoming = message.direction === 'Incoming';
    const formattedDate = message.createdAt ? format(new Date(message.createdAt), 'MMM d, yyyy h:mm a') : '';
    const messageContent = message.content?.replace(/^"|"$/g, '') || '';
    
    // Format status for display
    const formatStatus = (status) => {
        if (!status) return 'Unknown';
        
        // Add spaces before capital letters and capitalize first letter
        return status
            .replace(/([A-Z])/g, ' $1')
            .replace(/^\s/, '')
            .replace(/^./, str => str.toUpperCase());
    };
    
    const handleExpandClick = (e) => {
        e.stopPropagation();
        setExpanded(!expanded);
    };
    
    return (
        <Box 
            sx={{ 
                display: 'flex', 
                justifyContent: isIncoming ? 'flex-start' : 'flex-end',
                mb: expanded ? 2 : 1,
                width: '100%'
            }}
        >
            <Paper 
                elevation={0} 
                sx={{
                    p: 1.5,
                    width: '70%',
                    backgroundColor: isIncoming ? theme.palette.grey[50] : theme.palette.grey[100],
                    color: isIncoming ? theme.palette.text.primary : theme.palette.text.primary,
                    borderRadius: theme.shape.borderRadius,
                    position: 'relative',
                    border: '1px solid',
                    borderColor: isIncoming ? theme.palette.grey[200] : theme.palette.grey[300],
                    borderLeftWidth: '4px',
                    borderLeftColor: isIncoming ? theme.palette.info.light : theme.palette.primary.light,
                }}
            >
                <Box sx={{ mb: 0.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary" fontWeight="medium">
                        {message.participantChannelId}
                    </Typography>
                    <Box display="flex" alignItems="center">
                        <Chip 
                            label={message.direction} 
                            size="small" 
                            color={message.direction === 'Incoming' ? 'info' : 'primary'} 
                            sx={{ 
                                height: 18,
                                '& .MuiChip-label': { 
                                    px: 1,
                                    fontSize: '0.65rem'
                                }
                            }} 
                        />
                        <Chip 
                            label={formatStatus(message.status)} 
                            size="small" 
                            color="default"
                            sx={{ 
                                ml: 1, 
                                height: 18,
                                '& .MuiChip-label': { 
                                    px: 1,
                                    fontSize: '0.65rem'
                                }
                            }} 
                        />
                        <IconButton 
                            size="small" 
                            onClick={handleExpandClick}
                            sx={{ 
                                ml: 0.5, 
                                color: theme.palette.grey[600],
                                p: 0.3,
                                width: 20,
                                height: 20
                            }}
                        >
                            {expanded ? <ExpandLessIcon fontSize="inherit" /> : <ExpandMoreIcon fontSize="inherit" />}
                        </IconButton>
                    </Box>
                </Box>
                
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.4 }}>{messageContent}</Typography>
                
                <Typography 
                    variant="caption" 
                    sx={{ 
                        display: 'block', 
                        textAlign: 'right', 
                        mt: 0.5,
                        color: 'text.secondary'
                    }}
                >
                    {formattedDate}
                </Typography>
                
                <Collapse in={expanded} timeout="auto" unmountOnExit sx={{ mt: 2 }}>
                    <Divider sx={{ my: 1, borderColor: theme.palette.grey[300] }} />
                    
                    <Typography 
                        variant="caption" 
                        sx={{ 
                            display: 'block', 
                            fontWeight: 'bold',
                            mb: 1,
                            color: theme.palette.text.secondary
                        }}
                    >
                        Message Details
                    </Typography>
                    
                    <TableContainer component={Box} sx={{ 
                        backgroundColor: 'transparent',
                        fontSize: '0.75rem'
                    }}>
                        <Table size="small" sx={{ 
                            '& .MuiTableCell-root': { 
                                borderColor: theme.palette.grey[300],
                                py: 0.3,
                                px: 1
                            }
                        }}>
                            <TableBody>
                                <TableRow>
                                    <TableCell component="th" sx={{ 
                                        fontWeight: 'bold', 
                                        width: '30%',
                                        color: theme.palette.text.secondary
                                    }}>
                                        Message ID
                                    </TableCell>
                                    <TableCell sx={{ 
                                        color: theme.palette.text.primary,
                                        wordBreak: 'break-all'
                                    }}>
                                        {message.id}
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell component="th" sx={{ 
                                        fontWeight: 'bold',
                                        color: theme.palette.text.secondary
                                    }}>
                                        Thread ID
                                    </TableCell>
                                    <TableCell sx={{ 
                                        color: theme.palette.text.primary,
                                        wordBreak: 'break-all'
                                    }}>
                                        {message.threadId}
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell component="th" sx={{ 
                                        fontWeight: 'bold',
                                        color: theme.palette.text.secondary
                                    }}>
                                        Tenant ID
                                    </TableCell>
                                    <TableCell sx={{ color: theme.palette.text.primary }}>
                                        {message.tenantId}
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell component="th" sx={{ 
                                        fontWeight: 'bold',
                                        color: theme.palette.text.secondary
                                    }}>
                                        Direction
                                    </TableCell>
                                    <TableCell sx={{ color: theme.palette.text.primary }}>
                                        {message.direction}
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell component="th" sx={{ 
                                        fontWeight: 'bold',
                                        color: theme.palette.text.secondary
                                    }}>
                                        Status
                                    </TableCell>
                                    <TableCell sx={{ color: theme.palette.text.primary }}>
                                        {formatStatus(message.status)}
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell component="th" sx={{ 
                                        fontWeight: 'bold',
                                        color: theme.palette.text.secondary
                                    }}>
                                        Created By
                                    </TableCell>
                                    <TableCell sx={{ color: theme.palette.text.primary }}>
                                        {message.createdBy}
                                    </TableCell>
                                </TableRow>
                                {message.metadata && (
                                <TableRow>
                                    <TableCell component="th" sx={{ 
                                        fontWeight: 'bold',
                                        color: theme.palette.text.secondary
                                    }}>
                                        Metadata
                                    </TableCell>
                                    <TableCell sx={{ 
                                        color: theme.palette.text.primary,
                                        wordBreak: 'break-all'
                                    }}>
                                        {typeof message.metadata === 'object' 
                                            ? JSON.stringify(message.metadata) 
                                            : message.metadata}
                                    </TableCell>
                                </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    
                    {message.logs && message.logs.length > 0 && (
                        <>
                            <Typography 
                                variant="caption" 
                                sx={{ 
                                    display: 'block', 
                                    fontWeight: 'bold',
                                    mt: 2,
                                    mb: 1,
                                    color: theme.palette.text.secondary
                                }}
                            >
                                Message Logs
                            </Typography>
                            <TableContainer component={Box} sx={{ backgroundColor: 'transparent' }}>
                                <Table size="small" sx={{ 
                                    '& .MuiTableCell-root': { 
                                        borderColor: theme.palette.grey[300],
                                        py: 0.5,
                                        px: 1
                                    }
                                }}>
                                    <TableBody>
                                        {message.logs.map((log, index) => (
                                            <TableRow key={index}>
                                                <TableCell component="th" sx={{ 
                                                    fontWeight: 'bold',
                                                    width: '30%',
                                                    color: theme.palette.text.secondary
                                                }}>
                                                    {log.event}
                                                </TableCell>
                                                <TableCell sx={{ color: theme.palette.text.primary }}>
                                                    {format(new Date(log.timestamp), 'MMM d, yyyy h:mm:ss a')}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </>
                    )}
                </Collapse>
            </Paper>
        </Box>
    );
};

// Refactored ChatConversation
export const ChatConversation = ({ 
    selectedThreadId, // ID of the thread to display messages for
    messagingApi,     // API hook
    showError,        // Notification hook
    selectedThread,   // Details of the selected thread (passed from parent)
    onSendMessage     // Callback to open send message form
}) => {
    const theme = useTheme();
    const [messages, setMessages] = useState([]);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [messagesPage, setMessagesPage] = useState(1);
    const [hasMoreMessages, setHasMoreMessages] = useState(true);
    const [error, setError] = useState(null);
    const scrollContainerRef = useRef(null); // Ref for the container to check scroll
    const isInitialLoad = useRef(true); // Track initial load

    const pageSize = 15; // Increase page size slightly

    // Function to fetch messages (used for initial load and refresh)
    const fetchThreadMessages = useCallback(async (threadId, page = 1) => {
        setIsLoadingMessages(true);
        setError(null);
        try {
            console.log(`Loading messages for thread: ${threadId}, page: ${page}`);
            const threadMessages = await messagingApi.getThreadMessages(threadId, page, pageSize);
            console.log(`Loaded ${threadMessages.length} messages`);
            
            // Sort messages on fetch (newest first)
            const sorted = threadMessages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            
            setMessages(sorted); 
            setMessagesPage(page); // Reset page number on initial fetch
            setHasMoreMessages(threadMessages.length === pageSize);
            isInitialLoad.current = true; // Reset initial load flag

        } catch (err) {
            const errorMsg = 'Failed to fetch messages for the selected thread.';
            setError(errorMsg);
            showError(`${errorMsg}: ${err.message}`);
            console.error(err);
            setMessages([]);
            setHasMoreMessages(false);
        } finally {
            setIsLoadingMessages(false);
        }
    }, [messagingApi, showError, pageSize]);

    // Initial message fetch when thread ID changes
    useEffect(() => {
        if (!selectedThreadId) {
            setMessages([]);
            setMessagesPage(1);
            setHasMoreMessages(true);
            setError(null);
            isInitialLoad.current = true; // Reset on thread change
            return;
        }
        fetchThreadMessages(selectedThreadId, 1);
    }, [selectedThreadId, fetchThreadMessages]);

    // Function to load more messages
    const loadMoreMessages = useCallback(async () => {
        if (!selectedThreadId || !hasMoreMessages || isLoadingMore || isLoadingMessages) {
            console.log("Cannot load more messages:", { selectedThreadId, hasMoreMessages, isLoadingMore, isLoadingMessages });
            return;
        }

        console.log("Loading more messages, page:", messagesPage + 1);
        setIsLoadingMore(true);
        setError(null);
        try {
            const nextPage = messagesPage + 1;
            const olderMessages = await messagingApi.getThreadMessages(selectedThreadId, nextPage, pageSize);
            console.log(`Loaded ${olderMessages.length} older messages`);
            
            if (olderMessages.length > 0) {
                // Sort new messages before appending
                const sortedOlder = olderMessages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                
                setMessages(prevMessages => [...prevMessages, ...sortedOlder]);
                setMessagesPage(nextPage);
                setHasMoreMessages(olderMessages.length === pageSize);
            } else {
                setHasMoreMessages(false);
            }
        } catch (err) {
            const errorMsg = 'Failed to load more messages.';
            setError(errorMsg); // Show error specific to loading more
            showError(`${errorMsg}: ${err.message}`);
            console.error(err);
            // Don't clear existing messages on load more error
        } finally {
            setIsLoadingMore(false);
        }
    }, [selectedThreadId, messagesPage, hasMoreMessages, isLoadingMessages, isLoadingMore, messagingApi, showError, pageSize]);

    // Sort messages whenever the messages array changes
    // Messages are fetched newest first, older messages are appended.
    // We want newest at the *top* of the display list (reversed order from before)
    const sortedMessagesForDisplay = useMemo(() => 
        [...messages].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
        [messages]
    );

    return (
        <Paper 
            elevation={0}
            sx={{
                display: 'flex',
                flexDirection: 'column',
                bgcolor: theme.palette.background.default,
                border: '1px solid',
                borderColor: theme.palette.divider,
                borderRadius: theme.shape.borderRadius,
                overflow: 'hidden',
                width: '100%'
            }}
        >
            {/* Thread Header */}
            {selectedThread && (
                <Box
                    sx={{ 
                        p: 2, 
                        bgcolor: theme.palette.background.paper, 
                        borderBottom: '1px solid',
                        borderColor: theme.palette.divider,
                        borderTopLeftRadius: `calc(${theme.shape.borderRadius}px - 1px)`,
                        borderTopRightRadius: `calc(${theme.shape.borderRadius}px - 1px)`
                    }}
                >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                            {selectedThread.participantId || 'Conversation'}
                        </Typography>
                        <Button 
                            variant="outlined" 
                            color="primary" 
                            size="small"
                            onClick={onSendMessage}
                            sx={{ 
                                fontWeight: 500,
                                textTransform: 'none',
                                px: 2
                            }}
                        >
                            Send Message
                        </Button>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <Typography variant="body2" color="text.secondary">
                            <strong>Thread ID:</strong> {selectedThread.id}
                        </Typography>
                        {selectedThread.title && (
                            <Typography variant="body2" color="text.secondary">
                                <strong>Topic:</strong> {selectedThread.title}
                            </Typography>
                        )}
                        {selectedThread.updatedAt && (
                            <Typography variant="body2" color="text.secondary">
                                <strong>Last update:</strong> {getRelativeTimeString(selectedThread.updatedAt)}
                            </Typography>
                        )}
                        {selectedThread.createdAt && (
                            <Typography variant="body2" color="text.secondary">
                                <strong>Started:</strong> {getRelativeTimeString(selectedThread.createdAt)}
                            </Typography>
                        )}
                    </Box>
                </Box>
            )}
            
            {/* Messages Container - Scrollable area */}
            <Box 
                ref={scrollContainerRef} // Add ref here
                sx={{ 
                    p: 2, 
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                {isLoadingMessages && messages.length === 0 ? (
                    // Centered Loading Spinner for initial load
                    <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                         <CircularProgress />
                    </Box>
                ) : error ? (
                     // Centered Error Message
                     <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                         <Box sx={{ p: 3 }}>
                             <Typography variant="body1" color="error" sx={{ mb: 1 }}>
                                 Error loading messages
                             </Typography>
                             <Typography variant="body2" color="text.secondary">
                                 {error} - Check console.
                             </Typography>
                         </Box>
                     </Box>
                 ) : messages.length === 0 ? (
                     // Centered No Messages Found
                     <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                         <Box sx={{ p: 3 }}>
                             <Typography variant="body1" sx={{ mb: 1 }}>
                                 No messages found
                             </Typography>
                             <Typography variant="body2" color="text.secondary">
                                 Start a conversation or select another thread
                             </Typography>
                         </Box>
                     </Box>
                 ) : (
                     // Actual Messages List and Load More Button
                     <>
                          {/* Messages List - Takes remaining space */} 
                          <List sx={{ px: 1, width: '100%', py: 0 }}> {/* Removed mt:auto, padding y */} 
                              {sortedMessagesForDisplay.map((msg, index) => (
                                  <MessageItem key={msg.id || index} message={msg} />
                              ))}
                          </List>
  
                          {/* Load More Button at the BOTTOM */}
                          {hasMoreMessages && (
                              <Box 
                                  sx={{ 
                                      display: 'flex', 
                                      justifyContent: 'center', 
                                      py: 2,
                                      mt: 2  // Add margin at top
                                  }}
                              >
                                  <Button 
                                      size="small" 
                                      onClick={loadMoreMessages}
                                      disabled={isLoadingMore || isLoadingMessages}
                                      startIcon={isLoadingMore ? <CircularProgress size={16} /> : <ExpandMoreIcon />}
                                      variant="outlined"
                                      color="primary"
                                      sx={{ textTransform: 'none' }}
                                  >
                                      {isLoadingMore ? 'Loading...' : 'Load older messages'}
                                  </Button>
                              </Box>
                          )}
                     </>
                 )}
            </Box>
        </Paper>
    );
};

// Refactored ConversationThreads
export const ConversationThreads = ({ 
    selectedWorkflowId, // ID of the workflow to fetch threads for
    messagingApi,       // API hook
    showError,          // Notification hook
    selectedThreadId,   // Currently selected thread ID (passed from parent)
    onThreadSelect      // Callback when a thread is selected
}) => {
    const theme = useTheme();
    const [threads, setThreads] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Don't fetch if no workflow is selected
        if (!selectedWorkflowId) {
            setThreads([]);
            setError(null);
            setIsLoading(false);
            return;
        }

        const fetchConversationThreads = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const fetchedThreads = await messagingApi.getThreads(selectedWorkflowId);
                setThreads(fetchedThreads || []);

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
                onThreadSelect(null); // Deselect thread on error
            } finally {
                setIsLoading(false);
            }
        };

        fetchConversationThreads();
        // Dependency array ensures refetch when workflow ID, api, or notification changes
    }, [selectedWorkflowId, messagingApi, showError, onThreadSelect, selectedThreadId]);

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
                borderRadius: theme.shape.borderRadius,
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
                    borderTopLeftRadius: `calc(${theme.shape.borderRadius}px - 1px)`,
                    borderTopRightRadius: `calc(${theme.shape.borderRadius}px - 1px)`
                }}>
                <Typography variant="subtitle1" fontWeight="bold">
                    Conversations
                </Typography>
            </Box>
            
            <Box sx={{ flex: '1 1 auto' }}> {/* Allow content to determine size */}
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
                                    // Pass both the ID and the full thread object on click
                                    onClick={() => onThreadSelect(thread.id, thread)} 
                                    sx={{
                                        px: 2,
                                        py: 1.5,
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
                                        primary={thread.participantId || thread.title || `Thread ${thread.id.slice(-4)}`}
                                        secondary={thread.updatedAt ? format(new Date(thread.updatedAt), 'MMM d, yyyy h:mm a') : 'No date'}
                                        primaryTypographyProps={{
                                            fontWeight: selectedThreadId === thread.id ? 'bold' : 'medium',
                                            variant: 'body2',
                                            noWrap: true
                                        }}
                                        secondaryTypographyProps={{
                                            variant: 'caption',
                                            noWrap: true
                                        }}
                                        sx={{ mr: 1 }}
                                    />
                                    {thread.messageCount > 0 && (
                                        <Badge 
                                            badgeContent={thread.messageCount} 
                                            color="primary"
                                            sx={{
                                                '& .MuiBadge-badge': {
                                                    fontSize: '0.7rem'
                                                }
                                            }}
                                        />
                                    )}
                                </ListItemButton>
                                <Divider component="li" />
                            </React.Fragment>
                        ))}
                    </List>
                )}
            </Box>
        </Paper>
    );
}; 