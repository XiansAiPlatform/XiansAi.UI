import React from 'react';
import {
    Box,
    Button
} from '@mui/material';

const WorkflowActions = ({
    selectedAgentName,
    onRegisterWebhook,
    onRefresh,
}) => {
    return (
        <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
            <Button
                variant="outlined"
                onClick={onRegisterWebhook}
                disabled={!selectedAgentName}
            >
                Webhooks To Receive Messages
            </Button>
            <Button
                variant="outlined"
                onClick={onRefresh}
                disabled={!selectedAgentName}
            >
                Refresh
            </Button>
        </Box>
    );
};

export default WorkflowActions; 