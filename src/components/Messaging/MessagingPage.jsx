import React, { useState, useCallback } from 'react';
import {
    Box,
    Typography,
    Alert,
    Grid
} from '@mui/material';
import { useMessagingApi } from '../../services/messaging-api';
import { useSlider } from '../../contexts/SliderContext';
import { useNotification } from '../../contexts/NotificationContext';
import WorkflowSelector from './WorkflowSelector';
import WorkflowActions from './WorkflowActions';
import SendMessageForm from './SendMessageForm';
import RegisterWebhookForm from './RegisterWebhookForm';
import ConversationThreads from './ConversationThreads';
import ChatConversation from './ChatConversation';


/**
 * Parent component that coordinates messaging components and manages shared state
 */
const MessagingPage = () => {
    // --- State --- 
    // Keep selected workflow/thread IDs and error state
    const [selectedWorkflowId, setSelectedWorkflowId] = useState(null);
    const [selectedThreadId, setSelectedThreadId] = useState(null);
    const [selectedThreadDetails, setSelectedThreadDetails] = useState(null); // Store full thread object
    const [error, setError] = useState(null); // Keep top-level error state if needed
    const [refreshCounter, setRefreshCounter] = useState(0); // Add counter for refreshing

    // --- Hooks ---
    // Using the existing API hook from services/messaging-api.js
    const messagingApi = useMessagingApi(); 
    const { openSlider, closeSlider } = useSlider();
    const { showError } = useNotification();

    // --- Callbacks --- 

    // Callback passed to WorkflowSelector
    const handleWorkflowSelected = useCallback((workflowId) => {
        console.log("Workflow selected:", workflowId);
        setSelectedWorkflowId(workflowId);
        setSelectedThreadId(null); // Reset thread selection when workflow changes
        setSelectedThreadDetails(null);
        setError(null); // Clear errors when selection changes
    }, []);

    // Callback passed to ConversationThreads
    const handleThreadSelected = useCallback((threadId, threadDetails) => {
        console.log("Thread selected:", threadId, threadDetails);
        setSelectedThreadId(threadId);
        setSelectedThreadDetails(threadDetails); // Store the full thread object
        setError(null); // Clear errors when selection changes
    }, []);

    // Handler for refreshing threads and messages
    const handleRefresh = useCallback(() => {
        if (!selectedWorkflowId) {
            showError('Please select a workflow first.');
            return;
        }
        
        console.log("Refreshing threads and messages...");
        // Increment refresh counter to force children to reload
        setRefreshCounter(prev => prev + 1);
        
        // If thread is selected, refresh it
        if (selectedThreadId) {
            // Clear thread data to force reload
            setSelectedThreadDetails(prev => ({...prev}));
        }
    }, [selectedWorkflowId, selectedThreadId, showError]);

    // Handler for opening the send message slider
    const handleSendMessage = useCallback(() => {
        if (!selectedWorkflowId) {
            showError('Please select a workflow first.');
            return;
        }
        
        // Pass necessary details to SendMessageForm
        openSlider(
            <SendMessageForm 
                workflowId={selectedWorkflowId} 
                onClose={closeSlider} 
                // Use details from the stored selectedThreadDetails object
                initialParticipantId={selectedThreadDetails?.participantId || ''}
                // initialParticipantChannelId={selectedThreadDetails?.participantChannelId || ''} // If needed
                onMessageSent={handleRefresh}
            />,
            `Send Message` // Simplified title
        );
    }, [selectedWorkflowId, selectedThreadDetails, openSlider, closeSlider, showError, handleRefresh]);

    // Handler for opening the webhook registration slider
    const handleRegisterWebhook = useCallback(() => {
        if (!selectedWorkflowId) {
            showError('Please select a workflow first.');
            return;
        }
        openSlider(
            <RegisterWebhookForm workflowId={selectedWorkflowId} onClose={closeSlider} />,
            `Register Webhook for ${selectedWorkflowId}`
        );
    }, [selectedWorkflowId, openSlider, closeSlider, showError]);

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
                Agent Messaging
            </Typography>

            {/* Display top-level error if any */} 
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {/* Workflow selection */}
            <WorkflowSelector
                messagingApi={messagingApi}
                showError={showError}
                onWorkflowSelected={handleWorkflowSelected}
            />

            {/* Action buttons */}
            <WorkflowActions
                selectedWorkflowId={selectedWorkflowId}
                onRegisterWebhook={handleRegisterWebhook}
                onRefresh={handleRefresh}
            />

            {/* Conditionally render Thread/Conversation area */}
            {selectedWorkflowId ? (
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} md={3}>
                        {/* Threads list */}
                        <ConversationThreads
                            key={`threads-${refreshCounter}`}
                            selectedWorkflowId={selectedWorkflowId}
                            messagingApi={messagingApi}
                            showError={showError}
                            selectedThreadId={selectedThreadId}
                            onThreadSelect={handleThreadSelected}
                        />
                    </Grid>
                    <Grid item xs={12} md={9}>
                        {/* Messages display */}
                        <ChatConversation 
                            key={`conversation-${refreshCounter}-${selectedThreadId}`}
                            selectedThreadId={selectedThreadId}
                            messagingApi={messagingApi}
                            showError={showError}
                            selectedThread={selectedThreadDetails}
                            onSendMessage={handleSendMessage}
                        />
                    </Grid>
                </Grid>
            ) : (
                // Placeholder when no workflow selected
                <Typography variant="body1" color="textSecondary" sx={{ mt: 4, textAlign: 'center', flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    Please select an agent, workflow type, and instance to view messages.
                </Typography>
            )}
        </Box>
    );
};

export default MessagingPage; 