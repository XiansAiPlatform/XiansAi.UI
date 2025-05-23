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

const AgentSelector = ({
    agentsApi,
    showError,
    onAgentSelected
}) => {
    const [agentNames, setAgentNames] = useState([]);
    const [isLoadingAgents, setIsLoadingAgents] = useState(true);
    const [selectedAgentName, setSelectedAgentName] = useState('');
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAgents = async () => {
            setIsLoadingAgents(true);
            setError(null);
            setAgentNames([]);
            setSelectedAgentName('');
            onAgentSelected(null);
            try {
                const response = await agentsApi.getAllAgents();
                setAgentNames(Array.isArray(response) ? response : []);
            } catch (err) {
                const errorMsg = 'Failed to fetch agents.';
                setError(errorMsg);
                showError(`${errorMsg}: ${err.message}`);
                console.error(err);
            } finally {
                setIsLoadingAgents(false);
            }
        };
        fetchAgents();
    }, [agentsApi, showError, onAgentSelected]);

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