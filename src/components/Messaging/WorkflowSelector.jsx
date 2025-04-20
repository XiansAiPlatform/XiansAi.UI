import React, { useState, useEffect, useMemo } from 'react';
import {
    Grid,
    TextField,
    Autocomplete,
    CircularProgress,
    Box,
    Typography,
    Alert
} from '@mui/material';

const WorkflowSelector = ({
    messagingApi,
    showError,
    onWorkflowSelected
}) => {
    const [allWorkflows, setAllWorkflows] = useState([]);
    const [isLoadingWorkflows, setIsLoadingWorkflows] = useState(true);
    const [workflowIds, setWorkflowIds] = useState([]);
    const [isLoadingWorkflowIds, setIsLoadingWorkflowIds] = useState(false);

    const [selectedAgentName, setSelectedAgentName] = useState('');
    const [selectedWorkflowType, setSelectedWorkflowType] = useState('');
    const [selectedWorkflowId, setSelectedWorkflowId] = useState('');
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchWorkflows = async () => {
            setIsLoadingWorkflows(true);
            setError(null);
            setAllWorkflows([]);
            setSelectedAgentName('');
            setSelectedWorkflowType('');
            setSelectedWorkflowId('');
            onWorkflowSelected(null);
            try {
                const response = await messagingApi.getAgentsAndTypes();
                const workflows = response.data || (response || []);
                setAllWorkflows(Array.isArray(workflows) ? workflows : []);
            } catch (err) {
                const errorMsg = 'Failed to fetch agent/workflow types.';
                setError(errorMsg);
                showError(`${errorMsg}: ${err.message}`);
                console.error(err);
            } finally {
                setIsLoadingWorkflows(false);
            }
        };
        fetchWorkflows();
    }, [messagingApi, showError, onWorkflowSelected]);

    useEffect(() => {
        if (!selectedAgentName || !selectedWorkflowType) {
            setWorkflowIds([]);
            setSelectedWorkflowId('');
            onWorkflowSelected(null);
            return;
        }

        const fetchWorkflowInstances = async () => {
            setIsLoadingWorkflowIds(true);
            setError(null);
            setWorkflowIds([]);
            setSelectedWorkflowId('');
            onWorkflowSelected(null);
            try {
                const response = await messagingApi.getWorkflows(selectedAgentName, selectedWorkflowType);
                const workflows = response.data || response || [];
                setWorkflowIds(Array.isArray(workflows) ? workflows : []);
            } catch (err) {
                const errorMsg = 'Failed to fetch workflow instances.';
                setError(errorMsg);
                showError(`${errorMsg}: ${err.message}`);
                console.error(err);
                setWorkflowIds([]);
            } finally {
                setIsLoadingWorkflowIds(false);
            }
        };
        fetchWorkflowInstances();
    }, [selectedAgentName, selectedWorkflowType, messagingApi, showError, onWorkflowSelected]);

    const agentNames = useMemo(() =>
        [...new Set(allWorkflows.map(wf => wf.agentName))],
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
        const newAgentName = newValue || '';
        if (newAgentName !== selectedAgentName) {
            setSelectedAgentName(newAgentName);
            setSelectedWorkflowType('');
            setSelectedWorkflowId('');
            setWorkflowIds([]);
            onWorkflowSelected(null);
        }
    };

    const handleTypeChange = (newValue) => {
        const newWorkflowType = newValue || '';
        if (newWorkflowType !== selectedWorkflowType) {
            setSelectedWorkflowType(newWorkflowType);
            setSelectedWorkflowId('');
            setWorkflowIds([]);
            onWorkflowSelected(null);
        }
    };

    const handleIdChange = (newValue) => {
        const newWorkflowId = newValue ? newValue.workflowId : '';
        if (newWorkflowId !== selectedWorkflowId) {
            setSelectedWorkflowId(newWorkflowId);
            onWorkflowSelected(newWorkflowId || null);
        }
    };

    const selectedWorkflowObject = useMemo(() =>
        Array.isArray(workflowIds)
            ? workflowIds.find(wf => wf.workflowId === selectedWorkflowId) || null
            : null,
        [workflowIds, selectedWorkflowId]
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

    return (
        <>
            <Grid container spacing={2} sx={{ mb: selectedAgentName && selectedWorkflowType ? 1 : 3 }} alignItems="center">
                <Grid item xs={12} sm={6}>
                    <Autocomplete
                        id="agent-select"
                        options={agentNames}
                        value={selectedAgentName}
                        onChange={(event, newValue) => handleAgentChange(newValue)}
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
                        onChange={(event, newValue) => handleTypeChange(newValue)}
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

            {selectedAgentName && selectedWorkflowType && (
                <Grid container spacing={2} sx={{ mt: 1, mb: 5 }} alignItems="center">
                    <Grid item xs={12}>
                        <Autocomplete
                            id="id-select"
                            options={Array.isArray(workflowIds) ? workflowIds : []}
                            value={selectedWorkflowObject}
                            onChange={(event, newValue) => handleIdChange(newValue)}
                            getOptionLabel={(option) => option?.workflowId || ''}
                            filterOptions={filterWorkflowIds}
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

            {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                    {error} - Please check the console for details.
                </Alert>
            )}
        </>
    );
};

export default WorkflowSelector; 