import { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { Paper, Box, useTheme } from '@mui/material';
import ChatHeader from '../ChatHeader';
import MessagesList from './MessagesList';
import { useLoading } from '../../../contexts/LoadingContext';
import useMessageStreaming from '../hooks/useMessageStreaming';
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
 * @param {string|null} [props.selectedScope] - Optional scope filter for messages (null = no scope/default, undefined = all)
 */
const ChatConversation = forwardRef((
    {
        selectedThreadId,
        messagingApi,
        showError,
        selectedThread,
        onSendMessage,
        onHandover,
        onRefresh,
        onThreadDeleted,
        agentName,
        selectedScope = undefined
    },
    ref
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
    const messageStreamingRef = useRef(null);
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
            
            // Update the reference to avoid duplicate events
            lastHandoverIdRef.current = latestHandover.id;
            
            // Trigger the handover callback
            onHandover(selectedThreadId);
        }
    }, [onHandover, selectedThreadId]);
    
    // Function to fetch thread messages
    const fetchThreadMessages = useCallback(async (threadId, page = 1, scope = undefined) => {
        setIsLoadingMessages(true);
        setLoading(true);
        setError(null);
        
        try {
            const threadMessages = await messagingApi.getThreadMessages(threadId, page, pageSize, scope);
            
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
            
        } catch (err) {
            const errorMsg = 'Failed to fetch messages for the selected thread.';
            setError(errorMsg);
            await handleApiError(err, errorMsg, showError);
            console.error(err);
            setMessages([]);
            setHasMoreMessages(false);
        } finally {
            setIsLoadingMessages(false);
            setLoading(false);
        }
    }, [messagingApi, pageSize, showError, updateLastUpdateTime, checkForHandover, setLoading]);
    
    // Callback to handle new messages from SSE stream
    const handleStreamMessage = useCallback((messageData) => {
        // Reduced logging to improve performance
        console.log('[SSE] New message received:', messageData.id);
        
        // Filter message by scope if a scope is selected
        // If selectedScope is null, only show messages with null/undefined scope
        // If selectedScope is undefined (all messages), show everything
        // If selectedScope has a value, only show messages with that exact scope
        const messageMatchesScope = selectedScope === undefined || 
            (selectedScope === null ? (!messageData.scope || messageData.scope === null) : messageData.scope === selectedScope);
        
        // Add the new message to the messages list
        setMessages(prevMessages => {
            // Check if message already exists by ID
            const existsById = prevMessages.some(m => m.id === messageData.id);
            if (existsById) {
                return prevMessages;
            }
            
            // Skip message if it doesn't match the selected scope
            if (!messageMatchesScope) {
                return prevMessages;
            }
            
            // Remove optimistic messages (temp IDs) for the same content
            // This handles replacing optimistic updates with real messages
            const withoutOptimistic = prevMessages.filter(m => {
                // Keep message if it's not an optimistic one
                if (!m.id.startsWith('temp-')) return true;
                
                // Remove optimistic message if it matches this real message
                const isOptimisticDuplicate = 
                    m.text === messageData.text &&
                    m.direction === messageData.direction &&
                    Math.abs(new Date(m.createdAt).getTime() - new Date(messageData.createdAt).getTime()) < 5000; // Within 5 seconds
                
                return !isOptimisticDuplicate;
            });
            
            // Add new message and sort (newest first)
            const updated = [messageData, ...withoutOptimistic].sort((a, b) => 
                new Date(b.createdAt) - new Date(a.createdAt)
            );
            
            // Update last update time
            updateLastUpdateTime(updated);
            
            // Check for handover
            checkForHandover(updated);
            
            return updated;
        });
    }, [updateLastUpdateTime, checkForHandover, selectedScope]);
    
    // Initialize the message streaming hook using SSE
    const messageStreaming = useMessageStreaming({
        threadId: selectedThreadId,
        onMessageReceived: handleStreamMessage,
        messagingApi,
        onError: (error) => {
            console.error('Message streaming error:', error);
            // Don't show error to user for streaming issues - they can still use manual refresh
        }
    });

    // Store the messageStreaming in ref to break the circular dependency
    useEffect(() => {
        messageStreamingRef.current = messageStreaming;
    }, [messageStreaming]);

    // Unified message sending function - used by both Quick Send and Configure & Send
    const sendMessage = useCallback(async (messageData) => {
        const { content, metadata, isNewThread = false, scope } = messageData;
        
        if (!selectedThread && !isNewThread) {
            showError('No thread selected');
            return { success: false };
        }

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
                // workflowId can be null for singleton instances
                if (!selectedThread.participantId || !selectedThread.workflowType) {
                    throw new Error('Thread is missing required configuration');
                }
                
                // Use the scope from messageData if provided, otherwise use the currently selected scope
                const messageScope = scope !== undefined ? scope : selectedScope;
                
                response = await messagingApi.sendMessage({
                    threadId: selectedThreadId,
                    agent: agentName,
                    workflowType: selectedThread.workflowType,
                    workflowId: selectedThread.workflowId,
                    participantId: selectedThread.participantId,
                    content,
                    metadata,
                    type: 'chat',
                    scope: messageScope
                });
                
                // Optimistically add the user's message to the UI immediately
                const optimisticMessage = {
                    id: `temp-${Date.now()}`, // Temporary ID
                    threadId: selectedThreadId,
                    text: content,
                    direction: 'Incoming',
                    messageType: 'Chat',
                    participantId: selectedThread.participantId,
                    workflowId: selectedThread.workflowId,
                    createdAt: new Date().toISOString(),
                    data: metadata,
                    scope: messageScope
                };
                
                setMessages(prevMessages => {
                    // Add optimistic message and sort
                    const updated = [optimisticMessage, ...prevMessages].sort((a, b) => 
                        new Date(b.createdAt) - new Date(a.createdAt)
                    );
                    return updated;
                });
            }
            
            // SSE will automatically deliver the response message in real-time
            // The actual user message from DB will replace the optimistic one when it arrives
            
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
    }, [selectedThread, selectedThreadId, agentName, messagingApi, showError, selectedScope]);

    // Expose sendMessage to parent component (streaming is automatic)
    useImperativeHandle(ref, () => ({
        sendMessage: sendMessage
    }), [sendMessage]);

    // Initial message fetch and streaming setup when thread ID or scope changes
    useEffect(() => {
        // Clean up streaming when thread changes
        if (messageStreamingRef.current) {
            messageStreamingRef.current.stopStreaming();
        }
        
        if (!selectedThreadId) {
            setMessages([]);
            setMessagesPage(1);
            setHasMoreMessages(true);
            setError(null);
            isInitialLoad.current = true; // Reset on thread change
            return;
        }
        
        // Fetch initial messages with scope filter
        fetchThreadMessages(selectedThreadId, 1, selectedScope);
        
        // Start SSE streaming for real-time updates
        // Note: SSE receives all messages, but we filter them in handleStreamMessage
        if (messageStreamingRef.current) {
            messageStreamingRef.current.startStreaming(selectedThreadId);
        }
    }, [selectedThreadId, selectedScope, fetchThreadMessages]);

    // Function to load more messages
    const loadMoreMessages = useCallback(async () => {
        if (!selectedThreadId || !hasMoreMessages || isLoadingMore || isLoadingMessages) {
            return;
        }

        setIsLoadingMore(true);
        setError(null);
        try {
            const nextPage = messagesPage + 1;
            const olderMessages = await messagingApi.getThreadMessages(selectedThreadId, nextPage, pageSize, selectedScope);
            
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
    }, [selectedThreadId, messagesPage, hasMoreMessages, isLoadingMore, isLoadingMessages, messagingApi, showError, pageSize, selectedScope]);

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
                selectedScope={selectedScope}
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
});

ChatConversation.displayName = 'ChatConversation';

export default ChatConversation; 
