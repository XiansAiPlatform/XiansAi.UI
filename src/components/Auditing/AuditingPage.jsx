import React, { useState, useCallback, useRef } from 'react';
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


/**
 * Parent component that coordinates messaging components and manages shared state
 */
const AuditingPage = () => {
    // --- State --- 
    // Keep selected agent name and other state
    const [selectedAgentName, setSelectedAgentName] = useState(null);
    const [error, setError] = useState(null); // Keep top-level error state if needed
    
    // --- Hooks ---
    // Using the existing API hook from services/messaging-api.js
    const messagingApi = useMessagingApi(); 
    const { openSlider, closeSlider } = useSlider();
    const { showError } = useNotification();

    // --- Callbacks --- 

    // Callback passed to WorkflowSelector
    const handleAgentSelected = useCallback((agentName) => {
        setSelectedAgentName(agentName);
        setError(null); // Clear errors when selection changes
    }, []);

    // Handler for refreshing threads and messages
    const handleRefresh = useCallback(() => {
        if (!selectedAgentName) {
            showError('Please select an agent first.');
            return;
        }
        
        console.log("Refreshing threads and messages...");
        // Increment refresh counter to force children to reload
       
    }, [selectedAgentName, showError]);



    // Handler for opening the webhook registration slider
    const handleRegisterWebhook = useCallback(() => {
        // When registering webhook, we'll require workflow details to be selected in the form
        openSlider(
            <RegisterWebhookForm onClose={closeSlider} agentName={selectedAgentName} />,
            `Register Webhook`
        );
    }, [selectedAgentName, openSlider, closeSlider]);

    // --- Render --- 

    return (
        <Box sx={{
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            width: '100%'
        }}
        >
            <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
                Auditing
            </Typography>

            {/* Display top-level error if any */} 
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {/* Agent selection */}
            <WorkflowSelector
                messagingApi={messagingApi}
                showError={showError}
                onAgentSelected={handleAgentSelected}
            />

            {/* Action buttons */}
            <WorkflowActions
                selectedAgentName={selectedAgentName}
                onRegisterWebhook={handleRegisterWebhook}
                onRefresh={handleRefresh}
            />

            {/* Conditionally render Thread/Conversation area */}
            {selectedAgentName ? (
                <Typography variant="body1" color="textSecondary" sx={{ mt: 4, textAlign: 'center', flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}></Typography>
            ) : (
                // Placeholder when no agent selected
                <Typography variant="body1" color="textSecondary" sx={{ mt: 4, textAlign: 'center', flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    Please select an agent to view messages.
                </Typography>
            )}
        </Box>
    );
};

export default AuditingPage; 