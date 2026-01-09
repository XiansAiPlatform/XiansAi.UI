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
import { useSelectedOrg } from '../../contexts/OrganizationContext';
import { handleApiError } from '../../utils/errorHandler';
import AgentSelector from './AgentSelector';
import ConversationSelector from './ConversationSelector';
import TopicsPanel from './TopicsPanel';
import WorkflowActions from './WorkflowActions';
import SendMessageForm from './SendMessageForm';
import RegisterWebhookForm from './RegisterWebhookForm';
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
    const [selectedTopic, setSelectedTopic] = useState(undefined); // Track selected topic/scope (undefined = auto-select first, null = all messages, string = specific topic)
    const [error, setError] = useState(null); // Keep top-level error state if needed
    const [refreshCounter, setRefreshCounter] = useState(0); // Add counter for refreshing conversation
    const [threadsRefreshCounter, setThreadsRefreshCounter] = useState(0); // Separate counter for threads refresh
    const [topicsRefreshCounter, setTopicsRefreshCounter] = useState(0); // Counter for topics refresh
    
    // Use a ref to track the last handover refresh time to prevent rapid refreshes
    const lastHandoverRefreshRef = useRef(0);
    // Track processing state to prevent concurrent handover refreshes
    const isProcessingHandoverRef = useRef(false);
    // Ref for ChatConversation component to trigger polling
    const chatConversationRef = useRef(null);
    // Track the previous organization to detect changes
    const prevOrgRef = useRef(null);

    // --- Hooks ---
    // Using the existing API hook from services/messaging-api.js
    const messagingApi = useMessagingApi(); 
    const agentsApi = useAgentsApi();
    const { openSlider, closeSlider } = useSlider();
    const { setLoading } = useLoading();
    const { showError } = useNotification();
    const { selectedOrg } = useSelectedOrg();

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
            // Clear session storage
            sessionStorage.removeItem(STORAGE_KEYS.SELECTED_AGENT);
            sessionStorage.removeItem(STORAGE_KEYS.SELECTED_THREAD_ID);
            sessionStorage.removeItem(STORAGE_KEYS.SELECTED_THREAD_DETAILS);
            
            // Clear local storage items related to messaging
            localStorage.removeItem('sendMessageForm_metadata');
            localStorage.removeItem('sendMessageForm_showMetadata');
            
            // Clear message drafts (they start with 'message_draft_')
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('message_draft_')) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(key => localStorage.removeItem(key));
        } catch (error) {
            console.warn('Failed to clear persisted selections:', error);
        }
    }, [STORAGE_KEYS.SELECTED_AGENT, STORAGE_KEYS.SELECTED_THREAD_ID, STORAGE_KEYS.SELECTED_THREAD_DETAILS]);

    // Clear component state when organization/tenant changes
    // Note: Storage is cleared globally by OrganizationContext
    useEffect(() => {
        // Only clear selections if the organization has actually changed (not on initial load)
        if (selectedOrg && prevOrgRef.current !== null && prevOrgRef.current !== selectedOrg) {
            // Clear all component state when organization changes
            // Storage is already cleared by OrganizationContext
            setSelectedAgentName(null);
            setSelectedThreadId(null);
            setSelectedThreadDetails(null);
            setSelectedTopic(undefined);
        }
        // Update the previous org ref
        prevOrgRef.current = selectedOrg;
    }, [selectedOrg]);

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
        setSelectedTopic(undefined); // Reset topic to auto-select most recent when thread changes
        setError(null); // Clear errors when selection changes
    }, []);

    // Callback to update thread details without changing selection or topic (used during refresh)
    const handleThreadDetailsUpdate = useCallback((threadDetails) => {
        if (threadDetails && threadDetails.id === selectedThreadId) {
            setSelectedThreadDetails(threadDetails);
        }
    }, [selectedThreadId]);

    // Callback for topic selection
    const handleTopicSelected = useCallback((scope) => {
        setSelectedTopic(scope);
    }, []);

    // Handler for refreshing threads and messages (for manual refresh)
    const handleRefresh = useCallback((newThread) => {
        if (!selectedAgentName) {
            showError('Please select an agent first.');
            return;
        }
        
        // Increment all refresh counters to force children to reload
        setRefreshCounter(prev => prev + 1);
        setThreadsRefreshCounter(prev => prev + 1);
        setTopicsRefreshCounter(prev => prev + 1);
        
        // If a new thread was created, select it
        if (newThread) {
            setSelectedThreadId(newThread.id);
            setSelectedThreadDetails({
                id: newThread.id,
                participantId: newThread.participantId,
                workflowType: newThread.workflowType,
                workflowId: newThread.workflowId,
            });
            setSelectedTopic(null); // Reset topic to "All Messages" for new thread
        }
        // For manual refresh, selectedThreadDetails is already preserved in state
        // No need to modify it - the ConversationSelector will use it during the refresh
    }, [selectedAgentName, showError]);

    // Handler for when a message is sent - now simplified since ChatConversation handles polling
    const handleMessageSent = useCallback((newThread, messageScope = null) => {
        if (!selectedAgentName) {
            showError('Please select an agent first.');
            return;
        }
        
        // If a new thread was created, select it and refresh
        if (newThread) {
            console.log('[MessagingPage] New thread created:', newThread.id);
            console.log('[MessagingPage] Setting selectedThreadId to:', newThread.id);
            console.log('[MessagingPage] Setting selectedTopic to:', messageScope);
            console.log('[MessagingPage] Thread details:', newThread);
            
            // Normalize the scope value (empty string should be null for "All Messages")
            const normalizedScope = messageScope && messageScope.trim() !== '' ? messageScope : null;
            
            // Set all state updates together
            const newThreadDetails = {
                id: newThread.id,
                participantId: newThread.participantId,
                workflowType: newThread.workflowType,
                workflowId: newThread.workflowId,
            };
            
            setSelectedThreadId(newThread.id);
            setSelectedThreadDetails(newThreadDetails);
            setSelectedTopic(normalizedScope);
            
            // Log what we just set
            console.log('[MessagingPage] Set selectedThreadDetails:', newThreadDetails);
            
            // Increment all refresh counters for new threads
            // These will trigger fetches which should include the new thread
            setThreadsRefreshCounter(prev => {
                console.log('[MessagingPage] Incrementing threadsRefreshCounter:', prev + 1);
                return prev + 1;
            });
            setRefreshCounter(prev => prev + 1);
            setTopicsRefreshCounter(prev => prev + 1);
        } else {
            // For existing threads, ChatConversation.sendMessage handles polling and refresh
            // If a scope was specified and it's different from current, switch to it
            if (messageScope !== undefined && messageScope !== selectedTopic) {
                setSelectedTopic(messageScope);
            }
            // Refresh the threads and topics lists to update metadata
            setThreadsRefreshCounter(prev => prev + 1);
            setTopicsRefreshCounter(prev => prev + 1);
        }
    }, [selectedAgentName, selectedTopic, showError]);

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
                // Force refresh of components including topics
                setRefreshCounter(prev => prev + 1);
                setThreadsRefreshCounter(prev => prev + 1);
                setTopicsRefreshCounter(prev => prev + 1);
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
    // @param {boolean} isNewConversation - If true, don't pass threadId (create new conversation)
    const handleSendMessage = useCallback((isNewConversation = false) => {
        if (!selectedAgentName) {
            showError('Please select an agent first.');
            return;
        }
        
        console.log('[MessagingPage] Opening send message form, isNewConversation:', isNewConversation);
        
        // Get the sendMessage function from ChatConversation if available
        const unifiedSendMessage = chatConversationRef.current?.sendMessage;
        
        // Pass necessary details to SendMessageForm
        openSlider(
            <SendMessageForm 
                agentName={selectedAgentName}
                // Only pass threadId if this is NOT a new conversation
                threadId={isNewConversation ? null : selectedThreadId}
                onClose={closeSlider} 
                // Use details from the stored selectedThreadDetails object (only if not new conversation)
                initialParticipantId={isNewConversation ? '' : (selectedThreadDetails?.participantId || '')}
                initialWorkflowType={isNewConversation ? '' : (selectedThreadDetails?.workflowType || '')}
                initialWorkflowId={isNewConversation ? '' : (selectedThreadDetails?.workflowId || '')}
                // Pre-fill scope with currently selected topic (if not "All Messages" and not new conversation)
                initialScope={isNewConversation ? '' : (selectedTopic && selectedTopic !== null ? selectedTopic : '')}
                onMessageSent={handleMessageSent}
                sendMessage={unifiedSendMessage}
            />,
            `Send Message` // Simplified title
        );
    }, [selectedAgentName, selectedThreadId, selectedThreadDetails, selectedTopic, openSlider, closeSlider, showError, handleMessageSent]);

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
            title="Messaging"
            headerActions={
                <Box sx={{ 
                    display: 'flex', 
                    gap: 1.5, 
                    alignItems: 'center', 
                    width: '100%',
                    flexWrap: 'wrap'
                }}>
                    {/* Agent Selector */}
                    <Box sx={{ minWidth: '250px', maxWidth: '280px', flex: '0 0 auto' }}>
                        <AgentSelector
                            agentsApi={agentsApi}
                            showError={showError}
                            onAgentSelected={handleAgentSelected}
                            selectedAgent={selectedAgentName}
                        />
                    </Box>
                    
                    {/* Conversation Selector - takes more space */}
                    <Box sx={{ minWidth: '350px', flex: '1 1 auto', maxWidth: '550px' }}>
                        <ConversationSelector
                            selectedAgentName={selectedAgentName}
                            messagingApi={messagingApi}
                            showError={showError}
                            selectedThreadId={selectedThreadId}
                            selectedThreadDetails={selectedThreadDetails}
                            onThreadSelect={handleThreadSelected}
                            onThreadDetailsUpdate={handleThreadDetailsUpdate}
                            onNewConversation={() => handleSendMessage(true)}
                            refreshCounter={threadsRefreshCounter}
                        />
                    </Box>
                    
                    {/* Workflow Actions */}
                    <Box sx={{ flex: '0 0 auto', alignSelf: 'center' }}>
                        <WorkflowActions
                            selectedAgentName={selectedAgentName}
                            onRegisterWebhook={handleRegisterWebhook}
                            onRefresh={handleRefresh}
                        />
                    </Box>
                </Box>
            }
        >
            {/* Display top-level error if any */}
            {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 'var(--radius-lg)' }}>{error}</Alert>}
            {/* Conditionally render Thread/Conversation area */}
            {selectedAgentName ? (
                <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
                    <Grid
                        size={{
                            xs: 12,
                            md: 2.5
                        }}>
                        {/* Topics panel */}
                        <TopicsPanel
                            selectedAgentName={selectedAgentName}
                            selectedThreadId={selectedThreadId}
                            messagingApi={messagingApi}
                            showError={showError}
                            onTopicSelect={handleTopicSelected}
                            selectedTopic={selectedTopic}
                            refreshCounter={topicsRefreshCounter}
                        />
                    </Grid>
                    <Grid
                        size={{
                            xs: 12,
                            md: 9.5
                        }}>
                        {/* Messages display */}
                        <ChatConversation 
                            key={`conversation-${refreshCounter}-${selectedThreadId}-${selectedTopic}`}
                            selectedThreadId={selectedThreadId}
                            messagingApi={messagingApi}
                            showError={showError}
                            selectedThread={selectedThreadDetails}
                            onSendMessage={handleSendMessage}
                            onHandover={handleThreadHandover}
                            onRefresh={handleRefresh}
                            agentName={selectedAgentName}
                            selectedScope={selectedTopic}
                            onThreadDeleted={(threadId) => {
                                // Clear the selected thread when it's deleted
                                if (threadId === selectedThreadId) {
                                    setSelectedThreadId(null);
                                    setSelectedThreadDetails(null);
                                    setSelectedTopic(null);
                                }
                                // Refresh all lists
                                setRefreshCounter(prev => prev + 1);
                                setThreadsRefreshCounter(prev => prev + 1);
                                setTopicsRefreshCounter(prev => prev + 1);
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
