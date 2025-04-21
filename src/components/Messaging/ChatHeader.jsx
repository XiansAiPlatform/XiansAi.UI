import React from 'react';
import { Box, Typography, Button, useTheme } from '@mui/material';
import { getRelativeTimeString } from './utils/ConversationUtils';

/**
 * Component to display the header of a chat thread
 * 
 * @param {Object} props
 * @param {Object} props.selectedThread - Details of the selected thread
 * @param {string} props.lastUpdateTime - Time of the last update
 * @param {Function} props.onSendMessage - Callback to open send message form
 */
const ChatHeader = ({ selectedThread, lastUpdateTime, onSendMessage }) => {
    const theme = useTheme();

    if (!selectedThread) return null;

    return (
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
                <Typography 
                    variant={selectedThread.isInternalThread ? "subtitle1" : "h6"} 
                    sx={{ 
                        fontWeight: 'bold', 
                        color: selectedThread.isInternalThread ? theme.palette.text.secondary : theme.palette.primary.main
                    }}
                >
                    {selectedThread.participantId || 'Conversation'}
                </Typography>
                {!selectedThread.isInternalThread && (
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
                )}
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
    );
};

export default ChatHeader; 