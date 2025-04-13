import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Box,
    Typography,
    CircularProgress,
    Button,
    Alert,
    TextField,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Divider,
    Grid
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useWorkflowApi } from '../../services/workflow-api';
import { useMessagingApi } from '../../services/messaging-api';
import { useSlider } from '../../contexts/SliderContext';
import { useNotification } from '../../contexts/NotificationContext';
import WorkflowSelector from './WorkflowSelector';
import WorkflowActions from './WorkflowActions';
import SendMessageForm from './SendMessageForm';
import { ChatConversation, ConversationThreads } from './ConversationComponents';

const RegisterWebhookForm = ({ workflowId, onClose }) => {
    const [url, setUrl] = useState('');
    const [eventName, setEventName] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [registeredWebhooks, setRegisteredWebhooks] = useState([]);
    const [isLoadingWebhooks, setIsLoadingWebhooks] = useState(true);
    const workflowApi = useWorkflowApi();
    const { showError, showSuccess } = useNotification();

    useEffect(() => {
        const fetchWebhooks = async () => {
            setIsLoadingWebhooks(true);
            try {
                const hooks = await workflowApi.getWebhooks(workflowId);
                setRegisteredWebhooks(hooks);
            } catch (error) {
                showError(`Error fetching webhooks: ${error.message}`);
                setRegisteredWebhooks([]);
            } finally {
                setIsLoadingWebhooks(false);
            }
        };
        fetchWebhooks();
    }, [workflowId, workflowApi, showError]);

    const handleRegister = async () => {
        setIsRegistering(true);
        if (!url) {
            showError('Webhook URL is required');
            setIsRegistering(false);
            return;
        }
        try {
            const newWebhook = await workflowApi.registerWebhook(workflowId, url, eventName || null);
            showSuccess(`Webhook registered successfully! (ID: ${newWebhook.id})`);
            setRegisteredWebhooks(prev => [...prev, newWebhook]);
            setUrl('');
            setEventName('');
        } catch (error) {
            showError(`Error registering webhook: ${error.message}`);
        } finally {
            setIsRegistering(false);
        }
    };

    const handleDeleteWebhook = async (webhookId) => {
        try {
            await workflowApi.deleteWebhook(workflowId, webhookId);
            showSuccess(`Webhook deleted successfully!`);
            setRegisteredWebhooks(prev => prev.filter(hook => hook.id !== webhookId));
        } catch (error) {
            showError(`Error deleting webhook: ${error.message}`);
        }
    };


    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Register Webhook for {workflowId}</Typography>
            <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1">Registered Webhooks:</Typography>
                {isLoadingWebhooks ? <CircularProgress size={20} /> :
                    registeredWebhooks.length > 0 ? (
                        <List dense>
                            {registeredWebhooks.map(hook => (
                                <ListItem
                                    key={hook.id}
                                    secondaryAction={
                                        <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteWebhook(hook.id)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    }
                                >
                                    <ListItemText
                                        primary={hook.url}
                                        secondary={hook.eventName ? `Event: ${hook.eventName}` : 'All Events'}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    ) : (
                        <Typography variant="body2" color="textSecondary">No webhooks registered yet.</Typography>
                    )
                }
                <Divider sx={{ my: 2 }} />
            </Box>

            <TextField
                label="Webhook URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                fullWidth
                margin="normal"
                required
                disabled={isRegistering}
            />
            <TextField
                label="Event Name (Optional)"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                fullWidth
                margin="normal"
                helperText="Leave blank to subscribe to all events"
                disabled={isRegistering}
            />
            <Button
                variant="contained"
                onClick={handleRegister}
                disabled={!url || isRegistering}
                sx={{ mt: 2 }}
            >
                {isRegistering ? <CircularProgress size={24} /> : 'Register Webhook'}
            </Button>
        </Box>
    );
};

const MessagingPage = () => {
    const [allWorkflows, setAllWorkflows] = useState([]);
    const [isLoadingWorkflows, setIsLoadingWorkflows] = useState(true);
    const [workflowIds, setWorkflowIds] = useState([]);
    const [isLoadingWorkflowIds, setIsLoadingWorkflowIds] = useState(false);

    const [selectedAgentName, setSelectedAgentName] = useState('');
    const [selectedWorkflowType, setSelectedWorkflowType] = useState('');
    const [selectedWorkflowId, setSelectedWorkflowId] = useState('');

    const [messages, setMessages] = useState([]);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [messagesPage, setMessagesPage] = useState(1);
    const [hasMoreMessages, setHasMoreMessages] = useState(true);
    const [error, setError] = useState(null);

    // State for conversation threads
    const [conversationThreads, setConversationThreads] = useState([]);
    const [selectedThreadId, setSelectedThreadId] = useState(null);
    const [isLoadingThreads, setIsLoadingThreads] = useState(false);

    const workflowApi = useWorkflowApi();
    const messagingApi = useMessagingApi();
    const { openSlider, closeSlider } = useSlider();
    const { showError } = useNotification();

    const pageSize =10;

    useEffect(() => {
        const fetchWorkflows = async () => {
            setIsLoadingWorkflows(true);
            setError(null);
            setAllWorkflows([]);
            setSelectedAgentName('');
            setSelectedWorkflowType('');
            setSelectedWorkflowId('');
            try {
                const response = await messagingApi.getAgentsAndTypes();
                const workflows = response.data || (response || []);
                setAllWorkflows(workflows);
            } catch (err) {
                setError('Failed to fetch workflows.');
                showError(`Error fetching workflows: ${err.message}`);
                console.error(err);
            } finally {
                setIsLoadingWorkflows(false);
            }
        };
        fetchWorkflows();
    }, [messagingApi, showError]);

    useEffect(() => {
        if (!selectedAgentName || !selectedWorkflowType) {
            setWorkflowIds([]);
            setSelectedWorkflowId('');
            return;
        }

        const fetchWorkflowInstances = async () => {
            setIsLoadingWorkflowIds(true);
            setError(null);
            try {
                const response = await messagingApi.getWorkflows(selectedAgentName, selectedWorkflowType);
                const workflows = response.data || response || [];
                setWorkflowIds(Array.isArray(workflows) ? workflows : []);
            } catch (err) {
                setError('Failed to fetch workflow instances.');
                showError(`Error fetching workflow instances: ${err.message}`);
                console.error(err);
                setWorkflowIds([]);
            } finally {
                setIsLoadingWorkflowIds(false);
            }
        };
        fetchWorkflowInstances();
    }, [selectedAgentName, selectedWorkflowType, messagingApi, showError]);

    useEffect(() => {
        if (!selectedWorkflowId) {
            setConversationThreads([]);
            setSelectedThreadId(null);
            setMessages([]);
            setMessagesPage(1);
            setHasMoreMessages(true);
            return;
        }

        const fetchConversationThreads = async () => {
            setIsLoadingThreads(true);
            try {
                // This is a placeholder - you'll need to implement this API endpoint
                const threads = await messagingApi.getThreads(selectedWorkflowId);
                setConversationThreads(threads);

                // Select the first thread by default if available
                if (threads.length > 0 && !selectedThreadId) {
                    setSelectedThreadId(threads[0].id);
                }
            } catch (err) {
                setError('Failed to fetch conversation threads.');
                showError(`Error fetching conversation threads: ${err.message}`);
                console.error(err);
                setConversationThreads([]);
            } finally {
                setIsLoadingThreads(false);
            }
        };

        fetchConversationThreads();
    }, [selectedWorkflowId, messagingApi, showError, selectedThreadId]);

    useEffect(() => {
        if (!selectedThreadId) {
            setMessages([]);
            setMessagesPage(1);
            setHasMoreMessages(true);
            return;
        }

        const fetchThreadMessages = async () => {
            setIsLoadingMessages(true);
            setError(null);
            try {
                // Reset message state when thread changes
                setMessagesPage(1);
                
                // Modified to support pagination with initial page size
                const pageSize = 10; // Number of messages per page
                console.log("Loading initial messages for thread:", selectedThreadId);
                
                // Pass parameters as separate arguments instead of an object
                const threadMessages = await messagingApi.getThreadMessages(selectedThreadId, 1, pageSize);
                
                console.log(`Loaded ${threadMessages.length} initial messages`);
                setMessages(threadMessages);
                setHasMoreMessages(threadMessages.length === pageSize);
            } catch (err) {
                setError('Failed to fetch messages for the selected thread.');
                showError(`Error fetching thread messages: ${err.message}`);
                console.error(err);
                setMessages([]);
                setHasMoreMessages(false);
            } finally {
                setIsLoadingMessages(false);
            }
        };

        fetchThreadMessages();
    }, [selectedThreadId, messagingApi, showError]);

    // Function to load more messages (for infinite scrolling)
    const loadMoreMessages = useCallback(async () => {
        if (!selectedThreadId || !hasMoreMessages || isLoadingMessages) {
            console.log("Cannot load more messages:", { 
                selectedThreadId, 
                hasMoreMessages, 
                isLoadingMessages 
            });
            return;
        }

        console.log("Loading more messages, page:", messagesPage + 1);
        setIsLoadingMessages(true);
        
        try {
            const nextPage = messagesPage + 1;
            const pageSize = 10; // Number of messages per page - use smaller page size
            
            // Get older messages - pass parameters separately
            const olderMessages = await messagingApi.getThreadMessages(
                selectedThreadId,
                nextPage,
                pageSize
            );
            
            console.log(`Loaded ${olderMessages.length} older messages`);
            
            if (olderMessages.length > 0) {
                // Append older messages - no need to change order as they'll be sorted in the component
                setMessages(prevMessages => [...prevMessages, ...olderMessages]);
                setMessagesPage(nextPage);
                setHasMoreMessages(olderMessages.length === pageSize);
            } else {
                setHasMoreMessages(false);
            }
        } catch (err) {
            setError('Failed to load more messages.');
            showError(`Error loading more messages: ${err.message}`);
            console.error(err);
        } finally {
            setIsLoadingMessages(false);
        }
    }, [selectedThreadId, messagesPage, hasMoreMessages, isLoadingMessages, messagingApi, showError]);

    // For backward compatibility, when no thread is implemented yet
    useEffect(() => {
        if (!selectedWorkflowId) {
            setMessages([]);
            return;
        }

        // Only fetch all workflow messages if we don't have threads implemented yet
        if (conversationThreads.length === 0) {
            const fetchAllMessages = async () => {
                setIsLoadingMessages(true);
                setError(null);
                try {
                    const allMessages = await workflowApi.getWorkflowMessages(selectedWorkflowId, 'all');
                    setMessages(allMessages);

                    // Create a default thread with all messages if needed
                    if (conversationThreads.length === 0) {
                        setConversationThreads([{
                            id: 'default',
                            title: 'All Messages',
                            messageCount: allMessages.length
                        }]);
                        setSelectedThreadId('default');
                    }
                } catch (err) {
                    setError('Failed to fetch messages for the selected workflow.');
                    showError(`Error fetching messages: ${err.message}`);
                    console.error(err);
                    setMessages([]);
                } finally {
                    setIsLoadingMessages(false);
                }
            };
            fetchAllMessages();
        }
    }, [selectedWorkflowId, workflowApi, showError, conversationThreads.length]);

    const agentNames = useMemo(() =>
        [...new Set(allWorkflows.map(wf => wf.agentName))].sort(),
        [allWorkflows]
    );

    const workflowTypes = useMemo(() =>
        selectedAgentName ?
            [...new Set(allWorkflows
                .filter(wf => wf.agentName === selectedAgentName)
                .map(wf => wf.typeName))].sort()
            : [],
        [allWorkflows, selectedAgentName]
    );

    const handleAgentChange = (newValue) => {
        setSelectedAgentName(newValue || '');
        setSelectedWorkflowType('');
        setSelectedWorkflowId('');
    };

    const handleTypeChange = (newValue) => {
        setSelectedWorkflowType(newValue || '');
        setSelectedWorkflowId('');
    };

    const handleIdChange = (newValue) => {
        setSelectedWorkflowId(newValue ? newValue.workflowId : '');
    };

    const handleSendMessage = () => {
        if (!selectedWorkflowId) {
            showError('Please select a workflow first.');
            return;
        }
        
        // Get the selected thread details
        const selectedThread = conversationThreads.find(thread => thread.id === selectedThreadId);
        
        openSlider(
            <SendMessageForm 
                workflowId={selectedWorkflowId} 
                onClose={closeSlider} 
                initialParticipantId={selectedThread?.participantId || ''}
                initialParticipantChannelId={selectedThread?.participantChannelId || ''}
            />,
            `Send Message to ${selectedWorkflowType}`
        );
    };

    const handleRegisterWebhook = () => {
        if (!selectedWorkflowId) {
            showError('Please select a workflow first.');
            return;
        }
        openSlider(
            <RegisterWebhookForm workflowId={selectedWorkflowId} onClose={closeSlider} />,
            `Register Webhook for ${selectedWorkflowId}`
        );
    };

    const handleThreadSelect = (threadId) => {
        setSelectedThreadId(threadId);
    };

    const refreshMessages = async () => {
        if (selectedWorkflowId) {
            if (selectedThreadId) {
                setIsLoadingMessages(true);
                try {
                    const threadMessages = await workflowApi.getThreadMessages(selectedWorkflowId, selectedThreadId);
                    setMessages(threadMessages);
                } catch (err) {
                    setError('Failed to refresh thread messages.');
                    showError(`Error refreshing messages: ${err.message}`);
                } finally {
                    setIsLoadingMessages(false);
                }
            } else {
                setIsLoadingMessages(true);
                try {
                    const allMessages = await workflowApi.getWorkflowMessages(selectedWorkflowId, 'all');
                    setMessages(allMessages);
                } catch (err) {
                    setError('Failed to refresh workflow messages.');
                    showError(`Error refreshing messages: ${err.message}`);
                } finally {
                    setIsLoadingMessages(false);
                }
            }
        }
    };

    return (
        <Box sx={{
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
        }}
        >
            <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
                Agent Messaging
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <WorkflowSelector
                agentNames={agentNames}
                selectedAgentName={selectedAgentName}
                onAgentChange={handleAgentChange}
                workflowTypes={workflowTypes}
                selectedWorkflowType={selectedWorkflowType}
                onTypeChange={handleTypeChange}
                workflowIds={workflowIds}
                selectedWorkflowId={selectedWorkflowId}
                onIdChange={handleIdChange}
                isLoadingWorkflows={isLoadingWorkflows}
                isLoadingWorkflowIds={isLoadingWorkflowIds}
            />

            <WorkflowActions
                selectedWorkflowId={selectedWorkflowId}
                isLoadingMessages={isLoadingMessages}
                onSendMessage={handleSendMessage}
                onRegisterWebhook={handleRegisterWebhook}
                onRefreshMessages={refreshMessages}
            />

            {selectedWorkflowId ? (
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} md={3}>
                        <ConversationThreads
                            threads={conversationThreads}
                            selectedThreadId={selectedThreadId}
                            onThreadSelect={handleThreadSelect}
                            isLoading={isLoadingThreads}
                        />
                    </Grid>
                    <Grid item xs={12} md={9}>
                        <ChatConversation 
                            messages={messages} 
                            selectedThread={conversationThreads.find(thread => thread.id === selectedThreadId)}
                            onSendMessage={handleSendMessage}
                            onLoadMoreMessages={loadMoreMessages}
                            isLoadingMore={isLoadingMessages && messagesPage > 1}
                            hasMoreMessages={hasMoreMessages}
                        />
                    </Grid>
                </Grid>
            ) : (
                !isLoadingWorkflows && (
                    <Typography variant="body1" color="textSecondary" sx={{ mt: 4, textAlign: 'center', flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        Please select an agent, workflow type, and instance to view messages.
                    </Typography>
                )
            )}
        </Box>
    );
};

export default MessagingPage; 