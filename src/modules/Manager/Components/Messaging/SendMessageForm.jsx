import { useState, useEffect, useRef, useMemo } from 'react';
import {
    Box,
    CircularProgress,
    Button,
    TextField,
    Autocomplete,
    Typography,
    Alert,
    RadioGroup,
    Radio,
    FormControlLabel,
    FormLabel
} from '@mui/material';
import { useMessagingApi } from '../../services/messaging-api';
import { useAgentsApi } from '../../services/agents-api';
import { useLoading } from '../../contexts/LoadingContext';
import { useNotification } from '../../contexts/NotificationContext';
import { handleApiError } from '../../utils/errorHandler';

/**
 * Validates and parses JSON metadata string
 * @param {string} metadataString - JSON string to validate
 * @returns {Object} Result with parsed data or error
 */
const validateMetadata = (metadataString) => {
    if (!metadataString.trim()) {
        return { isValid: true, data: null, error: '' };
    }
    
    try {
        const parsed = JSON.parse(metadataString);
        return { isValid: true, data: parsed, error: '' };
    } catch (error) {
        return { isValid: false, data: null, error: 'Invalid JSON format' };
    }
};

/**
 * Validates required fields for sending a message
 * @param {Object} formData - Form data to validate
 * @returns {Object} Validation result
 */
const validateRequiredFields = ({ participantId, workflowType, workflowId, toSingletonInstance }) => {
    const missing = [];
    
    if (!participantId) missing.push('Participant ID');
    if (!workflowType) missing.push('Workflow Type');
    if (!toSingletonInstance && !workflowId) missing.push('Workflow ID');
    
    return {
        isValid: missing.length === 0,
        error: missing.length > 0 ? `${missing.join(', ')} ${missing.length === 1 ? 'is' : 'are'} required` : ''
    };
};

/**
 * Prepares message data for sending
 * @param {Object} formData - Form data
 * @returns {Object} Prepared message data
 */
const prepareMessageData = ({ 
    agentName, 
    workflowType, 
    workflowId, 
    participantId, 
    content, 
    metadata, 
    messageType, 
    threadId, 
    toSingletonInstance,
    scope
}) => {
    const data = {
        agent: agentName,
        workflowType,
        workflowId: toSingletonInstance ? null : workflowId,
        participantId,
        content,
        metadata,
        type: messageType.toLowerCase(),
        threadId
    };
    
    // Only include scope if it has a value (empty string means no scope/default)
    if (scope) {
        data.scope = scope;
    }
    
    return data;
};

const SendMessageForm = ({ 
    agentName, 
    threadId, 
    onClose, 
    initialParticipantId = '', 
    initialWorkflowType = '',
    initialWorkflowId = '',
    initialScope = '',
    onMessageSent,
    sendMessage
}) => {
    const [workflowType, setWorkflowType] = useState(initialWorkflowType);
    const [workflowId, setWorkflowId] = useState(initialWorkflowId);
    const [participantId, setParticipantId] = useState(initialParticipantId);
    const [scope, setScope] = useState(initialScope);
    const [content, setContent] = useState('');
    const [metadata, setMetadata] = useState('');
    const [showMetadata, setShowMetadata] = useState(false);
    const [showScope, setShowScope] = useState(false);
    const [messageType, setMessageType] = useState('Chat');
    const [metadataError, setMetadataError] = useState('');
    const [isMetadataValid, setIsMetadataValid] = useState(true);
    const [toSingletonInstance, setToSingletonInstance] = useState(true);
    
    // Workflow type and instance data
    const [allWorkflowTypes, setAllWorkflowTypes] = useState([]);
    const [isLoadingTypes, setIsLoadingTypes] = useState(false);
    const [workflowInstances, setWorkflowInstances] = useState([]);
    const [isLoadingInstances, setIsLoadingInstances] = useState(false);
    const [error, setError] = useState(null);
    
    const messagingApi = useMessagingApi();
    const agentsApi = useAgentsApi();
    const { loading, setLoading } = useLoading();
    const { showError, showSuccess } = useNotification();
    const contentInputRef = useRef(null);

    // Focus on the content input when the component mounts
    useEffect(() => {
        if (contentInputRef.current) {
            contentInputRef.current.focus();
        }
        
        // Load persisted metadata from localStorage
        const savedMetadata = localStorage.getItem('sendMessageForm_metadata');
        const savedShowMetadata = localStorage.getItem('sendMessageForm_showMetadata');
        
        if (savedMetadata) {
            setMetadata(savedMetadata);
        }
        if (savedShowMetadata === 'true') {
            setShowMetadata(true);
        }
        
        // Auto-show scope field if initialScope is provided
        if (initialScope) {
            setShowScope(true);
        }
    }, [initialScope]);

    // Update the state if the props change (e.g., when switching threads)
    useEffect(() => {
        setParticipantId(initialParticipantId);
        setWorkflowType(initialWorkflowType);
        setWorkflowId(initialWorkflowId);
        setScope(initialScope);
    }, [initialParticipantId, initialWorkflowType, initialWorkflowId, initialScope]);

    // Fetch workflow types when agent name changes
    useEffect(() => {
        if (!agentName) return;
        
        const fetchWorkflowTypes = async () => {
            setIsLoadingTypes(true);
            setError(null);
            try {
                const response = await agentsApi.getDefinitionsBasic(agentName);
                const workflows = response.data || (response || []);
                const types = [...new Set(workflows
                    .filter(wf => wf.agent === agentName)
                    .map(wf => wf.workflowType))].sort();
                setAllWorkflowTypes(types);
            } catch (err) {
                const errorMsg = 'Failed to fetch workflow types.';
                setError(errorMsg);
                await handleApiError(err, errorMsg, showError);
            } finally {
                setIsLoadingTypes(false);
            }
        };
        
        fetchWorkflowTypes();
    }, [agentName, agentsApi, showError]);

    // Fetch workflow instances when workflow type changes
    useEffect(() => {
        if (!agentName || !workflowType) {
            setWorkflowInstances([]);
            if (!initialWorkflowId) {
                setWorkflowId('');
            }
            return;
        }

        const fetchWorkflowInstances = async () => {
            setIsLoadingInstances(true);
            setError(null);
            try {
                const response = await agentsApi.getWorkflowInstances(agentName, workflowType);
                const workflows = response.value || response.data || response || [];
                setWorkflowInstances(Array.isArray(workflows) ? workflows : []);
            } catch (err) {
                const errorMsg = 'Failed to fetch workflow instances.';
                setError(errorMsg);
                await handleApiError(err, errorMsg, showError);
                setWorkflowInstances([]);
            } finally {
                setIsLoadingInstances(false);
            }
        };
        
        fetchWorkflowInstances();
    }, [agentName, workflowType, agentsApi, showError, initialWorkflowId]);

    // Validate metadata when it changes
    useEffect(() => {
        const validation = validateMetadata(metadata);
        setMetadataError(validation.error);
        setIsMetadataValid(validation.isValid);
    }, [metadata]);

    // Save metadata to localStorage when it changes
    useEffect(() => {
        localStorage.setItem('sendMessageForm_metadata', metadata);
    }, [metadata]);

    // Save showMetadata state to localStorage when it changes
    useEffect(() => {
        localStorage.setItem('sendMessageForm_showMetadata', showMetadata.toString());
    }, [showMetadata]);

    // When switching to Data type, show metadata section by default
    useEffect(() => {
        if (messageType === 'Data' && !showMetadata) {
            setShowMetadata(true);
        }
    }, [messageType, showMetadata]);

    // Clear workflow instance when toSingletonInstance is checked
    useEffect(() => {
        if (toSingletonInstance) {
            setWorkflowId('');
        }
    }, [toSingletonInstance]);

    const handleWorkflowTypeChange = (event, newValue) => {
        // Stop event propagation to prevent the slider from closing
        if (event) {
            event.stopPropagation();
        }
        setWorkflowType(newValue || '');
        setWorkflowId('');
    };

    const handleWorkflowIdChange = (event, newValue) => {
        // Stop event propagation to prevent the slider from closing
        if (event) {
            event.stopPropagation();
        }
        setWorkflowId(newValue ? newValue.workflowId : '');
    };

    const handleMetadataChange = (e) => {
        setMetadata(e.target.value);
    };

    const selectedWorkflowObject = useMemo(() =>
        Array.isArray(workflowInstances)
            ? workflowInstances.find(wf => wf.workflowId === workflowId) || null
            : null,
        [workflowInstances, workflowId]
    );

    const filterWorkflowIds = (options, { inputValue }) => {
        if (!inputValue) return options;
        
        const lowercaseInput = inputValue.toLowerCase();
        return options.filter(option => {
            if (option.workflowId && option.workflowId.toLowerCase().includes(lowercaseInput))
                return true;
                
            if (option.startTime) {
                const dateStr = new Date(option.startTime).toLocaleString().toLowerCase();
                if (dateStr.includes(lowercaseInput))
                    return true;
            }
            
            return (
                (option.agent && option.agent.toLowerCase().includes(lowercaseInput)) ||
                (option.workflowType && option.workflowType.toLowerCase().includes(lowercaseInput))
            );
        });
    };

    /**
     * Handles sending a message with simplified logic
     */
    const handleSend = async () => {
        // Validate required fields
        const fieldValidation = validateRequiredFields({ 
            participantId, 
            workflowType, 
            workflowId, 
            toSingletonInstance 
        });
        
        if (!fieldValidation.isValid) {
            showError(fieldValidation.error);
            return;
        }
        
        // Validate metadata if provided
        const metadataValidation = validateMetadata(metadata);
        if (!metadataValidation.isValid) {
            showError(metadataValidation.error);
            return;
        }
        
        setLoading(true);
        try {
            let response;
            
            // Always use the simplified API to ensure current form state is used
            // The sendMessage function from ChatConversation uses cached thread data
            // which doesn't reflect manual changes to workflow type in the form
            const messageData = prepareMessageData({
                agentName,
                workflowType,
                workflowId,
                participantId,
                content,
                metadata: metadataValidation.data,
                messageType,
                threadId,
                toSingletonInstance,
                scope
            });
            
            response = await messagingApi.sendMessage(messageData);
            
            console.log('[SendMessageForm] API response:', response);
            console.log('[SendMessageForm] Response type:', typeof response);
            
            showSuccess('Message sent successfully!');
            setContent(''); // Clear only the content, keep metadata for next message
            
            // Notify parent component about the sent message
            if (onMessageSent) {
                const newThread = threadId ? null : {
                    id: response,
                    participantId,
                    workflowType,
                    workflowId: toSingletonInstance ? null : workflowId,
                };
                console.log('[SendMessageForm] Calling onMessageSent');
                console.log('[SendMessageForm] - threadId:', threadId);
                console.log('[SendMessageForm] - newThread:', newThread);
                console.log('[SendMessageForm] - scope:', scope || null);
                console.log('[SendMessageForm] - Is new conversation?', !threadId);
                // Pass the scope that was used for this message
                onMessageSent(newThread, scope || null);
            }
            
            // Close the form
            if (onClose) {
                onClose();
            }
        } catch (error) {
            await handleApiError(error, 'Error sending message', showError);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey && !isSendDisabled) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleMetadataKeyDown = (e) => {
        // Prevent form submission on Enter key in metadata field
        if (e.key === 'Enter') {
            e.stopPropagation();
            // Allow default behavior for Enter in multiline text (new line)
        }
    };

    // Prevent click events from bubbling up to the slider overlay
    const handleFormClick = (e) => {
        e.stopPropagation();
    };

    // Determine if the send button should be disabled
    const isSendDisabled = (
        loading ||
        !participantId ||
        !workflowType ||
        (!toSingletonInstance && !workflowId) ||
        (showMetadata && metadata && !isMetadataValid)
    );

    return (
        <Box sx={{ p: 3 }} onClick={handleFormClick}>
            <TextField
                label="Agent Name"
                value={agentName}
                fullWidth
                sx={{ mt: 0, mb: 2 }}
                readOnly
                inputProps={{
                  style: { 
                    cursor: 'default',
                    userSelect: 'none',
                    backgroundColor: 'rgba(0,0,0,0.03)'
                  }
                }}
            />
            
            <Autocomplete
                id="workflow-type-select"
                options={allWorkflowTypes}
                value={workflowType}
                onChange={handleWorkflowTypeChange}
                disablePortal
                renderOption={(props, option) => {
                    const { key, ...otherProps } = props;
                    return (
                        <li key={key} {...otherProps}>
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
                    );
                }}
                renderInput={(params) => (
                    <TextField 
                        {...params} 
                        label="Workflow Type" 
                        variant="outlined"
                        margin="normal"
                        required
                        InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                                <>
                                    {isLoadingTypes && <CircularProgress size={20} />}
                                    {params.InputProps.endAdornment}
                                </>
                            ),
                            onClick: (e) => e.stopPropagation()
                        }}
                    />
                )}
                componentsProps={{
                    popper: {
                        modifiers: [
                            {
                                name: 'preventOverflow',
                                enabled: true,
                                options: {
                                    altAxis: true,
                                    altBoundary: true,
                                    tether: true,
                                    rootBoundary: 'document',
                                    padding: 8,
                                },
                            },
                            {
                                name: 'flip',
                                enabled: true,
                                options: {
                                    fallbackPlacements: ['top', 'bottom'],
                                },
                            },
                        ],
                        onClick: (e) => e.stopPropagation(),
                        sx: {
                            zIndex: 1300, // Ensure it's above the slider
                        }
                    }
                }}
                disabled={!agentName || isLoadingTypes}
                fullWidth
                ListboxProps={{
                    style: {
                        maxHeight: '350px'
                    }
                }}
            />
            
            <Box sx={{ mt: 1, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <input
                        type="checkbox"
                        checked={toSingletonInstance}
                        onChange={(e) => {
                            e.stopPropagation();
                            setToSingletonInstance(e.target.checked);
                        }}
                        style={{ 
                            marginRight: '8px',
                            transform: 'scale(1.1)',
                            cursor: 'pointer'
                        }}
                    />
                    <Typography variant="body2" sx={{ ml: 0.5, fontSize: '0.875rem' }}>
                        To Singleton Instance
                    </Typography>
                </Box>
            </Box>
            
            {!toSingletonInstance && (
                <Autocomplete
                    id="workflow-id-select"
                    options={Array.isArray(workflowInstances) ? workflowInstances : []}
                    value={selectedWorkflowObject}
                    onChange={handleWorkflowIdChange}
                    getOptionLabel={(option) => option?.workflowId || ''}
                    filterOptions={filterWorkflowIds}
                    disablePortal
                    renderOption={(props, option) => {
                        const { key, ...otherProps } = props;
                        return (
                            <li key={key} {...otherProps} style={{ padding: '8px 16px' }}>
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
                                        {option.workflowId || 'Unnamed Agent'}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {option.agent || 'Unknown Type'} • {option.workflowType || 'N/A'}
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
                        );
                    }}
                    renderInput={(params) => (
                        <TextField 
                            {...params} 
                            label="Running Workflow Instance" 
                            variant="outlined"
                            margin="normal"
                            required
                            placeholder="Search by ID or start time..."
                            InputProps={{
                                ...params.InputProps,
                                endAdornment: (
                                    <>
                                        {isLoadingInstances && <CircularProgress size={20} />}
                                        {params.InputProps.endAdornment}
                                    </>
                                ),
                                onClick: (e) => e.stopPropagation()
                            }}
                        />
                    )}
                    componentsProps={{
                        popper: {
                            onClick: (e) => e.stopPropagation()
                        }
                    }}
                    disabled={!workflowType || isLoadingInstances}
                    fullWidth
                    ListboxProps={{
                        style: {
                            maxHeight: '350px'
                        }
                    }}
                />
            )}
            
            <TextField
                label="Participant ID"
                value={participantId}
                onChange={(e) => setParticipantId(e.target.value)}
                fullWidth
                margin="normal"
                required
                helperText="ID of the participant in the conversation"
                disabled={loading}
                onClick={(e) => e.stopPropagation()}
            />
            
            {showScope && (
                <TextField
                    label="Topic/Scope (Optional)"
                    value={scope}
                    onChange={(e) => setScope(e.target.value)}
                    fullWidth
                    margin="normal"
                    helperText="Assign this message to a topic/scope for organization (leave empty for default)"
                    disabled={loading}
                    onClick={(e) => e.stopPropagation()}
                    placeholder="e.g., billing-inquiry, customer-support"
                />
            )}
            
            <Box sx={{ mt: 1, mb: 2, display: 'flex', alignItems: 'center' }}>
                <FormLabel id="message-type-label" sx={{ mr: 2 }}>Message Type</FormLabel>
                <RadioGroup
                    row
                    aria-labelledby="message-type-label"
                    name="message-type"
                    value={messageType}
                    onChange={(e) => {
                        e.stopPropagation();
                        setMessageType(e.target.value);
                    }}
                >
                    <FormControlLabel value="Chat" control={<Radio />} label="Chat" />
                    <FormControlLabel value="Data" control={<Radio />} label="Data" />
                </RadioGroup>
            </Box>
            
            <TextField
                label="Text"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                fullWidth
                margin="normal"
                multiline
                rows={2}
                helperText="Message text to be sent"
                disabled={loading}
                inputRef={contentInputRef}
                onKeyDown={handleKeyDown}
                onClick={(e) => e.stopPropagation()}
            />
            {showMetadata && (
                <Box sx={{ width: '100%' }}>
                    <TextField
                        label="Data (JSON)"
                        value={metadata}
                        onChange={handleMetadataChange}
                        fullWidth
                        margin="normal"
                        multiline
                        rows={4}
                        disabled={loading}
                        InputProps={{ style: { fontFamily: 'monospace' } }}
                        error={!!metadataError}
                        helperText={metadataError || "Additional data associated with the message (optional)"}
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={handleMetadataKeyDown}
                    />
                </Box>
            )}
            
            {error && (
                <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
                    {error}
                </Alert>
            )}
            
            <Button
                variant="contained"
                onClick={(e) => {
                    e.stopPropagation();
                    handleSend();
                }}
                disabled={isSendDisabled}
                sx={{ mt: 2 }}
                fullWidth
            >
                {loading ? <CircularProgress size={24} /> : 'Send Message'}
            </Button>
            
            <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'center' }}>
                <Button 
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowScope(!showScope);
                    }} 
                    color="primary" 
                    size="small"
                    sx={{ textTransform: 'none' }}
                >
                    {showScope ? 'Hide Topic' : 'Add Topic'}
                </Button>
                <Button 
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowMetadata(!showMetadata);
                    }} 
                    color="primary" 
                    size="small"
                    sx={{ textTransform: 'none' }}
                >
                    {showMetadata ? 'Hide Data' : 'Add Data'}
                </Button>
            </Box>
        </Box>
    );
};

export default SendMessageForm; 
