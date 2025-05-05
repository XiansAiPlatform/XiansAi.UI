import React, { useState, useEffect } from 'react';
import {
    Box,
    Autocomplete,
    TextField,
    CircularProgress,
    Typography,
    Alert,
    Button
} from '@mui/material';
import { useAuditingApi } from '../../services/auditing-api';
import { useNotification } from '../../contexts/NotificationContext';

const UserAndWorkflowTypeSelector = ({
    selectedAgentName,
    onUserSelected,
    onWorkflowSelected,
    onWorkflowTypeSelected,
    selectedUserId,
    selectedWorkflowId,
    selectedWorkflowTypeId
}) => {
    const [users, setUsers] = useState([]);
    const [workflows, setWorkflows] = useState([]);
    const [workflowTypes, setWorkflowTypes] = useState([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);
    const [isLoadingWorkflows, setIsLoadingWorkflows] = useState(false);
    const [isLoadingWorkflowTypes, setIsLoadingWorkflowTypes] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [pageSize] = useState(20);
    const [totalPages, setTotalPages] = useState(0);
    const [hasMoreUsers, setHasMoreUsers] = useState(false);
    const [loadingMoreUsers, setLoadingMoreUsers] = useState(false);
    
    const auditingApi = useAuditingApi();
    const { showError } = useNotification();

    // Get users (participants) for the selected agent
    useEffect(() => {
        if (!selectedAgentName) {
            setUsers([]);
            return;
        }

        const fetchUsers = async () => {
            setIsLoadingUsers(true);
            setError(null);
            try {
                const response = await auditingApi.getParticipants(selectedAgentName, 0, pageSize);    
                // Map string participants to users format
                const usersFromParticipants = response.participants.map((participantName, index) => ({
                    id: participantName, // Use the participant name as the ID
                    name: participantName
                }));
                
                setUsers(usersFromParticipants);
                setTotalPages(response.totalPages);
                setHasMoreUsers(response.page < response.totalPages - 1);
                setPage(response.page);
            } catch (err) {
                setError('Failed to fetch users');
                showError(`Error fetching users: ${err.message}`);
            } finally {
                setIsLoadingUsers(false);
            }
        };

        fetchUsers();
    }, [selectedAgentName, auditingApi, showError, pageSize]);

    // Get workflow types for the selected agent and optional user
    useEffect(() => {
        if (!selectedAgentName) {
            setWorkflowTypes([]);
            return;
        }

        const fetchWorkflowTypes = async () => {
            setIsLoadingWorkflowTypes(true);
            setError(null);
            try {
                // Fetch workflow types with or without participantId
                const types = await auditingApi.getWorkflowTypes(selectedAgentName, selectedUserId);
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
            }
        };

        fetchWorkflowTypes();
    }, [selectedAgentName, selectedUserId, auditingApi, showError]);
    
    // Get workflows for the selected agent, user, and workflow type
    useEffect(() => {
        if (!selectedAgentName || !selectedUserId || !selectedWorkflowTypeId) {
            setWorkflows([]);
            return;
        }

        const fetchWorkflows = async () => {
            setIsLoadingWorkflows(true);
            setError(null);
            try {
                const workflowsData = await auditingApi.getWorkflowIds(
                    selectedAgentName, 
                    selectedWorkflowTypeId, 
                    selectedUserId
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
            }
        };

        fetchWorkflows();
    }, [selectedAgentName, selectedUserId, selectedWorkflowTypeId, auditingApi, showError]);

    // Load more users (participants)
    const handleLoadMoreUsers = async () => {
        if (!selectedAgentName || loadingMoreUsers) return;
        
        setLoadingMoreUsers(true);
        try {
            const nextPage = page + 1;
            const response = await auditingApi.getParticipants(selectedAgentName, nextPage, pageSize);
            
            if (response.participants && response.participants.length > 0) {
                // Map string participants to users format
                const moreUsers = response.participants.map((participantName, index) => ({
                    id: participantName, // Use the participant name as the ID
                    name: participantName
                }));
                
                setUsers(prevUsers => [...prevUsers, ...moreUsers]);
                setPage(response.page);
                setHasMoreUsers(response.page < response.totalPages - 1);
            } else {
                setHasMoreUsers(false);
            }
        } catch (err) {
            showError(`Failed to load more users: ${err.message}`);
        } finally {
            setLoadingMoreUsers(false);
        }
    };

    return (
        <Box>
            <Typography variant="h6" gutterBottom>
                Select User and Workflow
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
                {/* All three selectors in the same row */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box sx={{ flex: 3 }}>
                        <Autocomplete
                            id="user-select"
                            options={users}
                            value={users.find(user => user.id === selectedUserId) || null}
                            onChange={(event, newValue) => onUserSelected(newValue?.id || null)}
                            getOptionLabel={(option) => option.name}
                            renderOption={(props, option) => (
                                <li {...props} key={option.id}>
                                    {option.name}
                                </li>
                            )}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Select User (Optional)"
                                    variant="outlined"
                                    InputProps={{
                                        ...params.InputProps,
                                        endAdornment: (
                                            <>
                                                {isLoadingUsers && <CircularProgress size={20} />}
                                                {params.InputProps.endAdornment}
                                            </>
                                        ),
                                    }}
                                />
                            )}
                            disabled={!selectedAgentName || isLoadingUsers}
                            fullWidth
                        />
                        {hasMoreUsers && (
                            <Button
                                size="small"
                                onClick={handleLoadMoreUsers}
                                disabled={loadingMoreUsers}
                                sx={{ mt: 1, textTransform: 'none' }}
                            >
                                {loadingMoreUsers ? <CircularProgress size={16} /> : "Load more users"}
                            </Button>
                        )}
                    </Box>

                    <Box sx={{ flex: 3 }}>
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
                            disabled={!selectedUserId || isLoadingWorkflowTypes}
                            fullWidth
                        />
                    </Box>
                    
                    <Box sx={{ flex: 6 }}>
                        <Autocomplete
                            id="workflow-select"
                            options={workflows}
                            value={workflows.find(wf => wf.id === selectedWorkflowId) || null}
                            onChange={(event, newValue) => onWorkflowSelected(newValue?.id || null)}
                            getOptionLabel={(option) => option.name || 'Unknown'}
                            renderOption={(props, option) => (
                                <li {...props} key={option.id}>
                                    {option.name || 'Unknown'}
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

export default UserAndWorkflowTypeSelector; 