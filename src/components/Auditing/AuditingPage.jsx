import React, { useState, useCallback } from 'react';
import {
    Box,
    Typography,
    Alert
} from '@mui/material';
import { useMessagingApi } from '../../services/messaging-api';
import { useSlider } from '../../contexts/SliderContext';
import { useNotification } from '../../contexts/NotificationContext';
import WorkflowSelector from './WorkflowSelector';
import WorkflowActions from './WorkflowActions';
import RegisterWebhookForm from './RegisterWebhookForm';
import UserAndWorkflowSelector from './UserAndWorkflowSelector';
import WorkflowLogs from './WorkflowLogs';

/**
 * Parent component that coordinates messaging components and manages shared state
 */
const AuditingPage = () => {
    // --- State --- 
    const [selectedAgentName, setSelectedAgentName] = useState(null);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [selectedWorkflowId, setSelectedWorkflowId] = useState(null);
    const [error, setError] = useState(null);
    
    // --- Hooks ---
    const messagingApi = useMessagingApi(); 
    const { openSlider, closeSlider } = useSlider();
    const { showError } = useNotification();

    // --- Callbacks --- 
    const handleAgentSelected = useCallback((agentName) => {
        setSelectedAgentName(agentName);
        setSelectedUserId(null); // Reset user selection
        setSelectedWorkflowId(null); // Reset workflow selection
        setError(null);
    }, []);

    const handleUserSelected = useCallback((userId) => {
        setSelectedUserId(userId);
        setSelectedWorkflowId(null); // Reset workflow selection
        setError(null);
    }, []);

    const handleWorkflowSelected = useCallback((workflowId) => {
        setSelectedWorkflowId(workflowId);
        setError(null);
    }, []);

    const handleRefresh = useCallback(() => {
        if (!selectedAgentName) {
            showError('Please select an agent first.');
            return;
        }
        
        // Reset selections to force a refresh
        setSelectedUserId(null);
        setSelectedWorkflowId(null);
    }, [selectedAgentName, showError]);

    const handleRegisterWebhook = useCallback(() => {
        if (!selectedWorkflowId) {
            showError('Please select a workflow first.');
            return;
        }
        
        openSlider(
            <RegisterWebhookForm 
                onClose={closeSlider} 
                agentName={selectedAgentName}
                workflowId={selectedWorkflowId}
            />,
            `Register Webhook`
        );
    }, [selectedAgentName, selectedWorkflowId, openSlider, closeSlider, showError]);

    // --- Render --- 

    return (
        <Box sx={{
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            width: '100%'
        }}>
            <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
                Auditing
            </Typography>

            {/* Display top-level error if any */} 
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <WorkflowSelector
                messagingApi={messagingApi}
                showError={showError}
                onAgentSelected={handleAgentSelected}
            />

            {selectedAgentName && (
                <UserAndWorkflowSelector
                    selectedAgentName={selectedAgentName}
                    selectedUserId={selectedUserId}
                    selectedWorkflowId={selectedWorkflowId}
                    onUserSelected={handleUserSelected}
                    onWorkflowSelected={handleWorkflowSelected}
                />
            )}

            <WorkflowActions
                selectedAgentName={selectedAgentName}
                onRegisterWebhook={handleRegisterWebhook}
                onRefresh={handleRefresh}
            />

            <WorkflowLogs
                selectedAgentName={selectedAgentName}
                selectedUserId={selectedUserId}
                selectedWorkflowId={selectedWorkflowId}
            />
        </Box>
    );
};

export default AuditingPage; 