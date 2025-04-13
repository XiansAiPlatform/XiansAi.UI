import React from 'react';
import {
    Box,
    Button
} from '@mui/material';

const WorkflowActions = ({
    selectedWorkflowId,
    onRegisterWebhook,
}) => {
    return (
        <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
            <Button
                variant="outlined"
                onClick={onRegisterWebhook}
                disabled={!selectedWorkflowId}
            >
                Webhooks To Receive Messages
            </Button>
        </Box>
    );
};

export default WorkflowActions; 