import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Box, Typography, CircularProgress, List, Button } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MessageItem from './MessageItem';
import TypingIndicator from './TypingIndicator';

/**
 * Component to display a list of messages with load more functionality
 * 
 * @param {Object} props
 * @param {Array} props.messages - Array of messages to display
 * @param {boolean} props.isLoadingMessages - Whether initial messages are being loaded
 * @param {boolean} props.isLoadingMore - Whether more messages are being loaded
 * @param {boolean} props.hasMoreMessages - Whether there are more messages to load
 * @param {string} props.error - Error message if there was an error loading messages
 * @param {Function} props.loadMoreMessages - Function to load more messages
 * @param {Function} props.isMessageRecent - Function to check if a message is recent
 * @param {boolean} props.showTypingAfterHandover - Whether to show typing indicator after handover
 * @param {boolean} props.isTyping - Whether a message is currently being sent
 */
const MessagesList = ({
    messages,
    isLoadingMessages,
    isLoadingMore,
    hasMoreMessages,
    error,
    loadMoreMessages,
    isMessageRecent,
    showTypingAfterHandover = false,
    isTyping = false
}) => {
    // State to track when to show typing indicator
    const [showTypingIndicator, setShowTypingIndicator] = useState(false);
    // Ref to store the timeout ID so we can clear it if needed
    const typingTimeoutRef = useRef(null);

    // Sort messages whenever the messages array changes
    // Messages are fetched newest first, older messages are appended.
    // We want newest at the *top* of the display list
    const sortedMessagesForDisplay = useMemo(() =>
        [...messages].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
        [messages]
    );

    // Effect to handle typing indicator visibility
    useEffect(() => {
        // Always show typing indicator if a message is being sent
        if (isTyping) {
            setShowTypingIndicator(true);
            return;
        }
        
        // Show typing indicator immediately if handover just occurred
        if (showTypingAfterHandover) {
            setShowTypingIndicator(true);

            // Clear any existing timeout
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
                typingTimeoutRef.current = null;
            }

            // The handover component will control when to hide it
            return;
        }

        // If showTypingAfterHandover is false and we were showing it due to handover,
        // hide it now
        if (!showTypingAfterHandover && messages.length > 0) {
            const latestMessage = sortedMessagesForDisplay[0];

            // Clear any existing timeout when messages change
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
                typingTimeoutRef.current = null;
            }

            // Check if latest message is a system message (empty content)
            const isSystemMessage = (latestMessage.messageType === 'Data');


            // If it's a metadata-only message (any direction), never show typing indicator
            if (isSystemMessage) {
                setShowTypingIndicator(false);
                return;
            }


            // Don't hide indicator for Handover messages or system messages
            if (latestMessage.messageType === 'Handoff' || isSystemMessage) {
                setShowTypingIndicator(true);
                return;
            }

            // If latest message is outgoing, hide the indicator immediately
            if (latestMessage.direction === 'Outgoing') {
                setShowTypingIndicator(false);
                return;
            }

            // Show indicator if latest message is incoming and recent
            if (latestMessage.direction === 'Incoming' && isMessageRecent(latestMessage)) {
                setShowTypingIndicator(true);

                // Hide the indicator after 10 seconds
                typingTimeoutRef.current = setTimeout(() => {
                    setShowTypingIndicator(false);
                    typingTimeoutRef.current = null;
                }, 10000);
            } else {
                // Hide typing indicator if no recent incoming messages
                setShowTypingIndicator(false);
            }
        }

        // Clean up the timeout when component unmounts or messages change
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
                typingTimeoutRef.current = null;
            }
        };
    }, [messages, sortedMessagesForDisplay, isMessageRecent, showTypingAfterHandover, isTyping]);

    if (isLoadingMessages && messages.length === 0) {
        return (
            <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
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
        );
    }

    if (messages.length === 0) {
        return (
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
        );
    }

    return (
        <>
            {/* Messages List - Takes remaining space */}
            <List sx={{ px: 1, width: '100%', py: 0, pt: 2 }}>
                {/* Show typing indicator if needed */}
                {showTypingIndicator && <TypingIndicator />}

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
    );
};

export default MessagesList; 