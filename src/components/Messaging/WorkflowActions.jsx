import React from 'react';
import {
    Box,
    Button,
    CircularProgress
} from '@mui/material';

const WorkflowActions = ({
    selectedWorkflowId,
    isLoadingMessages,
    onSendMessage,
    onRegisterWebhook,
    onRefreshMessages
}) => {
    return (
        <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
            <Button
                variant="outlined"
                onClick={onSendMessage}
                disabled={!selectedWorkflowId || isLoadingMessages}
            >
                Send Message
            </Button>
            <Button
                variant="outlined"
                onClick={onRegisterWebhook}
                disabled={!selectedWorkflowId || isLoadingMessages}
            >
                Webhooks To Receive Messages
            </Button>
            <Button
                variant="outlined"
                onClick={onRefreshMessages}
                 disabled={!selectedWorkflowId || isLoadingMessages}
                 sx={{ ml: 'auto' }}
             >
                 {isLoadingMessages ? <CircularProgress size={24} /> : 'Refresh Messages'}
             </Button>
        </Box>
    );
};

export default WorkflowActions; 