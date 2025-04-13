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
import { ChatConversation, ConversationThreads } from './ConversationComponents';

const MessagingPage = () => {
    // --- State --- 
    // Keep selected workflow/thread IDs and error state
    const [selectedWorkflowId, setSelectedWorkflowId] = useState(null);
    const [selectedThreadId, setSelectedThreadId] = useState(null);
    const [selectedThreadDetails, setSelectedThreadDetails] = useState(null); // Store full thread object
    const [error, setError] = useState(null); // Keep top-level error state if needed
    // Removed state related to workflows, workflowIds, messages, threads, loading states, pagination

    // --- Hooks ---
    // API and UI hooks remain
    const messagingApi = useMessagingApi(); // Passed down to children
    const { openSlider, closeSlider } = useSlider();
    const { showError } = useNotification(); // Passed down to children

    // --- Effects --- 
    // Removed useEffect hooks for fetching workflows, instances, threads, messages

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
            />,
            `Send Message` // Simplified title
        );
    }, [selectedWorkflowId, selectedThreadDetails, openSlider, closeSlider, showError]);

    // Handler for opening the webhook registration slider (uses workflowApi)
    const handleRegisterWebhook = useCallback(() => {
        if (!selectedWorkflowId) {
            showError('Please select a workflow first.');
            return;
        }
        openSlider(
            <RegisterWebhookForm workflowId={selectedWorkflowId} onClose={closeSlider} />,
            `Register Webhook for ${selectedWorkflowId}`
        );
    }, [selectedWorkflowId, openSlider, closeSlider, showError]); // Removed workflowApi dependency

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

            {/* Refactored WorkflowSelector */}
            <WorkflowSelector
                messagingApi={messagingApi} // Pass down API hook
                showError={showError}       // Pass down notification hook
                onWorkflowSelected={handleWorkflowSelected} // Pass down callback
                // Removed props related to specific data lists and loading states
            />

            {/* WorkflowActions now only depends on selectedWorkflowId */}
            <WorkflowActions
                selectedWorkflowId={selectedWorkflowId}
                onRegisterWebhook={handleRegisterWebhook}
            />

            {/* Conditionally render Thread/Conversation area */}
            {selectedWorkflowId ? (
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} md={3}>
                        {/* Refactored ConversationThreads */}
                        <ConversationThreads
                            selectedWorkflowId={selectedWorkflowId}
                            messagingApi={messagingApi}
                            showError={showError}
                            selectedThreadId={selectedThreadId}
                            onThreadSelect={handleThreadSelected} // Use the new callback
                            // Removed threads and isLoading props
                        />
                    </Grid>
                    <Grid item xs={12} md={9}>
                        {/* Refactored ChatConversation */}
                        <ChatConversation 
                            selectedThreadId={selectedThreadId}
                            messagingApi={messagingApi}
                            showError={showError}
                            selectedThread={selectedThreadDetails} // Pass the stored thread details
                            onSendMessage={handleSendMessage} // Pass send message handler
                            // Removed messages, onLoadMoreMessages, isLoadingMore, hasMoreMessages props
                        />
                    </Grid>
                </Grid>
            ) : (
                // Keep the placeholder text if no workflow is selected
                <Typography variant="body1" color="textSecondary" sx={{ mt: 4, textAlign: 'center', flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    Please select an agent, workflow type, and instance to view messages.
                </Typography>
            )}
        </Box>
    );
};

export default MessagingPage; 