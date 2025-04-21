import React, { useMemo } from 'react';
import { Box, Typography, CircularProgress, List, Button } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MessageItem from './MessageItem';

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
 */
const MessagesList = ({
    messages,
    isLoadingMessages,
    isLoadingMore,
    hasMoreMessages,
    error,
    loadMoreMessages,
    isMessageRecent
}) => {
    // Sort messages whenever the messages array changes
    // Messages are fetched newest first, older messages are appended.
    // We want newest at the *top* of the display list
    const sortedMessagesForDisplay = useMemo(() => 
        [...messages].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
        [messages]
    );

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
    );
};

export default MessagesList; 