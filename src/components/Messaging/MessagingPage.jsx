import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
    Box,
    Typography,
    CircularProgress,
    Button,
    Grid,
    Paper,
    Alert,
    TextField,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Divider,
    Avatar,
    ListItemAvatar,
    Autocomplete
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import SendIcon from '@mui/icons-material/Send';
import WebhookIcon from '@mui/icons-material/Webhook';
import { useWorkflowApi } from '../../services/workflow-api';
import { useMessagingApi } from '../../services/messaging-api';
import { useSlider } from '../../contexts/SliderContext';
import { useNotification } from '../../contexts/NotificationContext';

const ChatMessage = ({ message }) => {
    const isInbound = message.type === 'signal';
    const align = isInbound ? 'left' : 'right';
    const bgColor = isInbound ? '#e3f2fd' : '#f1f8e9';
    const avatarIcon = isInbound ? <SendIcon /> : <WebhookIcon />;
    const avatarBgColor = isInbound ? 'primary.main' : 'success.main';

    return (
        <ListItem sx={{ display: 'flex', justifyContent: align === 'left' ? 'flex-start' : 'flex-end', mb: 1 }}>
            {isInbound && (
                 <ListItemAvatar sx={{ minWidth: 50, alignSelf: 'flex-start' }}>
                     <Avatar sx={{ bgcolor: avatarBgColor }}>
                         {avatarIcon}
                     </Avatar>
                 </ListItemAvatar>
            )}
            <Paper 
                elevation={1} 
                sx={{ 
                    p: 1.5, 
                    bgcolor: bgColor, 
                    borderRadius: '10px', 
                    maxWidth: '70%', 
                    wordBreak: 'break-word'
                }}
            >
                 <Typography variant="caption" display="block" sx={{ mb: 0.5, color: 'text.secondary' }}>
                     {isInbound ? `Signal: ${message.name}` : `Webhook: ${message.eventName || 'N/A'}`}
                     {' - '} {new Date(message.timestamp).toLocaleString()}
                 </Typography>
                 {message.url && (
                    <Typography variant="caption" display="block" sx={{ mb: 0.5, fontStyle: 'italic', color: 'text.secondary' }}>
                        To: {message.url}
                    </Typography>
                 )}
                <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontSize: '0.85rem', margin: 0, fontFamily: 'monospace' }}>
                    {JSON.stringify(message.payload, null, 2)}
                </pre>
            </Paper>
             {!isInbound && (
                <ListItemAvatar sx={{ minWidth: 50, alignSelf: 'flex-start', ml: 1.5, display: 'flex', justifyContent:'flex-end' }}>
                     <Avatar sx={{ bgcolor: avatarBgColor }}>
                         {avatarIcon}
                     </Avatar>
                 </ListItemAvatar>
            )}
        </ListItem>
    );
};

const ChatConversation = ({ messages }) => {
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <Paper 
            ref={scrollRef} 
            elevation={0}
            sx={{
                p: 2, 
                flexGrow: 1,
                overflowY: 'auto', 
                bgcolor: 'grey.50'
            }}
        >
             <Typography variant="h6" gutterBottom sx={{ textAlign: 'center', color: 'text.secondary' }}>
                 Conversation Log
             </Typography>
            {messages.length === 0 ? (
                <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary', mt: 3 }}>
                    No messages found for this workflow.
                </Typography>
            ) : (
                <List>
                    {messages.map((msg, index) => (
                        <ChatMessage key={msg.id || index} message={msg} />
                    ))}
                </List>
            )}
        </Paper>
    );
};

const SendSignalForm = ({ workflowId, onClose }) => {
    const [signalName, setSignalName] = useState('');
    const [payload, setPayload] = useState('{}');
    const [isSending, setIsSending] = useState(false);
    const workflowApi = useWorkflowApi();
    const { showError, showSuccess } = useNotification();

    const handleSend = async () => {
        setIsSending(true);
        let parsedPayload;
        try {
            parsedPayload = JSON.parse(payload);
        } catch (e) {
            showError('Invalid JSON payload');
            setIsSending(false);
            return;
        }

        try {
            await workflowApi.sendSignal(workflowId, signalName, parsedPayload);
            showSuccess(`Signal '${signalName}' sent successfully!`);
            onClose();
        } catch (error) {
            showError(`Error sending signal: ${error.message}`);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Send Signal to {workflowId}</Typography>
            <TextField
                label="Signal Name"
                value={signalName}
                onChange={(e) => setSignalName(e.target.value)}
                fullWidth
                margin="normal"
                disabled={isSending}
            />
            <TextField
                label="Payload (JSON)"
                value={payload}
                onChange={(e) => setPayload(e.target.value)}
                fullWidth
                margin="normal"
                multiline
                rows={4}
                disabled={isSending}
                 InputProps={{ style: { fontFamily: 'monospace' } }}
            />
            <Button
                variant="contained"
                onClick={handleSend}
                disabled={!signalName || isSending}
                sx={{ mt: 2 }}
            >
                {isSending ? <CircularProgress size={24} /> : 'Send Signal'}
            </Button>
        </Box>
    );
};

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
                 <Divider sx={{ my: 2 }}/>
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
    const [error, setError] = useState(null);

    const workflowApi = useWorkflowApi();
    const messagingApi = useMessagingApi();
    const { openSlider, closeSlider } = useSlider();
    const { showError, showSuccess } = useNotification();

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
                // Handle both direct data return or data within a response object
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
            return;
        }
        
        const fetchWorkflowInstances = async () => {
            setIsLoadingWorkflowIds(true);
            setError(null);
            try {
                const response = await messagingApi.getWorkflows(selectedAgentName, selectedWorkflowType);
                // Handle both direct data return or data within a response object
                const workflows = response.data || response || [];
                // Ensure workflows is always an array
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
            setMessages([]);
            return;
        }
        const fetchMessages = async () => {
            setIsLoadingMessages(true);
            setError(null);
            try {
                const allMessages = await workflowApi.getWorkflowMessages(selectedWorkflowId, 'all');
                setMessages(allMessages);
            } catch (err) {
                setError('Failed to fetch messages for the selected workflow.');
                showError(`Error fetching messages: ${err.message}`);
                console.error(err);
                setMessages([]);
            } finally {
                setIsLoadingMessages(false);
            }
        };
        fetchMessages();
    }, [selectedWorkflowId, workflowApi, showError]);

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

    const handleAgentChange = (event) => {
        setSelectedAgentName(event.target.value);
        setSelectedWorkflowType('');
        setSelectedWorkflowId('');
    };

    const handleTypeChange = (event) => {
        setSelectedWorkflowType(event.target.value);
        setSelectedWorkflowId('');
    };

    const handleIdChange = (event) => {
        setSelectedWorkflowId(event.target.value);
    };

    const handleSendSignal = () => {
        if (!selectedWorkflowId) {
            showError('Please select a workflow first.');
            return;
        }
        openSlider(
            <SendSignalForm workflowId={selectedWorkflowId} onClose={closeSlider} />,
            `Send Signal to ${selectedWorkflowId}`
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

    const refreshMessages = async () => {
        if (selectedWorkflowId) {
            setIsLoadingMessages(true);
            setError(null);
            try {
                const allMessages = await workflowApi.getWorkflowMessages(selectedWorkflowId, 'all');
                setMessages(allMessages);
            } catch (err) {
                setError('Failed to fetch messages for the selected workflow.');
                showError(`Error fetching messages: ${err.message}`);
                console.error(err);
                setMessages([]);
            } finally {
                setIsLoadingMessages(false);
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

            {/* First row: Agent Name and Workflow Type */}
            <Grid container spacing={2} sx={{ mb: selectedAgentName && selectedWorkflowType ? 1 : 3 }} alignItems="center">
                {/* Adjust width to take up half the row each (sm={6} instead of sm={4}) */}
                <Grid item xs={12} sm={6}>
                    <Autocomplete
                        id="agent-select"
                        options={agentNames}
                        value={selectedAgentName}
                        onChange={(event, newValue) => {
                            setSelectedAgentName(newValue || '');
                            setSelectedWorkflowType('');
                            setSelectedWorkflowId('');
                        }}
                        renderOption={(props, option) => (
                            <li {...props}>
                                <Box sx={{ 
                                    display: 'flex', 
                                    flexDirection: 'column',
                                    width: '100%',
                                    py: 0.5
                                }}>
                                    <Typography variant="body1" fontWeight="medium">
                                        {option}
                                    </Typography>
                                </Box>
                            </li>
                        )}
                        renderInput={(params) => (
                            <TextField 
                                {...params} 
                                label="Agent Name" 
                                variant="outlined"
                                InputProps={{
                                    ...params.InputProps,
                                    endAdornment: (
                                        <>
                                            {isLoadingWorkflows && <CircularProgress size={20} />}
                                            {params.InputProps.endAdornment}
                                        </>
                                    ),
                                }}
                            />
                        )}
                        disabled={isLoadingWorkflows || agentNames.length === 0}
                        fullWidth
                    />
                </Grid>

                <Grid item xs={12} sm={6}>
                    <Autocomplete
                        id="type-select"
                        options={workflowTypes}
                        value={selectedWorkflowType}
                        onChange={(event, newValue) => {
                            setSelectedWorkflowType(newValue || '');
                            setSelectedWorkflowId('');
                        }}
                        renderOption={(props, option) => (
                            <li {...props}>
                                <Box sx={{ 
                                    display: 'flex', 
                                    flexDirection: 'column',
                                    width: '100%',
                                    py: 0.5
                                }}>
                                    <Typography variant="body1" fontWeight="medium">
                                        {option}
                                    </Typography>
                                </Box>
                            </li>
                        )}
                        renderInput={(params) => (
                            <TextField 
                                {...params} 
                                label="Workflow Type" 
                                variant="outlined"
                            />
                        )}
                        disabled={!selectedAgentName}
                        fullWidth
                    />
                </Grid>
            </Grid>

            {/* Second row: Workflow Instance (only shown when both Agent and Type are selected) */}
            {selectedAgentName && selectedWorkflowType && (
                <Grid container spacing={2} sx={{ mb: 3 }} alignItems="center">
                    {/* Full width for workflow instance */}
                    <Grid item xs={12}>
                        <Autocomplete
                            id="id-select"
                            options={Array.isArray(workflowIds) ? workflowIds : []}
                            value={Array.isArray(workflowIds) ? 
                                workflowIds.find(wf => wf.workflowId === selectedWorkflowId) || null : null}
                            onChange={(event, newValue) => {
                                setSelectedWorkflowId(newValue ? newValue.workflowId : '');
                            }}
                            getOptionLabel={(option) => option ? 
                                `${option.agent || ''} ${option.workflowType || ''} ${option.workflowId || ''} ${option.startTime ? new Date(option.startTime).toLocaleString() : ''}` : ''}
                            filterOptions={(options, { inputValue }) => {
                                if (!inputValue) return options;
                                
                                const lowercaseInput = inputValue.toLowerCase();
                                return options.filter(option => {
                                    // Match by workflowId
                                    if (option.workflowId && option.workflowId.toLowerCase().includes(lowercaseInput))
                                        return true;
                                        
                                    // Match by start time
                                    if (option.startTime) {
                                        const dateStr = new Date(option.startTime).toLocaleString().toLowerCase();
                                        if (dateStr.includes(lowercaseInput))
                                            return true;
                                    }
                                    
                                    // Match by agent name or workflow type (fallback)
                                    return (
                                        (option.agent && option.agent.toLowerCase().includes(lowercaseInput)) ||
                                        (option.workflowType && option.workflowType.toLowerCase().includes(lowercaseInput))
                                    );
                                });
                            }}
                            renderOption={(props, option) => (
                                <li {...props} style={{ padding: '8px 16px' }}>
                                    <Box sx={{ 
                                        display: 'flex', 
                                        flexDirection: 'column', 
                                        width: '100%',
                                        borderLeft: '4px solid',
                                        borderColor: 'primary.main',
                                        pl: 1,
                                        py: 0.5
                                    }}>
                                        <Typography variant="subtitle1" fontWeight="bold">
                                            {option.agent || 'Unnamed Agent'}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {option.workflowType || 'Unknown Type'} • ID: {option.workflowId?.split(':').pop() || 'N/A'}
                                        </Typography>
                                        <Box sx={{ 
                                            display: 'flex', 
                                            justifyContent: 'space-between', 
                                            mt: 0.5,
                                            alignItems: 'center'
                                        }}>
                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Box component="span" sx={{ 
                                                    width: 8, 
                                                    height: 8, 
                                                    borderRadius: '50%', 
                                                    bgcolor: 'success.main',
                                                    display: 'inline-block',
                                                    mr: 0.5
                                                }}/>
                                                Started: {option.startTime ? new Date(option.startTime).toLocaleString() : 'Unknown'}
                                            </Typography>
                                            <Typography variant="caption" sx={{ 
                                                color: 'grey.700',
                                                bgcolor: 'grey.100',
                                                px: 1,
                                                py: 0.5,
                                                borderRadius: 1,
                                                fontFamily: 'monospace'
                                            }}>
                                                {option.runId?.substring(0, 8) || 'N/A'}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </li>
                            )}
                            renderInput={(params) => (
                                <TextField 
                                    {...params} 
                                    label="Workflow Instance" 
                                    variant="outlined"
                                    placeholder="Search by ID or start time..."
                                    InputProps={{
                                        ...params.InputProps,
                                        endAdornment: (
                                            <>
                                                {isLoadingWorkflowIds && <CircularProgress size={20} />}
                                                {params.InputProps.endAdornment}
                                            </>
                                        ),
                                    }}
                                />
                            )}
                            disabled={!selectedWorkflowType || isLoadingWorkflowIds}
                            fullWidth
                            ListboxProps={{
                                style: {
                                    maxHeight: '350px'
                                }
                            }}
                        />
                    </Grid>
                </Grid>
            )}

            <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
                <Button
                    variant="outlined"
                    onClick={handleSendSignal}
                    disabled={!selectedWorkflowId || isLoadingMessages}
                >
                    Send Signal
                </Button>
                 <Button
                    variant="outlined"
                    onClick={handleRegisterWebhook}
                    disabled={!selectedWorkflowId || isLoadingMessages}
                >
                    Register / View Webhooks
                </Button>
                <Button
                    variant="outlined"
                    onClick={refreshMessages}
                     disabled={!selectedWorkflowId || isLoadingMessages}
                     sx={{ ml: 'auto' }}
                 >
                     {isLoadingMessages ? <CircularProgress size={24} /> : 'Refresh Messages'}
                 </Button>
            </Box>

            {selectedWorkflowId ? (
                 <ChatConversation messages={messages} />
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