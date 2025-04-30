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

const UserAndWorkflowSelector = ({
    selectedAgentName,
    onUserSelected,
    onWorkflowSelected,
    selectedUserId,
    selectedWorkflowId
}) => {
    const [users, setUsers] = useState([]);
    const [workflows, setWorkflows] = useState([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);
    const [isLoadingWorkflows, setIsLoadingWorkflows] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [pageSize] = useState(20);
    const [hasMoreUsers, setHasMoreUsers] = useState(false);
    const [loadingMoreUsers, setLoadingMoreUsers] = useState(false);
    
    const auditingApi = useAuditingApi();
    const { showError } = useNotification();

    // Get users (threads) for the selected agent
    useEffect(() => {
        if (!selectedAgentName) {
            setUsers([]);
            return;
        }

        const fetchUsers = async () => {
            setIsLoadingUsers(true);
            setError(null);
            try {
                const threads = await auditingApi.getThreads(selectedAgentName, 0, pageSize);
                // Map threads to users format
                const usersFromThreads = threads.map(thread => ({
                    id: thread.id,
                    name: thread.participantId || 'Unknown Participant'
                }));
                setUsers(usersFromThreads);
                setHasMoreUsers(threads && threads.length === pageSize);
                setPage(0);
            } catch (err) {
                setError('Failed to fetch users');
                showError(`Error fetching users: ${err.message}`);
            } finally {
                setIsLoadingUsers(false);
            }
        };

        fetchUsers();
    }, [selectedAgentName, auditingApi, showError, pageSize]);

    // Load more users (threads)
    const handleLoadMoreUsers = async () => {
        if (!selectedAgentName || loadingMoreUsers) return;
        
        setLoadingMoreUsers(true);
        try {
            const nextPage = page + 1;
            const moreThreads = await auditingApi.getThreads(selectedAgentName, nextPage, pageSize);
            
            if (moreThreads && moreThreads.length > 0) {
                // Map threads to users format
                const moreUsers = moreThreads.map(thread => ({
                    id: thread.id,
                    name: thread.participantId || 'Unknown Participant'
                }));
                setUsers(prevUsers => [...prevUsers, ...moreUsers]);
                setPage(nextPage);
                setHasMoreUsers(moreThreads.length === pageSize);
            } else {
                setHasMoreUsers(false);
            }
        } catch (err) {
            showError(`Failed to load more users: ${err.message}`);
        } finally {
            setLoadingMoreUsers(false);
        }
    };

    // Get workflows for the selected user
    useEffect(() => {
        if (!selectedUserId) {
            setWorkflows([]);
            return;
        }

        const fetchWorkflows = async () => {
            setIsLoadingWorkflows(true);
            setError(null);
            try {
                const workflows = await auditingApi.getWorkflows(selectedUserId);
                setWorkflows(workflows);
            } catch (err) {
                setError('Failed to fetch workflows');
                showError(`Error fetching workflows: ${err.message}`);
            } finally {
                setIsLoadingWorkflows(false);
            }
        };

        fetchWorkflows();
    }, [selectedUserId, auditingApi, showError]);

    return (
        <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
                Select User and Workflow
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Box sx={{ width: '100%' }}>
                    <Autocomplete
                        id="user-select"
                        options={users}
                        value={users.find(user => user.id === selectedUserId) || null}
                        onChange={(event, newValue) => onUserSelected(newValue?.id || null)}
                        getOptionLabel={(option) => option.name}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Select User"
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

                <Autocomplete
                    id="workflow-select"
                    options={workflows}
                    value={workflows.find(wf => wf.id === selectedWorkflowId) || null}
                    onChange={(event, newValue) => onWorkflowSelected(newValue?.id || null)}
                    getOptionLabel={(option) => `${option.name} (${option.status})`}
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
                    disabled={!selectedUserId || isLoadingWorkflows}
                    fullWidth
                />
            </Box>

            {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                </Alert>
            )}
        </Box>
    );
};

export default UserAndWorkflowSelector; 