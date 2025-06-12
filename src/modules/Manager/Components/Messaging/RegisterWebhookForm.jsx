import { useState, useEffect, useMemo } from 'react';
import {
    Box,
    Typography,
    CircularProgress,
    Button,
    TextField,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Divider,
    Alert,
    Autocomplete
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useWorkflowApi } from '../../services/workflow-api';
import { useAgentsApi } from '../../services/agents-api';
import { useLoading } from '../../contexts/LoadingContext';
import { useNotification } from '../../contexts/NotificationContext';

const RegisterWebhookForm = ({ agentName, onClose }) => {
    const [workflowType, setWorkflowType] = useState('');
    const [workflowId, setWorkflowId] = useState('');
    const [url, setUrl] = useState('');
    const [eventName, setEventName] = useState('');
    const [registeredWebhooks, setRegisteredWebhooks] = useState([]);
    const [isLoadingWebhooks, setIsLoadingWebhooks] = useState(true);
    
    // Workflow type and instance data
    const [allWorkflowTypes, setAllWorkflowTypes] = useState([]);
    const [isLoadingTypes, setIsLoadingTypes] = useState(false);
    const [workflowInstances, setWorkflowInstances] = useState([]);
    const [isLoadingInstances, setIsLoadingInstances] = useState(false);
    const [error, setError] = useState(null);
    
    const workflowApi = useWorkflowApi();
    const agentsApi = useAgentsApi();
    const { loading, setLoading } = useLoading();
    const { showError, showSuccess } = useNotification();

    // Fetch workflow types when agent name changes
    useEffect(() => {
        if (!agentName) return;
        
        const fetchWorkflowTypes = async () => {
            setIsLoadingTypes(true);
            setError(null);
            try {
                const response = await agentsApi.getGroupedDefinitionsBasic();
                const workflows = response.data || (response || []);
                const types = [...new Set(workflows
                    .filter(wf => wf.agent === agentName)
                    .map(wf => wf.workflowType))].sort();
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
    }, [agentName, agentsApi, showError]);

    // Fetch workflow instances when workflow type changes
    useEffect(() => {
        if (!agentName || !workflowType) {
            setWorkflowInstances([]);
            setWorkflowId('');
            return;
        }

        const fetchWorkflowInstances = async () => {
            setIsLoadingInstances(true);
            setError(null);
            try {
                const response = await agentsApi.getWorkflowInstances(agentName, workflowType);
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
    }, [agentName, workflowType, agentsApi, showError]);

    // Load webhooks when workflow ID is selected
    useEffect(() => {
        if (!workflowId) {
            setRegisteredWebhooks([]);
            setIsLoadingWebhooks(false);
            return;
        }
        
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

    const handleWorkflowTypeChange = (event, newValue) => {
        // Stop event propagation to prevent the slider from closing
        if (event) {
            event.stopPropagation();
        }
        setWorkflowType(newValue || '');
        setWorkflowId('');
        setRegisteredWebhooks([]);
    };

    const handleWorkflowIdChange = (event, newValue) => {
        // Stop event propagation to prevent the slider from closing
        if (event) {
            event.stopPropagation();
        }
        setWorkflowId(newValue ? newValue.workflowId : '');
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

    const handleRegister = async () => {
        if (!url || !workflowId) {
            showError('Webhook URL and workflow selection are required');
            return;
        }
        
        setLoading(true);
        try {
            const newWebhook = await workflowApi.registerWebhook(workflowId, url, eventName || null);
            showSuccess(`Webhook registered successfully! (ID: ${newWebhook.id})`);
            setRegisteredWebhooks(prev => [...prev, newWebhook]);
            setUrl('');
            setEventName('');
        } catch (error) {
            showError(`Error registering webhook: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteWebhook = async (webhookId) => {
        setLoading(true);
        try {
            await workflowApi.deleteWebhook(workflowId, webhookId);
            showSuccess(`Webhook deleted successfully!`);
            setRegisteredWebhooks(prev => prev.filter(hook => hook.id !== webhookId));
        } catch (error) {
            showError(`Error deleting webhook: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Prevent click events from bubbling up to the slider overlay
    const handleFormClick = (e) => {
        e.stopPropagation();
    };

    return (
        <Box sx={{ p: 3 }} onClick={handleFormClick}>
            <Typography variant="h6" gutterBottom>Register Webhook</Typography>
            
            <TextField
                label="Agent Name"
                value={agentName || ''}
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
                onClick={(e) => e.stopPropagation()}
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
            
            {error && (
                <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
                    {error}
                </Alert>
            )}
            
            {workflowId && (
                <Box sx={{ mb: 3, mt: 3 }}>
                    <Typography variant="subtitle1">Registered Webhooks:</Typography>
                    {isLoadingWebhooks ? <CircularProgress size={20} /> :
                        registeredWebhooks.length > 0 ? (
                            <List dense>
                                {registeredWebhooks.map(hook => (
                                    <ListItem
                                        key={hook.id}
                                        secondaryAction={
                                            <IconButton edge="end" aria-label="delete" onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteWebhook(hook.id);
                                            }}>
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
            )}

            <TextField
                label="Webhook URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                fullWidth
                margin="normal"
                required
                disabled={loading || !workflowId}
                onClick={(e) => e.stopPropagation()}
            />
            <TextField
                label="Event Name (Optional)"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                fullWidth
                margin="normal"
                helperText="Leave blank to subscribe to all events"
                disabled={loading || !workflowId}
                onClick={(e) => e.stopPropagation()}
            />
            <Button
                variant="contained"
                onClick={(e) => {
                    e.stopPropagation();
                    handleRegister();
                }}
                disabled={!url || loading || !workflowId}
                sx={{ mt: 2 }}
            >
                {loading ? <CircularProgress size={24} /> : 'Register Webhook'}
            </Button>
        </Box>
    );
};

export default RegisterWebhookForm; 