import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    CircularProgress,
    Alert,
    Paper,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Chip
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useAuditingApi } from '../../services/auditing-api';
import { useNotification } from '../../contexts/NotificationContext';

const ErrorLogs = () => {
    const [errorLogs, setErrorLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [expandedAgents, setExpandedAgents] = useState({});
    const [expandedTypes, setExpandedTypes] = useState({});
    
    const auditingApi = useAuditingApi();
    const { showError } = useNotification();

    const handleAgentChange = (agentIndex) => (event, isExpanded) => {
        setExpandedAgents(prev => ({
            ...prev,
            [agentIndex]: isExpanded
        }));
    };

    const handleTypeChange = (agentIndex, typeIndex) => (event, isExpanded) => {
        setExpandedTypes(prev => ({
            ...prev,
            [`${agentIndex}-${typeIndex}`]: isExpanded
        }));
    };

    useEffect(() => {
        const fetchErrorLogs = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const result = await auditingApi.getErrorLogs();
                setErrorLogs(result);
            } catch (err) {
                setError('Failed to fetch error logs');
                showError(`Error fetching error logs: ${err.message}`);
            } finally {
                setIsLoading(false);
            }
        };

        fetchErrorLogs();
    }, [auditingApi, showError]);

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ mt: 4 }}>
                {error}
            </Alert>
        );
    }

    if (!errorLogs || errorLogs.length === 0) {
        return (
            <Alert severity="info" sx={{ mt: 4 }}>
                No error logs found.
            </Alert>
        );
    }

    return (
        <Box sx={{ mt: 4 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
                Recent Error Logs Across All Agents
            </Typography>
            
            {errorLogs.map((agentGroup, agentIndex) => (
                <Accordion 
                    key={`agent-${agentIndex}`} 
                    expanded={expandedAgents[agentIndex] || false}
                    sx={{ mb: 2 }}
                    onChange={handleAgentChange(agentIndex)}
                >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="subtitle1" fontWeight="bold">
                                {agentGroup.agentName}
                            </Typography>
                            {!expandedAgents[agentIndex] && (
                                <Chip 
                                    size="small" 
                                    color="error" 
                                    label={`${agentGroup.workflowTypes.reduce((total, type) => 
                                        total + type.workflows.reduce((workflowTotal, workflow) => 
                                            workflowTotal + workflow.workflowRuns.reduce((runTotal, run) => 
                                                runTotal + run.errorLogs.length, 0), 0), 0)} Error(s)`}
                                    icon={<ErrorOutlineIcon />}
                                    sx={{ ml: 2 }}
                                />
                            )}
                        </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                        {agentGroup.workflowTypes.map((workflowTypeGroup, typeIndex) => (
                            <Accordion 
                                key={`type-${agentIndex}-${typeIndex}`} 
                                expanded={expandedTypes[`${agentIndex}-${typeIndex}`] || false}
                                sx={{ mb: 2, backgroundColor: 'background.paper' }}
                                onChange={handleTypeChange(agentIndex, typeIndex)}
                            >
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Typography variant="subtitle2">
                                            {workflowTypeGroup.workflowTypeName}
                                        </Typography>
                                        {!expandedTypes[`${agentIndex}-${typeIndex}`] && (
                                            <Chip 
                                                size="small" 
                                                color="error" 
                                                label={`${workflowTypeGroup.workflows.reduce((total, workflow) => 
                                                    total + workflow.workflowRuns.reduce((runTotal, run) => 
                                                        runTotal + run.errorLogs.length, 0), 0)} Error(s)`}
                                                icon={<ErrorOutlineIcon />}
                                                sx={{ ml: 2 }}
                                            />
                                        )}
                                    </Box>
                                </AccordionSummary>
                                <AccordionDetails>
                                    {workflowTypeGroup.workflows.map((workflowGroup, workflowIndex) => (
                                        <Accordion 
                                            key={`workflow-${agentIndex}-${typeIndex}-${workflowIndex}`}
                                            sx={{ mb: 1, backgroundColor: 'background.default' }}
                                        >
                                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <Typography variant="body2" fontWeight="medium">
                                                        Workflow: {workflowGroup.workflowId}
                                                    </Typography>
                                                    <Chip 
                                                        size="small" 
                                                        color="error" 
                                                        label={`${workflowGroup.workflowRuns.reduce((total, run) => total + run.errorLogs.length, 0)} Error(s)`}
                                                        icon={<ErrorOutlineIcon />}
                                                        sx={{ ml: 2 }}
                                                    />
                                                </Box>
                                            </AccordionSummary>
                                            <AccordionDetails>
                                                {workflowGroup.workflowRuns.map((runGroup, runIndex) => (
                                                    <Paper 
                                                        key={`run-${agentIndex}-${typeIndex}-${workflowIndex}-${runIndex}`}
                                                        sx={{ 
                                                            p: 2, 
                                                            mb: 1, 
                                                            backgroundColor: 'rgba(211, 47, 47, 0.08)',
                                                            borderLeft: '4px solid #d32f2f'
                                                        }}
                                                    >
                                                        <Box sx={{ mb: 1 }}>
                                                            <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
                                                                <strong>Workflow Run ID:</strong> {runGroup.workflowRunId}
                                                            </Typography>
                                                        </Box>
                            
                                                        {runGroup.errorLogs.map((errorLog, logIndex) => (
                                                            <Box key={`log-${logIndex}`} sx={{ mb: 2 }}>
                                                                <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
                                                                    <strong>Timestamp:</strong> {new Date(errorLog.createdAt).toLocaleString()}
                                                                </Typography>
                                                                
                                                                <Typography 
                                                                    variant="body2" 
                                                                    sx={{ 
                                                                        fontFamily: 'monospace',
                                                                        whiteSpace: 'pre-wrap',
                                                                        wordBreak: 'break-word',
                                                                        p: 1,
                                                                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                                                        borderRadius: 1
                                                                    }}
                                                                >
                                                                    {errorLog.message}
                                                                </Typography>
                                                                
                                                                {errorLog.exception && (
                                                                    <Typography 
                                                                        variant="body2" 
                                                                        sx={{ 
                                                                            fontFamily: 'monospace',
                                                                            whiteSpace: 'pre-wrap',
                                                                            wordBreak: 'break-word',
                                                                            p: 1,
                                                                            mt: 1,
                                                                            backgroundColor: 'rgba(211, 47, 47, 0.14)',
                                                                            borderRadius: 1
                                                                        }}
                                                                    >
                                                                        {errorLog.exception}
                                                                    </Typography>
                                                                )}
                                                            </Box>
                                                        ))}
                                                    </Paper>
                                                ))}
                                            </AccordionDetails>
                                        </Accordion>
                                    ))}
                                </AccordionDetails>
                            </Accordion>
                        ))}
                    </AccordionDetails>
                </Accordion>
            ))}
        </Box>
    );
};

export default ErrorLogs; 