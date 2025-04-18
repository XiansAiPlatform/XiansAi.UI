import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import {
    Box,
    Typography,
    CircularProgress,
    Paper,
    List,
    Button,
    useTheme
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { getRelativeTimeString } from './utils/ConversationUtils';
import MessageItem from './MessageItem';

/**
 * Chat conversation component that displays messages for a selected thread
 * 
 * @param {Object} props
 * @param {string} props.selectedThreadId - ID of the thread to display messages for
 * @param {Object} props.messagingApi - API hook for messaging operations
 * @param {Function} props.showError - Function to display error notifications
 * @param {Object} props.selectedThread - Details of the selected thread
 * @param {Function} props.onSendMessage - Callback to open send message form
 */
const ChatConversation = ({ 
    selectedThreadId,
    messagingApi,
    showError,
    selectedThread,
    onSendMessage
}) => {
    const theme = useTheme();
    const [messages, setMessages] = useState([]);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [messagesPage, setMessagesPage] = useState(1);
    const [hasMoreMessages, setHasMoreMessages] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdateTime, setLastUpdateTime] = useState(null);
    const scrollContainerRef = useRef(null);
    const isInitialLoad = useRef(true);
    const pollingTimerRef = useRef(null);
    const pollingCountRef = useRef(0);
    
    // Use refs to hold the function references to avoid circular dependencies
    const fetchThreadMessagesRef = useRef(null);
    const startMessagePollingRef = useRef(null);
    const stopMessagePollingRef = useRef(null);

    const pageSize = 15;
    const POLLING_INTERVAL = 5000; // 5 seconds
    const MAX_POLLING_COUNT = 24; // Poll 24 times (2 minutes total)

    // Check if a message is recent (less than 1 minute old)
    const isMessageRecent = useCallback((message) => {
        if (!message.createdAt) return false;
        const messageTime = new Date(message.createdAt).getTime();
        const now = new Date().getTime();
        const oneMinuteInMs = 60 * 1000;
        return (now - messageTime) < oneMinuteInMs;
    }, []);
    
    // Update the last update time based on latest message
    const updateLastUpdateTime = useCallback((messagesList) => {
        if (!messagesList || messagesList.length === 0) return;
        
        // Find the newest message by creation date
        const newestMessage = [...messagesList].sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
        )[0];
        
        if (newestMessage && newestMessage.createdAt) {
            setLastUpdateTime(newestMessage.createdAt);
        }
    }, []);
    
    // When selectedThread changes, initialize lastUpdateTime
    useEffect(() => {
        if (selectedThread && selectedThread.updatedAt) {
            setLastUpdateTime(selectedThread.updatedAt);
        }
    }, [selectedThread]);
    
    // Stop message polling
    stopMessagePollingRef.current = () => {
        if (pollingTimerRef.current) {
            clearTimeout(pollingTimerRef.current);
            pollingTimerRef.current = null;
        }
    };
    
    // Function to fetch messages (used for initial load and refresh)
    fetchThreadMessagesRef.current = async (threadId, page = 1, isPolling = false) => {
        if (!isPolling) {
            setIsLoadingMessages(true);
        }
        setError(null);
        
        try {
            console.log(`${isPolling ? 'Polling' : 'Loading'} messages for thread: ${threadId}, page: ${page}`);
            const threadMessages = await messagingApi.getThreadMessages(threadId, page, pageSize);
            console.log(`Loaded ${threadMessages.length} messages${isPolling ? ' from polling' : ''}`);
            
            // Sort messages on fetch (newest first)
            const sorted = threadMessages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            
            // Update the messages state
            setMessages(sorted);
            setMessagesPage(page); // Reset page number on initial fetch
            setHasMoreMessages(threadMessages.length === pageSize);
            
            // Update the last update time based on newest message
            updateLastUpdateTime(sorted);
            
            if (!isPolling) {
                isInitialLoad.current = true; // Reset initial load flag
                // Start polling for new messages
                startMessagePollingRef.current(threadId);
            }
        } catch (err) {
            if (!isPolling) {
                const errorMsg = 'Failed to fetch messages for the selected thread.';
                setError(errorMsg);
                showError(`${errorMsg}: ${err.message}`);
                console.error(err);
                setMessages([]);
                setHasMoreMessages(false);
            } else {
                console.error('Error polling for messages:', err);
            }
        } finally {
            if (!isPolling) {
                setIsLoadingMessages(false);
            }
        }
    };
    
    // Start polling for message updates
    startMessagePollingRef.current = (threadId) => {
        // Clear any existing polling
        stopMessagePollingRef.current();
        
        // Reset the polling counter
        pollingCountRef.current = 0;
        
        console.log('Starting message polling for 2 minutes');
        
        // Define the polling function
        const pollMessages = () => {
            pollingCountRef.current += 1;
            
            // Check if we've reached the max polling count
            if (pollingCountRef.current > MAX_POLLING_COUNT) {
                console.log('Message polling completed after 2 minutes');
                stopMessagePollingRef.current();
                return;
            }
            
            // Check if thread ID is still valid
            if (!threadId) {
                stopMessagePollingRef.current();
                return;
            }
            
            // Fetch messages with polling flag set to true
            fetchThreadMessagesRef.current(threadId, 1, true);
            
            // Schedule the next poll
            pollingTimerRef.current = setTimeout(pollMessages, POLLING_INTERVAL);
        };
        
        // Start the first poll after the interval
        pollingTimerRef.current = setTimeout(pollMessages, POLLING_INTERVAL);
    };
    
    // Function wrappers to use the refs - this helps React hook dependency system
    const fetchThreadMessages = useCallback((threadId, page, isPolling) => {
        fetchThreadMessagesRef.current(threadId, page, isPolling);
    }, []);
    
    const stopMessagePolling = useCallback(() => {
        stopMessagePollingRef.current();
    }, []);

    // Initial message fetch when thread ID changes
    useEffect(() => {
        // Clean up polling when thread changes
        stopMessagePolling();
        
        if (!selectedThreadId) {
            setMessages([]);
            setMessagesPage(1);
            setHasMoreMessages(true);
            setError(null);
            isInitialLoad.current = true; // Reset on thread change
            return;
        }
        fetchThreadMessages(selectedThreadId, 1);
    }, [selectedThreadId, fetchThreadMessages, stopMessagePolling]);

    // Clean up polling on unmount
    useEffect(() => {
        return () => {
            stopMessagePolling();
        };
    }, [stopMessagePolling]);

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
                
                setMessages(prevMessages => {
                    const updatedMessages = [...prevMessages, ...sortedOlder];
                    return updatedMessages;
                });
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
    }, [selectedThreadId, messagesPage, hasMoreMessages, isLoadingMore, isLoadingMessages, messagingApi, showError, pageSize]);

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
                        {/* Use lastUpdateTime instead of selectedThread.updatedAt */}
                        {lastUpdateTime && (
                            <Typography variant="body2" color="text.secondary">
                                <strong>Last update:</strong> {getRelativeTimeString(lastUpdateTime)}
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
                ref={scrollContainerRef}
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
                     <>
                          {/* Messages List - Takes remaining space */} 
                          <List sx={{ px: 1, width: '100%', py: 0 }}>
                              {sortedMessagesForDisplay.map((msg, index) => (
                                  <MessageItem 
                                      key={msg.id || index} 
                                      message={msg} 
                                      isRecent={isMessageRecent(msg)}
                                  />
                              ))}
                          </List>
  
                          {/* Load More Button at the BOTTOM */}
                          {hasMoreMessages && (
                              <Box 
                                  sx={{ 
                                      display: 'flex', 
                                      justifyContent: 'center', 
                                      py: 2,
                                      mt: 2
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

export default ChatConversation; 