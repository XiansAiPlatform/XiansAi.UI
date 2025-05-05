import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    CircularProgress,
    Alert,
    Paper,
    Button,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Pagination
} from '@mui/material';
import { useAuditingApi } from '../../services/auditing-api';
import { useNotification } from '../../contexts/NotificationContext';
import { getRelativeTimeString } from './utils/ConversationUtils';

// Microsoft logging levels
const LOG_LEVELS = [
    { value: '', label: 'All Levels' },
    { value: 0, label: 'Trace' },
    { value: 1, label: 'Debug' },
    { value: 2, label: 'Information' },
    { value: 3, label: 'Warning' },
    { value: 4, label: 'Error' },
    { value: 5, label: 'Critical' },
    { value: 6, label: 'None' }
];

const WorkflowLogs = ({
    selectedAgentName,
    selectedUserId,
    selectedWorkflowId,
    selectedWorkflowTypeId
}) => {
    const [logs, setLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedLogLevel, setSelectedLogLevel] = useState('');
    
    // Pagination state
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    
    const auditingApi = useAuditingApi();
    const { showError } = useNotification();

    useEffect(() => {
        if (!selectedAgentName) {
            setLogs([]);
            return;
        }

        const fetchLogs = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const options = {
                    participantId: selectedUserId || null,
                    workflowType: selectedWorkflowTypeId || null,
                    workflowId: selectedWorkflowId || null,
                    logLevel: selectedLogLevel,
                    page,
                    pageSize
                };
                
                const result = await auditingApi.getWorkflowLogs(selectedAgentName, options);
        
                setLogs(result.logs);
                setTotalCount(result.totalCount);
                setTotalPages(result.totalPages);
                
                // Reset page if it's out of bounds
                if (page > result.totalPages && result.totalPages > 0) {
                    setPage(1);
                }
            } catch (err) {
                setError('Failed to fetch logs');
                showError(`Error fetching logs: ${err.message}`);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLogs();
    }, [selectedAgentName, selectedUserId, selectedWorkflowTypeId, selectedWorkflowId, selectedLogLevel, page, pageSize, auditingApi, showError]);

    const handlePageChange = (event, newPage) => {
        setPage(newPage);
    };

    if (!selectedAgentName) {
        return (
            <Typography variant="body1" color="textSecondary" sx={{ mt: 4, textAlign: 'center' }}>
                Please select an agent to view logs.
            </Typography>
        );
    }

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

    // Helper functions for log level display
    const getLogLevelLabel = (level) => {
        switch (level) {
            case 0: return 'TRACE';
            case 1: return 'DEBUG';
            case 2: return 'INFO';
            case 3: return 'WARNING';
            case 4: return 'ERROR';
            case 5: return 'CRITICAL';
            case 6: return 'NONE';
            default: return 'UNKNOWN';
        }
    };

    const getLogLevelColor = (level) => {
        switch (level) {
            case 5: return '#9c27b0'; // Critical - purple
            case 4: return '#d32f2f'; // Error - red
            case 3: return '#ff9800'; // Warning - orange
            case 2: return '#2196f3'; // Info - blue
            case 1: return '#00bcd4'; // Debug - cyan
            case 0: return '#8bc34a'; // Trace - light green
            default: return '#757575'; // None/Unknown - grey
        }
    };

    const getLogLevelClass = (level) => {
        switch (level) {
            case 4: return 'error';
            case 3: return 'warning';
            case 2: return 'info';
            default: return '';
        }
    };

    return (
        <Box sx={{ mt: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                    Workflow Logs {totalCount > 0 && `(${totalCount})`}
                </Typography>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Log Level</InputLabel>
                    <Select
                        value={selectedLogLevel}
                        label="Log Level"
                        onChange={(e) => {
                            setSelectedLogLevel(e.target.value);
                            setPage(1); // Reset to first page on filter change
                        }}
                    >
                        {LOG_LEVELS.map((level) => (
                            <MenuItem key={level.value} value={level.value}>
                                {level.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>
            
            <Paper sx={{ p: 0 }} elevation={1}>
                <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: 2,
                    maxHeight: '60vh',
                    overflow: 'auto',
                    p: 2,
                    '& .log-entry': {
                        p: 2,
                        borderRadius: 1,
                        backgroundColor: 'rgba(0, 0, 0, 0.02)',
                        '&.error': {
                            backgroundColor: 'rgba(211, 47, 47, 0.08)',
                            borderLeft: '4px solid #d32f2f'
                        },
                        '&.warning': {
                            backgroundColor: 'rgba(255, 152, 0, 0.08)',
                            borderLeft: '4px solid #ff9800'
                        },
                        '&.info': {
                            backgroundColor: 'rgba(33, 150, 243, 0.08)',
                            borderLeft: '4px solid #2196f3'
                        }
                    },
                    '& .log-header': {
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 1,
                        '& .log-level': {
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            fontSize: '0.75rem',
                            padding: '2px 8px',
                            borderRadius: 1
                        },
                        '& .log-time': {
                            color: 'text.secondary',
                            fontSize: '0.75rem'
                        }
                    },
                    '& .log-message': {
                        fontFamily: 'monospace',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        fontSize: '0.875rem',
                        mb: 1
                    },
                    '& .log-exception': {
                        fontFamily: 'monospace',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        fontSize: '0.75rem',
                        color: '#d32f2f',
                        backgroundColor: 'rgba(211, 47, 47, 0.08)',
                        p: 1,
                        borderRadius: 1,
                        mt: 1
                    }
                }}>
                    {logs.length > 0 ? (
                        logs.map((log, index) => {
                            // Create a guaranteed unique key for each log
                            const logKey = log.id || `log-${log.createdAt}-${index}-${log.level}-${log.message?.substring(0, 20)}`;
                            const logLevelClass = getLogLevelClass(log.level);

                            return (
                                <Box key={logKey} className={`log-entry ${logLevelClass}`}>
                                    <Box className="log-header">
                                        <Box 
                                            className="log-level"
                                            sx={{ 
                                                backgroundColor: `${getLogLevelColor(log.level)}20`,
                                                color: getLogLevelColor(log.level)
                                            }}
                                        >
                                            {getLogLevelLabel(log.level)}
                                        </Box>
                                        <Box className="log-time">
                                            {new Date(log.createdAt).toLocaleString()}
                                        </Box>
                                    </Box>
                                    <Box className="log-message">
                                        {log.message}
                                    </Box>
                                    {log.exception && (
                                        <Box className="log-exception">
                                            {log.exception}
                                        </Box>
                                    )}
                                </Box>
                            );
                        })
                    ) : (
                        <Typography variant="body1" color="textSecondary" textAlign="center" mt={3} mb={3}>
                            No logs available
                        </Typography>
                    )}
                </Box>
                
                {totalPages > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 2 }}>
                        <Pagination 
                            count={totalPages} 
                            page={page} 
                            onChange={handlePageChange} 
                            color="primary" 
                            showFirstButton 
                            showLastButton
                        />
                    </Box>
                )}
                
                {totalCount > 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', color: 'text.secondary', mb: 2, fontSize: '0.875rem' }}>
                        Showing {Math.min((page - 1) * pageSize + 1, totalCount)} - {Math.min(page * pageSize, totalCount)} of {totalCount} logs
                    </Box>
                )}
            </Paper>
        </Box>
    );
};

export default WorkflowLogs; 