import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
    Box,
    CircularProgress,
    Button,
    TextField,
    Autocomplete,
    Typography,
    Alert,
    ClickAwayListener} from '@mui/material';
import { useMessagingApi } from '../../services/messaging-api';
import { useNotification } from '../../contexts/NotificationContext';

const SendMessageForm = ({ 
    agentName, 
    threadId, 
    onClose, 
    initialParticipantId = '', 
    initialWorkflowType = '',
    initialWorkflowId = '',
    onMessageSent 
}) => {
    const [workflowType, setWorkflowType] = useState(initialWorkflowType);
    const [workflowId, setWorkflowId] = useState(initialWorkflowId);
    const [participantId, setParticipantId] = useState(initialParticipantId);
    const [content, setContent] = useState('');
    const [metadata, setMetadata] = useState('');
    const [showMetadata, setShowMetadata] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [metadataError, setMetadataError] = useState('');
    const [isMetadataValid, setIsMetadataValid] = useState(true);
    
    // Workflow type and instance data
    const [allWorkflowTypes, setAllWorkflowTypes] = useState([]);
    const [isLoadingTypes, setIsLoadingTypes] = useState(false);
    const [workflowInstances, setWorkflowInstances] = useState([]);
    const [isLoadingInstances, setIsLoadingInstances] = useState(false);
    const [error, setError] = useState(null);
    
    const messagingApi = useMessagingApi();
    const { showError, showSuccess } = useNotification();
    const contentInputRef = useRef(null);

    // Focus on the content input when the component mounts
    useEffect(() => {
        if (contentInputRef.current) {
            contentInputRef.current.focus();
        }
    }, []);

    // Update the state if the props change (e.g., when switching threads)
    useEffect(() => {
        setParticipantId(initialParticipantId);
        setWorkflowType(initialWorkflowType);
        setWorkflowId(initialWorkflowId);
    }, [initialParticipantId, initialWorkflowType, initialWorkflowId]);

    // Fetch workflow types when agent name changes
    useEffect(() => {
        if (!agentName) return;
        
        const fetchWorkflowTypes = async () => {
            setIsLoadingTypes(true);
            setError(null);
            try {
                const response = await messagingApi.getAgentsAndTypes();
                const workflows = response.data || (response || []);
                const types = [...new Set(workflows
                    .filter(wf => wf.agentName === agentName)
                    .map(wf => wf.typeName))].sort();
                setAllWorkflowTypes(types);
            } catch (err) {
                const errorMsg = 'Failed to fetch workflow types.';
                setError(errorMsg);
                showError(`${errorMsg}: ${err.message}`);
            } finally {
                setIsLoadingTypes(false);
            }
        };
        
        fetchWorkflowTypes();
    }, [agentName, messagingApi, showError]);

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
                const response = await messagingApi.getWorkflows(agentName, workflowType);
                const workflows = response.data || response || [];
                setWorkflowInstances(Array.isArray(workflows) ? workflows : []);
            } catch (err) {
                const errorMsg = 'Failed to fetch workflow instances.';
                setError(errorMsg);
                showError(`${errorMsg}: ${err.message}`);
                setWorkflowInstances([]);
            } finally {
                setIsLoadingInstances(false);
            }
        };
        
        fetchWorkflowInstances();
    }, [agentName, workflowType, messagingApi, showError, initialWorkflowId]);

    // Validate metadata when it changes
    useEffect(() => {
        if (!metadata) {
            setMetadataError('');
            setIsMetadataValid(true);
            return;
        }
        
        try {
            JSON.parse(metadata);
            setMetadataError('');
            setIsMetadataValid(true);
        } catch (error) {
            setMetadataError('Invalid JSON format');
            setIsMetadataValid(false);
        }
    }, [metadata]);

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

    const handleSend = async () => {
        setIsSending(true);
        if (!participantId || !content || !workflowId || !workflowType) {
            showError('Participant ID, workflow type, workflow ID, and content are required');
            setIsSending(false);
            return;
        }
        
        try {
            let parsedMetadata = null;
            if (metadata) {
                try {
                    parsedMetadata = JSON.parse(metadata);
                } catch (error) {
                    showError('Invalid JSON format for metadata');
                    setIsSending(false);
                    return;
                }
            }
            
            const response = await messagingApi.sendMessage(
                threadId,
                agentName,
                workflowType,
                workflowId,
                participantId,
                content,
                parsedMetadata
            );
            
            // Set isSending to false after successful message sending
            setIsSending(false);
            showSuccess('Message sent successfully!');
            
            // Call onMessageSent callback if provided, passing the thread info
            if (onMessageSent) {
                // Create a thread object with the necessary information
                const newThread = {
                    id: response,
                    participantId: participantId,
                    // Include other properties as needed
                };
                onMessageSent(newThread);
            }
            
            // Always close the slider after sending a message
            if (onClose) {
                onClose();
            }
        } catch (error) {
            showError(`Error sending message: ${error.message}`);
            setIsSending(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey && !isSendDisabled) {
            e.preventDefault();
            handleSend();
        }
    };

    // Prevent click events from bubbling up to the slider overlay
    const handleFormClick = (e) => {
        e.stopPropagation();
    };

    // Determine if the send button should be disabled
    const isSendDisabled = isSending || !participantId || !content || !workflowType || !workflowId || (showMetadata && metadata && !isMetadataValid);

    return (
        <Box sx={{ p: 3 }} onClick={handleFormClick}>
            <TextField
                label="Agent Name"
                value={agentName}
                fullWidth
                margin="normal"
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
                        onClick: (e) => e.stopPropagation()
                    }
                }}
                disabled={!agentName || isLoadingTypes}
                fullWidth
            />
            
            <Autocomplete
                id="workflow-id-select"
                options={Array.isArray(workflowInstances) ? workflowInstances : []}
                value={selectedWorkflowObject}
                onChange={handleWorkflowIdChange}
                getOptionLabel={(option) => option?.workflowId || ''}
                filterOptions={filterWorkflowIds}
                disablePortal
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
                )}
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
            
            <TextField
                label="Participant ID"
                value={participantId}
                onChange={(e) => setParticipantId(e.target.value)}
                fullWidth
                margin="normal"
                required
                helperText="ID of the participant in the conversation"
                disabled={isSending}
                onClick={(e) => e.stopPropagation()}
            />
            <TextField
                label="Content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                fullWidth
                margin="normal"
                multiline
                rows={4}
                required
                helperText="Message content to be sent"
                disabled={isSending}
                inputRef={contentInputRef}
                onKeyDown={handleKeyDown}
                onClick={(e) => e.stopPropagation()}
            />
            <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                <Button 
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowMetadata(!showMetadata);
                    }} 
                    color="primary" 
                    size="small"
                    sx={{ textTransform: 'none' }}
                >
                    {showMetadata ? 'Hide Metadata' : 'Add Metadata'}
                </Button>
            </Box>
            {showMetadata && (
                <Box sx={{ width: '100%' }}>
                    <TextField
                        label="Metadata (JSON)"
                        value={metadata}
                        onChange={handleMetadataChange}
                        fullWidth
                        margin="normal"
                        multiline
                        rows={4}
                        disabled={isSending}
                        InputProps={{ style: { fontFamily: 'monospace' } }}
                        error={!!metadataError}
                        helperText={metadataError || "Additional data associated with the message (optional)"}
                        onClick={(e) => e.stopPropagation()}
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
            >
                {isSending ? <CircularProgress size={24} /> : 'Send Message'}
            </Button>
        </Box>
    );
};

export default SendMessageForm; 