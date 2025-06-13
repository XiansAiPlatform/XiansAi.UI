import { useEffect, useRef, useState, useCallback, useImperativeHandle } from 'react';
import { Paper, Box, useTheme } from '@mui/material';
import ChatHeader from '../ChatHeader';
import MessagesList from './MessagesList';
import { useLoading } from '../../../contexts/LoadingContext';
import useMessagePolling from '../hooks/useMessagePolling';
import { handleApiError } from '../../../utils/errorHandler';

/**
 * Chat conversation component that displays messages for a selected thread
 * 
 * @param {Object} props
 * @param {string} props.selectedThreadId - ID of the thread to display messages for
 * @param {Object} props.messagingApi - API hook for messaging operations
 * @param {Function} props.showError - Function to display error notifications
 * @param {Object} props.selectedThread - Details of the selected thread
 * @param {Function} props.onSendMessage - Callback to open send message form
 * @param {Function} [props.onHandover] - Optional callback to call when a thread handover is detected
 * @param {Function} [props.onRefresh] - Optional callback to refresh conversations list
 * @param {Function} [props.onThreadDeleted] - Optional callback when thread is deleted
 * @param {string} props.agentName - Name of the current agent
 */
const ChatConversation = (
    {
        ref,
        selectedThreadId,
        messagingApi,
        showError,
        selectedThread,
        onSendMessage,
        onHandover,
        onRefresh,
        onThreadDeleted,
        agentName
    }
) => {
    const theme = useTheme();
    const [messages, setMessages] = useState([]);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [messagesPage, setMessagesPage] = useState(1);
    const [hasMoreMessages, setHasMoreMessages] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdateTime, setLastUpdateTime] = useState(null);
    const [isTyping, setIsTyping] = useState(false); // Add typing indicator state
    const { setLoading } = useLoading();
    const scrollContainerRef = useRef(null);
    const isInitialLoad = useRef(true);
    const messagePollingRef = useRef(null);
    const lastHandoverIdRef = useRef(null); // Track last handover message to avoid duplicate events
    
    const pageSize = 15;

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

    // Check for handover messages and refresh thread details if detected
    const checkForHandover = useCallback((messagesList) => {
        if (!messagesList || messagesList.length === 0 || !onHandover) return;
        
        // Get current time for comparison
        const now = new Date().getTime();
        const oneMinuteInMs = 60 * 1000;
        
        // Find recent handover messages (created within the last minute)
        const handoverMessages = messagesList.filter(msg => {
            // Check if it's a handover message
            if (msg.direction !== 'Handover') return false;
            
            // Skip if we've already processed this handover message
            if (msg.id === lastHandoverIdRef.current) return false;
            
            // Only consider recent handover messages (within the last minute)
            // This prevents infinite refreshes when loading older handover messages
            if (!msg.createdAt) return false;
            const messageTime = new Date(msg.createdAt).getTime();
            return (now - messageTime) < oneMinuteInMs;
        }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        if (handoverMessages.length > 0) {
            // We found a new recent handover message
            const latestHandover = handoverMessages[0];
            console.log('Recent thread handover detected:', latestHandover.content);
            
            // Update the reference to avoid duplicate events
            lastHandoverIdRef.current = latestHandover.id;
            
            // Trigger the handover callback
            onHandover(selectedThreadId);
        }
    }, [onHandover, selectedThreadId]);
    
    // Function to fetch thread messages
    const fetchThreadMessages = useCallback(async (threadId, page = 1, isPolling = false) => {
        if (!isPolling) {
            setIsLoadingMessages(true);
            setLoading(true);
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

            // Check for handover messages
            checkForHandover(sorted);
            
            // Note: We no longer automatically start polling here
            // Polling will only be triggered when a message is sent
        } catch (err) {
            if (!isPolling) {
                const errorMsg = 'Failed to fetch messages for the selected thread.';
                setError(errorMsg);
                await handleApiError(err, errorMsg, showError);
                console.error(err);
                setMessages([]);
                setHasMoreMessages(false);
            } else {
                console.error('Error polling for messages:', err);
            }
        } finally {
            if (!isPolling) {
                setIsLoadingMessages(false);
                setLoading(false);
            }
        }
    }, [messagingApi, pageSize, showError, updateLastUpdateTime, checkForHandover, setLoading]);
    
    // Initialize the message polling hook with 60-second polling duration
    const messagePolling = useMessagePolling({
        threadId: selectedThreadId,
        fetchMessages: fetchThreadMessages,
        pollingInterval: 5000,
        pollingDuration: 60000 // Poll for 60 seconds after message sent
    });

    // Store the messagePolling in ref to break the circular dependency
    useEffect(() => {
        messagePollingRef.current = messagePolling;
    }, [messagePolling]);

    // Unified message sending function - used by both Quick Send and Configure & Send
    const sendMessage = useCallback(async (messageData) => {
        const { content, metadata, isNewThread = false } = messageData;
        
        if (!selectedThread && !isNewThread) {
            showError('No thread selected');
            return { success: false };
        }

        console.log("📤 Sending message and starting 60-second polling...");
        setIsTyping(true);
        
        try {
            let threadId = selectedThreadId;
            let response;
            
            if (isNewThread) {
                // For new threads, the calling code should handle the API call
                // This is just a placeholder for the interface
                response = messageData.response;
                threadId = response;
            } else {
                // For existing threads, send the message
                if (!selectedThread.participantId || !selectedThread.workflowType || !selectedThread.workflowId) {
                    throw new Error('Thread is missing required configuration');
                }
                
                response = await messagingApi.sendMessage(
                    selectedThreadId,
                    agentName,
                    selectedThread.workflowType,
                    selectedThread.workflowId,
                    selectedThread.participantId,
                    content,
                    metadata
                );
            }
            
            // Start polling for new messages
            if (messagePollingRef.current && threadId) {
                messagePollingRef.current.triggerPolling(threadId);
            }
            
            // Refresh messages immediately to show the sent message
            if (threadId) {
                await fetchThreadMessages(threadId, 1);
            }
            
            return { 
                success: true, 
                response,
                threadId 
            };
            
        } catch (error) {
            showError(`Error sending message: ${error.message}`);
            return { 
                success: false, 
                error: error.message 
            };
        } finally {
            setIsTyping(false);
        }
    }, [selectedThread, selectedThreadId, agentName, messagingApi, showError, messagePollingRef, fetchThreadMessages]);

    // Expose both triggerPolling and sendMessage to parent component
    useImperativeHandle(ref, () => ({
        triggerPolling: () => {
            if (messagePollingRef.current && selectedThreadId) {
                messagePollingRef.current.triggerPolling(selectedThreadId);
            }
        },
        sendMessage: sendMessage
    }), [selectedThreadId, sendMessage]);

    // Initial message fetch when thread ID changes
    useEffect(() => {
        // Clean up polling when thread changes
        if (messagePollingRef.current) {
            messagePollingRef.current.stopPolling();
        }
        
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
            await handleApiError(err, errorMsg, showError);
            // Don't clear existing messages on load more error
        } finally {
            setIsLoadingMore(false);
        }
    }, [selectedThreadId, messagesPage, hasMoreMessages, isLoadingMore, isLoadingMessages, messagingApi, showError, pageSize]);

    return (
        <Paper 
            elevation={0}
            sx={{
                display: 'flex',
                flexDirection: 'column',
                bgcolor: theme.palette.background.default,
                border: '1px solid',
                borderColor: theme.palette.divider,
                borderRadius: 2,
                overflow: 'hidden',
                width: '100%'
            }}
        >
            {/* Thread Header Component */}
            <ChatHeader 
                selectedThread={selectedThread} 
                lastUpdateTime={lastUpdateTime}
                onSendMessage={onSendMessage}
                onThreadDeleted={onThreadDeleted}
                onRefresh={onRefresh}
                agentName={agentName}
                sendMessage={sendMessage}
            />
            
            {/* Messages Container - Scrollable area */}
            <Box 
                ref={scrollContainerRef}
                sx={{ 
                    p: 2, 
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                {/* Messages List Component */}
                <MessagesList 
                    messages={messages}
                    isLoadingMessages={isLoadingMessages}
                    isLoadingMore={isLoadingMore}
                    hasMoreMessages={hasMoreMessages}
                    error={error}
                    loadMoreMessages={loadMoreMessages}
                    isMessageRecent={isMessageRecent}
                    isTyping={isTyping}
                />
            </Box>
        </Paper>
    );
};

export default ChatConversation; 
