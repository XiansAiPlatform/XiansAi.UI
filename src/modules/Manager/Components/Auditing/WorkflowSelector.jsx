import React, { useState, useEffect } from 'react';
import {
    Box,
    Autocomplete,
    TextField,
    CircularProgress,
    Typography,
    Alert
} from '@mui/material';
import { useAuditingApi } from '../../services/auditing-api';
import { useLoading } from '../../contexts/LoadingContext';
import { useNotification } from '../../contexts/NotificationContext';

const WorkflowSelector = ({
    selectedAgentName,
    onWorkflowSelected,
    onWorkflowTypeSelected,
    selectedWorkflowId,
    selectedWorkflowTypeId
}) => {
    const [workflows, setWorkflows] = useState([]);
    const [workflowTypes, setWorkflowTypes] = useState([]);
    const [isLoadingWorkflows, setIsLoadingWorkflows] = useState(false);
    const [isLoadingWorkflowTypes, setIsLoadingWorkflowTypes] = useState(false);
    const [error, setError] = useState(null);
    
    const auditingApi = useAuditingApi();
    const { setLoading } = useLoading();
    const { showError } = useNotification();

    // Get workflow types for the selected agent
    useEffect(() => {
        if (!selectedAgentName) {
            setWorkflowTypes([]);
            return;
        }

        const fetchWorkflowTypes = async () => {
            setIsLoadingWorkflowTypes(true);
            setLoading(true);
            setError(null);
            try {
                // Fetch workflow types without participantId
                const types = await auditingApi.getWorkflowTypes(selectedAgentName);
                // Transform string array into objects with id and name properties
                const formattedTypes = Array.isArray(types) ? types.map(type => ({
                    id: type,
                    name: type
                })) : [];
                
                setWorkflowTypes(formattedTypes);
            } catch (err) {
                setError('Failed to fetch workflow types');
                showError(`Error fetching workflow types: ${err.message}`);
            } finally {
                setIsLoadingWorkflowTypes(false);
                setLoading(false);
            }
        };

        fetchWorkflowTypes();
    }, [selectedAgentName, auditingApi, showError, setLoading]);
    
    // Get workflows for the selected agent and workflow type
    useEffect(() => {
        if (!selectedAgentName || !selectedWorkflowTypeId) {
            setWorkflows([]);
            return;
        }

        const fetchWorkflows = async () => {
            setIsLoadingWorkflows(true);
            setLoading(true);
            setError(null);
            try {
                const workflowsData = await auditingApi.getWorkflowIds(
                    selectedAgentName, 
                    selectedWorkflowTypeId
                ); 
                // Transform string array into objects with id and name properties
                const formattedWorkflows = Array.isArray(workflowsData) ? workflowsData.map(workflowId => ({
                    id: workflowId,
                    name: workflowId.split(':').pop() // Use the full UUID part after the last colon
                })) : [];
                
                setWorkflows(formattedWorkflows);
            } catch (err) {
                setError('Failed to fetch workflows');
                showError(`Error fetching workflows: ${err.message}`);
            } finally {
                setIsLoadingWorkflows(false);
                setLoading(false);
            }
        };

        fetchWorkflows();
    }, [selectedAgentName, selectedWorkflowTypeId, auditingApi, showError, setLoading]);

    return (
        <Box>
            <Typography variant="h6" gutterBottom>
                Select Workflow
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
                {/* Two selectors in the same row */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box sx={{ flex: 1 }}>
                        <Autocomplete
                            id="workflow-type-select"
                            options={workflowTypes}
                            value={workflowTypes.find(wt => wt.id === selectedWorkflowTypeId) || null}
                            onChange={(event, newValue) => onWorkflowTypeSelected(newValue?.id || null)}
                            getOptionLabel={(option) => option.name || option.id}
                            renderOption={(props, option) => (
                                <li {...props} key={option.id}>
                                    {option.name || option.id}
                                </li>
                            )}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Select Workflow Type"
                                    variant="outlined"
                                    InputProps={{
                                        ...params.InputProps,
                                        endAdornment: (
                                            <>
                                                {isLoadingWorkflowTypes && <CircularProgress size={20} />}
                                                {params.InputProps.endAdornment}
                                            </>
                                        ),
                                    }}
                                />
                            )}
                            disabled={!selectedAgentName || isLoadingWorkflowTypes}
                            fullWidth
                        />
                    </Box>
                    
                    <Box sx={{ flex: 2 }}>
                        <Autocomplete
                            id="workflow-select"
                            options={workflows}
                            value={workflows.find(wf => wf.id === selectedWorkflowId) || null}
                            onChange={(event, newValue) => onWorkflowSelected(newValue?.id || null)}
                            getOptionLabel={(option) => option.id || 'Unknown'}
                            renderOption={(props, option) => (
                                <li {...props} key={option.id}>
                                    {console.log(option)}
                                    {option.id || 'Unknown'}
                                </li>
                            )}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Select Workflow"
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
                            disabled={!selectedWorkflowTypeId || isLoadingWorkflows}
                            fullWidth
                        />
                    </Box>
                </Box>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                </Alert>
            )}
        </Box>
    );
};

export default WorkflowSelector; 