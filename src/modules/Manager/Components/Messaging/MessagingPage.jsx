import { useState, useCallback, useRef, useEffect } from 'react';
import {
    Box,
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
import ChatConversation from './Conversation/ChatConversation';
import PageLayout from '../Common/PageLayout';
import EmptyState from '../Common/EmptyState';


/**
 * Parent component that coordinates messaging components and manages shared state
 */
const MessagingPage = () => {
    // Storage keys for persisting state during token refresh
    const STORAGE_KEYS = {
        SELECTED_AGENT: 'messaging_selected_agent',
        SELECTED_THREAD_ID: 'messaging_selected_thread_id',
        SELECTED_THREAD_DETAILS: 'messaging_selected_thread_details'
    };

    // --- State --- 
    // Keep selected agent name and other state - initialize from sessionStorage
    const [selectedAgentName, setSelectedAgentName] = useState(() => {
        try {
            return sessionStorage.getItem(STORAGE_KEYS.SELECTED_AGENT);
        } catch {
            return null;
        }
    });
    const [selectedThreadId, setSelectedThreadId] = useState(() => {
        try {
            return sessionStorage.getItem(STORAGE_KEYS.SELECTED_THREAD_ID);
        } catch {
            return null;
        }
    });
    const [selectedThreadDetails, setSelectedThreadDetails] = useState(() => {
        try {
            const stored = sessionStorage.getItem(STORAGE_KEYS.SELECTED_THREAD_DETAILS);
            return stored ? JSON.parse(stored) : null;
        } catch {
            return null;
        }
    }); // Store full thread object
    const [error, setError] = useState(null); // Keep top-level error state if needed
    const [refreshCounter, setRefreshCounter] = useState(0); // Add counter for refreshing conversation
    const [threadsRefreshCounter, setThreadsRefreshCounter] = useState(0); // Separate counter for threads refresh
    
    // Use a ref to track the last handover refresh time to prevent rapid refreshes
    const lastHandoverRefreshRef = useRef(0);
    // Track processing state to prevent concurrent handover refreshes
    const isProcessingHandoverRef = useRef(false);
    // Ref for ChatConversation component to trigger polling
    const chatConversationRef = useRef(null);

    // --- Hooks ---
    // Using the existing API hook from services/messaging-api.js
    const messagingApi = useMessagingApi(); 
    const agentsApi = useAgentsApi();
    const { openSlider, closeSlider } = useSlider();
    const { setLoading } = useLoading();
    const { showError } = useNotification();

    // Persist selected agent to sessionStorage
    useEffect(() => {
        try {
            if (selectedAgentName) {
                sessionStorage.setItem(STORAGE_KEYS.SELECTED_AGENT, selectedAgentName);
            } else {
                sessionStorage.removeItem(STORAGE_KEYS.SELECTED_AGENT);
            }
        } catch (error) {
            console.warn('Failed to persist selected agent to sessionStorage:', error);
        }
    }, [selectedAgentName, STORAGE_KEYS.SELECTED_AGENT]);

    // Persist selected thread ID to sessionStorage
    useEffect(() => {
        try {
            if (selectedThreadId) {
                sessionStorage.setItem(STORAGE_KEYS.SELECTED_THREAD_ID, selectedThreadId);
            } else {
                sessionStorage.removeItem(STORAGE_KEYS.SELECTED_THREAD_ID);
            }
        } catch (error) {
            console.warn('Failed to persist selected thread ID to sessionStorage:', error);
        }
    }, [selectedThreadId, STORAGE_KEYS.SELECTED_THREAD_ID]);

    // Persist selected thread details to sessionStorage
    useEffect(() => {
        try {
            if (selectedThreadDetails) {
                sessionStorage.setItem(STORAGE_KEYS.SELECTED_THREAD_DETAILS, JSON.stringify(selectedThreadDetails));
            } else {
                sessionStorage.removeItem(STORAGE_KEYS.SELECTED_THREAD_DETAILS);
            }
        } catch (error) {
            console.warn('Failed to persist selected thread details to sessionStorage:', error);
        }
    }, [selectedThreadDetails, STORAGE_KEYS.SELECTED_THREAD_DETAILS]);

    // Utility function to clear persisted selections (can be called when needed)
    const clearPersistedSelections = useCallback(() => {
        try {
            sessionStorage.removeItem(STORAGE_KEYS.SELECTED_AGENT);
            sessionStorage.removeItem(STORAGE_KEYS.SELECTED_THREAD_ID);
            sessionStorage.removeItem(STORAGE_KEYS.SELECTED_THREAD_DETAILS);
        } catch (error) {
            console.warn('Failed to clear persisted selections:', error);
        }
    }, [STORAGE_KEYS.SELECTED_AGENT, STORAGE_KEYS.SELECTED_THREAD_ID, STORAGE_KEYS.SELECTED_THREAD_DETAILS]);

    // --- Callbacks --- 

    // Callback passed to WorkflowSelector
    const handleAgentSelected = useCallback((agentName) => {
        setSelectedAgentName(agentName);
        setSelectedThreadId(null); // Reset thread selection when agent changes
        setSelectedThreadDetails(null);
        setError(null); // Clear errors when selection changes
        
        // If agent is being cleared, also clear persisted selections
        if (!agentName) {
            clearPersistedSelections();
        }
    }, [clearPersistedSelections]);

    // Callback passed to ConversationThreads
    const handleThreadSelected = useCallback((threadId, threadDetails) => {
        setSelectedThreadId(threadId);
        setSelectedThreadDetails(threadDetails); // Store the full thread object
        setError(null); // Clear errors when selection changes
    }, []);

    // Handler for refreshing threads and messages (for manual refresh)
    const handleRefresh = useCallback((newThread) => {
        if (!selectedAgentName) {
            showError('Please select an agent first.');
            return;
        }
        
        // Increment both refresh counters to force children to reload
        setRefreshCounter(prev => prev + 1);
        setThreadsRefreshCounter(prev => prev + 1);
        
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

    // Handler for when a message is sent - now simplified since ChatConversation handles polling
    const handleMessageSent = useCallback((newThread) => {
        if (!selectedAgentName) {
            showError('Please select an agent first.');
            return;
        }
        
        // If a new thread was created, select it and refresh
        if (newThread) {
            setSelectedThreadId(newThread.id);
            setSelectedThreadDetails({
                id: newThread.id,
                participantId: newThread.participantId,
                // Add other necessary properties
            });
            // Increment both refresh counters for new threads
            setThreadsRefreshCounter(prev => prev + 1);
            setRefreshCounter(prev => prev + 1);
        } else {
            // For existing threads, ChatConversation.sendMessage handles polling and refresh
            // Just refresh the threads list to update metadata
            setThreadsRefreshCounter(prev => prev + 1);
        }
    }, [selectedAgentName, showError]);

    // Handler for thread handover events
    const handleThreadHandover = useCallback(async (threadId) => {
        if (!selectedAgentName || !threadId) {
            return;
        }
        
        // Prevent multiple refreshes within a short time period (3 seconds)
        const now = Date.now();
        const debounceTime = 3000; // 3 seconds
        if (now - lastHandoverRefreshRef.current < debounceTime) {
            return;
        }
        
        // Prevent concurrent handover processing
        if (isProcessingHandoverRef.current) {
            return;
        }
        
        isProcessingHandoverRef.current = true;
        lastHandoverRefreshRef.current = now;
        setLoading(true);
        
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
                setThreadsRefreshCounter(prev => prev + 1);
            }
        } catch (err) {
            await handleApiError(err, 'Failed to refresh thread', showError);
        } finally {
            setLoading(false);
            // Reset processing flag after a short delay to ensure stability
            setTimeout(() => {
                isProcessingHandoverRef.current = false;
            }, 1000);
        }
    }, [selectedAgentName, messagingApi, showError, setSelectedThreadDetails, setRefreshCounter, setThreadsRefreshCounter, setLoading]);

    // Handler for opening the send message slider
    const handleSendMessage = useCallback(() => {
        if (!selectedAgentName) {
            showError('Please select an agent first.');
            return;
        }
        
        // Get the sendMessage function from ChatConversation if available
        const unifiedSendMessage = chatConversationRef.current?.sendMessage;
        
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
                onMessageSent={handleMessageSent}
                sendMessage={unifiedSendMessage}
            />,
            `Send Message` // Simplified title
        );
    }, [selectedAgentName, selectedThreadId, selectedThreadDetails, openSlider, closeSlider, showError, handleMessageSent]);

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
        <PageLayout 
            title="Messaging Playground"
            headerActions={
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', minWidth: '400px' }}>
                    <Box sx={{ minWidth: '300px', flex: 1 }}>
                        <AgentSelector
                            agentsApi={agentsApi}
                            showError={showError}
                            onAgentSelected={handleAgentSelected}
                            selectedAgent={selectedAgentName}
                        />
                    </Box>
                    <WorkflowActions
                        selectedAgentName={selectedAgentName}
                        onRegisterWebhook={handleRegisterWebhook}
                        onRefresh={handleRefresh}
                    />
                </Box>
            }
        >
            {/* Display top-level error if any */}
            {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 'var(--radius-lg)' }}>{error}</Alert>}
            {/* Conditionally render Thread/Conversation area */}
            {selectedAgentName ? (
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid
                        size={{
                            xs: 12,
                            md: 3
                        }}>
                        {/* Threads list */}
                        <ConversationThreads
                            key={`threads-${threadsRefreshCounter}`}
                            selectedAgentName={selectedAgentName}
                            messagingApi={messagingApi}
                            showError={showError}
                            selectedThreadId={selectedThreadId}
                            onThreadSelect={handleThreadSelected}
                        />
                    </Grid>
                    <Grid
                        size={{
                            xs: 12,
                            md: 9
                        }}>
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
                            agentName={selectedAgentName}
                            onThreadDeleted={(threadId) => {
                                // Clear the selected thread when it's deleted
                                if (threadId === selectedThreadId) {
                                    setSelectedThreadId(null);
                                    setSelectedThreadDetails(null);
                                }
                                // Refresh both lists
                                setRefreshCounter(prev => prev + 1);
                                setThreadsRefreshCounter(prev => prev + 1);
                            }}
                            ref={chatConversationRef}
                        />
                    </Grid>
                </Grid>
            ) : (
                // Placeholder when no agent selected
                <EmptyState
                    title="No Agent Selected"
                    description="Please select an agent from the dropdown above to view and manage messages."
                    context="messages"
                />
            )}
        </PageLayout>
    );
};

export default MessagingPage; 
