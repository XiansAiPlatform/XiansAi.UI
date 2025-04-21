import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    CircularProgress,
    Button,
    TextField} from '@mui/material';
import { useMessagingApi } from '../../services/messaging-api';
import { useNotification } from '../../contexts/NotificationContext';

const SendMessageForm = ({ workflowId, onClose, initialParticipantId = '', onMessageSent }) => {
    const [participantId, setParticipantId] = useState(initialParticipantId);
    const [content, setContent] = useState('');
    const [metadata, setMetadata] = useState('');
    const [showMetadata, setShowMetadata] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [metadataError, setMetadataError] = useState('');
    const [isMetadataValid, setIsMetadataValid] = useState(true);
    const messagingApi = useMessagingApi();
    const { showError, showSuccess } = useNotification();
    const contentInputRef = useRef(null);

    // Focus on the content input when the component mounts
    useEffect(() => {
        if (contentInputRef.current) {
            contentInputRef.current.focus();
        }
    }, []);

    // Update the state if the props change (e.g., when switching threads)
    useEffect(() => {
        setParticipantId(initialParticipantId);
    }, [initialParticipantId]);

    // Validate metadata when it changes
    useEffect(() => {
        if (!metadata) {
            setMetadataError('');
            setIsMetadataValid(true);
            return;
        }
        
        try {
            JSON.parse(metadata);
            setMetadataError('');
            setIsMetadataValid(true);
        } catch (error) {
            setMetadataError('Invalid JSON format');
            setIsMetadataValid(false);
        }
    }, [metadata]);

    const handleMetadataChange = (e) => {
        setMetadata(e.target.value);
    };

    const handleSend = async () => {
        setIsSending(true);
        if (!participantId || !content) {
            showError('Participant ID and content are required');
            setIsSending(false);
            return;
        }
        
        try {
            let parsedMetadata = null;
            if (metadata) {
                try {
                    parsedMetadata = JSON.parse(metadata);
                } catch (error) {
                    showError('Invalid JSON format for metadata');
                    setIsSending(false);
                    return;
                }
            }
            
            await messagingApi.sendMessage(
                workflowId,
                participantId,
                content,
                parsedMetadata
            );
            
            showSuccess('Message sent successfully!');
            
            // Call onMessageSent callback if provided
            if (onMessageSent) {
                onMessageSent();
            }
            
            onClose();
        } catch (error) {
            showError(`Error sending message: ${error.message}`);
        } finally {
            setIsSending(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey && !isSendDisabled) {
            e.preventDefault();
            handleSend();
        }
    };

    // Determine if the send button should be disabled
    const isSendDisabled = isSending || !participantId || !content || (showMetadata && metadata && !isMetadataValid);

    return (
        <Box sx={{ p: 3 }}>
            <TextField
                label="Workflow ID"
                value={workflowId}
                fullWidth
                margin="normal"
                readOnly
                inputProps={{
                  style: { 
                    cursor: 'default',
                    userSelect: 'none',
                    backgroundColor: 'rgba(0,0,0,0.03)'
                  }
                }}
            />
            <TextField
                label="Participant ID"
                value={participantId}
                onChange={(e) => setParticipantId(e.target.value)}
                fullWidth
                margin="normal"
                required
                helperText="ID of the participant in the conversation"
                disabled={isSending}
            />
            <TextField
                label="Content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                fullWidth
                margin="normal"
                multiline
                rows={4}
                required
                helperText="Message content to be sent"
                disabled={isSending}
                inputRef={contentInputRef}
                onKeyDown={handleKeyDown}
            />
            <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                <Button 
                    onClick={() => setShowMetadata(!showMetadata)} 
                    color="primary" 
                    size="small"
                    sx={{ textTransform: 'none' }}
                >
                    {showMetadata ? 'Hide Metadata' : 'Add Metadata'}
                </Button>
            </Box>
            {showMetadata && (
                <Box sx={{ width: '100%' }}>
                    <TextField
                        label="Metadata (JSON)"
                        value={metadata}
                        onChange={handleMetadataChange}
                        fullWidth
                        margin="normal"
                        multiline
                        rows={4}
                        disabled={isSending}
                        InputProps={{ style: { fontFamily: 'monospace' } }}
                        error={!!metadataError}
                        helperText={metadataError || "Additional data associated with the message (optional)"}
                    />
                </Box>
            )}
            <Button
                variant="contained"
                onClick={handleSend}
                disabled={isSendDisabled}
                sx={{ mt: 2 }}
            >
                {isSending ? <CircularProgress size={24} /> : 'Send Message'}
            </Button>
        </Box>
    );
};

export default SendMessageForm; 