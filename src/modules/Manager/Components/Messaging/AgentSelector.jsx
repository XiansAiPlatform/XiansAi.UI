import React, { useState, useEffect } from 'react';
import {
    Grid,
    TextField,
    Autocomplete,
    CircularProgress,
    Box,
    Typography,
    Alert
} from '@mui/material';
import { useLoading } from '../../contexts/LoadingContext';
import { handleApiError } from '../../utils/errorHandler';

const AgentSelector = ({
    agentsApi,
    showError,
    onAgentSelected
}) => {
    const [agentNames, setAgentNames] = useState([]);
    const [isLoadingAgents, setIsLoadingAgents] = useState(true);
    const [selectedAgentName, setSelectedAgentName] = useState('');
    const [error, setError] = useState(null);
    const { setLoading } = useLoading();

    useEffect(() => {
        const fetchAgents = async () => {
            setIsLoadingAgents(true);
            setLoading(true);
            setError(null);
            try {
                const response = await agentsApi.getAllAgents();
                const agents = Array.isArray(response) ? response : [];
                setAgentNames(agents);
                
                // If no agents available, clear selection
                if (agents.length === 0) {
                    setSelectedAgentName('');
                    onAgentSelected(null);
                }
            } catch (err) {
                const errorMsg = 'Failed to fetch agents.';
                setError(errorMsg);
                await handleApiError(err, errorMsg, showError);
                console.error(err);
                setAgentNames([]);
                setSelectedAgentName('');
                onAgentSelected(null);
            } finally {
                setIsLoadingAgents(false);
                setLoading(false);
            }
        };
        fetchAgents();
    }, [agentsApi, showError, setLoading, onAgentSelected]);

    const handleAgentChange = (newValue) => {
        const newAgentName = newValue || '';
        if (newAgentName !== selectedAgentName) {
            setSelectedAgentName(newAgentName);
            onAgentSelected(newAgentName);
        }
    };

    return (
        <>
            <Grid container spacing={2} sx={{ mb: 3 }} alignItems="center">
                <Grid item xs={12}>
                    <Autocomplete
                        id="agent-select"
                        options={agentNames}
                        value={selectedAgentName}
                        onChange={(event, newValue) => handleAgentChange(newValue)}
                        getOptionLabel={(option) => option || ''}
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
                                            {isLoadingAgents && <CircularProgress size={20} />}
                                            {params.InputProps.endAdornment}
                                        </>
                                    ),
                                }}
                            />
                        )}
                        disabled={isLoadingAgents || agentNames.length === 0}
                        fullWidth
                    />
                </Grid>
            </Grid>

            {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                    {error} - Please check the console for details.
                </Alert>
            )}
        </>
    );
};

export default AgentSelector; 
