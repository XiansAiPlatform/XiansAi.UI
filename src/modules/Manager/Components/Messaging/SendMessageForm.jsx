import { useState, useEffect, useRef } from 'react';
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
const validateRequiredFields = ({ participantId, workflowType, workflowIdSuffix, toSingletonInstance }) => {
    const missing = [];
    
    if (!participantId) missing.push('Participant ID');
    if (!workflowType) missing.push('Workflow Type');
    if (!toSingletonInstance && !workflowIdSuffix) missing.push('WorkflowId Suffix');
    
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
    participantId, 
    content, 
    metadata, 
    messageType, 
    threadId, 
    toSingletonInstance,
    scope,
    workflowIdSuffix
}) => {
    const data = {
        agent: agentName,
        workflowType,
        workflowId: toSingletonInstance ? null : (workflowIdSuffix || null),
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
    const [participantId, setParticipantId] = useState(initialParticipantId);
    const [scope, setScope] = useState(initialScope);
    const [content, setContent] = useState('');
    const [metadata, setMetadata] = useState('');
    const [chatContentOnly, setChatContentOnly] = useState(true);
    const [toDefaultTopic, setToDefaultTopic] = useState(true);
    const [messageType, setMessageType] = useState('Chat');
    const [metadataError, setMetadataError] = useState('');
    const [isMetadataValid, setIsMetadataValid] = useState(true);
    const [toSingletonInstance, setToSingletonInstance] = useState(true);
    const [workflowIdSuffix, setWorkflowIdSuffix] = useState('');
    
    // Workflow type data
    const [allWorkflowTypes, setAllWorkflowTypes] = useState([]);
    const [isLoadingTypes, setIsLoadingTypes] = useState(false);
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
        const savedChatContentOnly = localStorage.getItem('sendMessageForm_chatContentOnly');
        
        if (savedMetadata) {
            setMetadata(savedMetadata);
        }
        if (savedChatContentOnly === 'false') {
            setChatContentOnly(false);
        }
        
        // Auto-show scope field if initialScope is provided
        if (initialScope) {
            setToDefaultTopic(false);
        }
    }, [initialScope]);

    // Update the state if the props change (e.g., when switching threads)
    useEffect(() => {
        setParticipantId(initialParticipantId);
        setWorkflowType(initialWorkflowType);
        setWorkflowIdSuffix(initialWorkflowId);
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

    // Save chatContentOnly state to localStorage when it changes
    useEffect(() => {
        localStorage.setItem('sendMessageForm_chatContentOnly', chatContentOnly.toString());
    }, [chatContentOnly]);

    // When switching to Data type, show metadata section by default
    useEffect(() => {
        if (messageType === 'Data' && chatContentOnly) {
            setChatContentOnly(false);
        }
    }, [messageType, chatContentOnly]);

    // Clear workflow ID suffix when toSingletonInstance is checked
    useEffect(() => {
        if (toSingletonInstance) {
            setWorkflowIdSuffix('');
        }
    }, [toSingletonInstance]);

    const handleWorkflowTypeChange = (event, newValue) => {
        // Stop event propagation to prevent the slider from closing
        if (event) {
            event.stopPropagation();
        }
        setWorkflowType(newValue || '');
        setWorkflowIdSuffix('');
    };

    const handleMetadataChange = (e) => {
        setMetadata(e.target.value);
    };

    /**
     * Handles sending a message with simplified logic
     */
    const handleSend = async () => {
        // Validate required fields
        const fieldValidation = validateRequiredFields({ 
            participantId, 
            workflowType, 
            workflowIdSuffix, 
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
                participantId,
                content,
                metadata: metadataValidation.data,
                messageType,
                threadId,
                toSingletonInstance,
                scope,
                workflowIdSuffix
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
                    workflowId: toSingletonInstance ? null : (workflowIdSuffix || null),
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
        (!toSingletonInstance && !workflowIdSuffix) ||
        (!chatContentOnly && metadata && !isMetadataValid)
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
            
            <Box sx={{ mt: 2, mb: 2, display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    minWidth: '200px',
                    pt: 2
                }}>
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
                
                {!toSingletonInstance && (
                    <TextField
                        label="WorkflowId Suffix (idPostfix)"
                        value={workflowIdSuffix}
                        onChange={(e) => setWorkflowIdSuffix(e.target.value)}
                        fullWidth
                        sx={{ flex: 1 }}
                        helperText="Suffix for the workflow ID (e.g., 'user-123')"
                        disabled={loading}
                        onClick={(e) => e.stopPropagation()}
                        placeholder="Enter workflow ID suffix..."
                    />
                )}
            </Box>
            
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
            
            <Box sx={{ mt: 2, mb: 2, display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    minWidth: '200px',
                    pt: 2
                }}>
                    <input
                        type="checkbox"
                        checked={toDefaultTopic}
                        onChange={(e) => {
                            e.stopPropagation();
                            setToDefaultTopic(e.target.checked);
                            if (e.target.checked) {
                                setScope('');
                            }
                        }}
                        style={{ 
                            marginRight: '8px',
                            transform: 'scale(1.1)',
                            cursor: 'pointer'
                        }}
                    />
                    <Typography variant="body2" sx={{ ml: 0.5, fontSize: '0.875rem' }}>
                        To Default Topic
                    </Typography>
                </Box>
                
                {!toDefaultTopic && (
                    <TextField
                        label="Topic/Scope"
                        value={scope}
                        onChange={(e) => setScope(e.target.value)}
                        fullWidth
                        sx={{ flex: 1 }}
                        helperText="Assign this message to a topic/scope for organization"
                        disabled={loading}
                        onClick={(e) => e.stopPropagation()}
                        placeholder="e.g., billing-inquiry, customer-support"
                    />
                )}
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
            
            <Box sx={{ mt: 2, mb: 2, display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    minWidth: '200px',
                    pt: 2
                }}>
                    <input
                        type="checkbox"
                        checked={chatContentOnly}
                        onChange={(e) => {
                            e.stopPropagation();
                            setChatContentOnly(e.target.checked);
                            if (e.target.checked) {
                                setMetadata('');
                            }
                        }}
                        style={{ 
                            marginRight: '8px',
                            transform: 'scale(1.1)',
                            cursor: 'pointer'
                        }}
                    />
                    <Typography variant="body2" sx={{ ml: 0.5, fontSize: '0.875rem' }}>
                        Chat Content Only
                    </Typography>
                </Box>
                
                {!chatContentOnly && (
                    <TextField
                        label="Data (JSON)"
                        value={metadata}
                        onChange={handleMetadataChange}
                        fullWidth
                        sx={{ flex: 1 }}
                        multiline
                        rows={4}
                        disabled={loading}
                        InputProps={{ style: { fontFamily: 'monospace' } }}
                        error={!!metadataError}
                        helperText={metadataError || "Additional data associated with the message"}
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={handleMetadataKeyDown}
                    />
                )}
            </Box>
            
            {error && (
                <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
                    {error}
                </Alert>
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
            
        </Box>
    );
};

export default SendMessageForm; 
