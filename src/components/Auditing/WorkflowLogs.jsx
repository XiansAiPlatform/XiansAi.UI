import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    CircularProgress,
    Alert,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper
} from '@mui/material';
import { useAuditingApi } from '../../services/auditing-api';
import { useNotification } from '../../contexts/NotificationContext';
import { getRelativeTimeString } from './utils/ConversationUtils';

const WorkflowLogs = ({
    selectedAgentName,
    selectedUserId,
    selectedWorkflowId
}) => {
    const [logs, setLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const auditingApi = useAuditingApi();
    const { showError } = useNotification();

    useEffect(() => {
        if (!selectedWorkflowId) {
            setLogs([]);
            return;
        }

        const fetchLogs = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const logs = await auditingApi.getWorkflowLogs(selectedWorkflowId);
                setLogs(logs);
            } catch (err) {
                setError('Failed to fetch logs');
                showError(`Error fetching logs: ${err.message}`);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLogs();
    }, [selectedWorkflowId, auditingApi, showError]);

    if (!selectedWorkflowId) {
        return (
            <Typography variant="body1" color="textSecondary" sx={{ mt: 4, textAlign: 'center' }}>
                Please select a workflow to view logs.
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

    return (
        <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
                Workflow Logs
            </Typography>
            
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Time</TableCell>
                            <TableCell>Level</TableCell>
                            <TableCell>Message</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {logs.map((log, index) => (
                            <TableRow key={index}>
                                <TableCell>{getRelativeTimeString(log.timestamp)}</TableCell>
                                <TableCell>
                                    <Typography
                                        sx={{
                                            color: log.level === 'WARNING' ? 'warning.main' :
                                                  log.level === 'ERROR' ? 'error.main' :
                                                  'success.main'
                                        }}
                                    >
                                        {log.level}
                                    </Typography>
                                </TableCell>
                                <TableCell>{log.message}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default WorkflowLogs; 