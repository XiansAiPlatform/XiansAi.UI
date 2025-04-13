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
    const scrollContainerRef = useRef(null);
    const isInitialLoad = useRef(true);

    const pageSize = 15;

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