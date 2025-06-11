import React, { useState, useCallback, useRef } from 'react';
import {
    Box,
    Typography,
    Alert,
    Grid
} from '@mui/material';
import { useMessagingApi } from '../../services/messaging-api';
import { useAgentsApi } from '../../services/agents-api';
import { useSlider } from '../../contexts/SliderContext';
import { useLoading } from '../../contexts/LoadingContext';
import { useNotification } from '../../contexts/NotificationContext';
import { handleApiError } from '../../utils/errorHandler';
import AgentSelector from './AgentSelector';
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
    // Keep selected agent name and other state
    const [selectedAgentName, setSelectedAgentName] = useState(null);
    const [selectedThreadId, setSelectedThreadId] = useState(null);
    const [selectedThreadDetails, setSelectedThreadDetails] = useState(null); // Store full thread object
    const [error, setError] = useState(null); // Keep top-level error state if needed
    const [refreshCounter, setRefreshCounter] = useState(0); // Add counter for refreshing
    
    // Use a ref to track the last handover refresh time to prevent rapid refreshes
    const lastHandoverRefreshRef = useRef(0);
    // Track processing state to prevent concurrent handover refreshes
    const isProcessingHandoverRef = useRef(false);

    // --- Hooks ---
    // Using the existing API hook from services/messaging-api.js
    const messagingApi = useMessagingApi(); 
    const agentsApi = useAgentsApi();
    const { openSlider, closeSlider } = useSlider();
    const { setLoading } = useLoading();
    const { showError } = useNotification();

    // --- Callbacks --- 

    // Callback passed to WorkflowSelector
    const handleAgentSelected = useCallback((agentName) => {
        setSelectedAgentName(agentName);
        setSelectedThreadId(null); // Reset thread selection when agent changes
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
    const handleRefresh = useCallback((newThread) => {
        if (!selectedAgentName) {
            showError('Please select an agent first.');
            return;
        }
        
        console.log("Refreshing threads and messages...");
        // Increment refresh counter to force children to reload
        setRefreshCounter(prev => prev + 1);
        
        // If a new thread was created, select it
        if (newThread) {
            setSelectedThreadId(newThread.id);
            setSelectedThreadDetails({
                id: newThread.id,
                participantId: newThread.participantId,
                // Add other necessary properties
            });
        }
        // Otherwise, if thread is selected, refresh it
        else if (selectedThreadId) {
            // Clear thread data to force reload
            setSelectedThreadDetails(prev => ({...prev}));
        }
    }, [selectedAgentName, selectedThreadId, showError]);

    // Handler for thread handover events
    const handleThreadHandover = useCallback(async (threadId) => {
        if (!selectedAgentName || !threadId) {
            return;
        }
        
        // Prevent multiple refreshes within a short time period (3 seconds)
        const now = Date.now();
        const debounceTime = 3000; // 3 seconds
        if (now - lastHandoverRefreshRef.current < debounceTime) {
            console.log("Handover refresh debounced - too soon after last refresh");
            return;
        }
        
        // Prevent concurrent handover processing
        if (isProcessingHandoverRef.current) {
            console.log("Handover refresh skipped - already processing a handover");
            return;
        }
        
        isProcessingHandoverRef.current = true;
        lastHandoverRefreshRef.current = now;
        setLoading(true);
        
        console.log("Thread handover detected, refreshing thread details for:", threadId);
        
        try {
            // Get updated thread details from API
            const threads = await messagingApi.getThreads(selectedAgentName);
            if (!threads || threads.length === 0) {
                isProcessingHandoverRef.current = false;
                return;
            }
            
            // Find the thread that had a handover
            const updatedThreadDetails = threads.find(t => t.id === threadId);
            if (updatedThreadDetails) {
                // Update thread details with fresh data
                setSelectedThreadDetails(updatedThreadDetails);
                // Force refresh of components
                setRefreshCounter(prev => prev + 1);
                console.log("Thread details refreshed after handover");
            }
        } catch (err) {
            console.error("Error refreshing thread after handover:", err);
            await handleApiError(err, 'Failed to refresh thread', showError);
        } finally {
            setLoading(false);
            // Reset processing flag after a short delay to ensure stability
            setTimeout(() => {
                isProcessingHandoverRef.current = false;
            }, 1000);
        }
    }, [selectedAgentName, messagingApi, showError, setSelectedThreadDetails, setRefreshCounter, setLoading]);

    // Handler for opening the send message slider
    const handleSendMessage = useCallback(() => {
        if (!selectedAgentName) {
            showError('Please select an agent first.');
            return;
        }
        
        // Pass necessary details to SendMessageForm
        openSlider(
            <SendMessageForm 
                agentName={selectedAgentName}
                threadId={selectedThreadId}
                onClose={closeSlider} 
                // Use details from the stored selectedThreadDetails object
                initialParticipantId={selectedThreadDetails?.participantId || ''}
                initialWorkflowType={selectedThreadDetails?.workflowType || ''}
                initialWorkflowId={selectedThreadDetails?.workflowId || ''}
                onMessageSent={handleRefresh}
            />,
            `Send Message` // Simplified title
        );
    }, [selectedAgentName, selectedThreadId, selectedThreadDetails, openSlider, closeSlider, showError, handleRefresh]);

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
            width: '100%',
            borderRadius: 2
        }}
        >
            <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
                Messaging Playground
            </Typography>

            {/* Display top-level error if any */} 
            {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

            {/* Agent selection */}
            <AgentSelector
                agentsApi={agentsApi}
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
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} md={3}>
                        {/* Threads list */}
                        <ConversationThreads
                            key={`threads-${refreshCounter}`}
                            selectedAgentName={selectedAgentName}
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
                            onHandover={handleThreadHandover}
                            onRefresh={handleRefresh}
                            onThreadDeleted={(threadId) => {
                                // Clear the selected thread when it's deleted
                                if (threadId === selectedThreadId) {
                                    setSelectedThreadId(null);
                                    setSelectedThreadDetails(null);
                                }
                                // Refresh the threads list
                                handleRefresh();
                            }}
                        />
                    </Grid>
                </Grid>
            ) : (
                // Placeholder when no agent selected
                <Typography variant="body1" color="textSecondary" sx={{ mt: 4, textAlign: 'center', flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    Please select an agent to view messages.
                </Typography>
            )}
        </Box>
    );
};

export default MessagingPage; 
