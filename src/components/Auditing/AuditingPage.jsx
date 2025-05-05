import React, { useState, useCallback } from 'react';
import {
    Box,
    Typography,
    Alert
} from '@mui/material';
import { useAuditingApi } from '../../services/auditing-api';
import { useNotification } from '../../contexts/NotificationContext';
import AgentSelector from './AgentSelector';
import UserAndWorkflowTypeSelector from './UserAndWorkflowTypeSelector';
import WorkflowLogs from './WorkflowLogs';

/**
 * Parent component that coordinates messaging components and manages shared state
 */
const AuditingPage = () => {
    // --- State --- 
    const [selectedAgentName, setSelectedAgentName] = useState(null);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [selectedWorkflowId, setSelectedWorkflowId] = useState(null);
    const [selectedWorkflowTypeId, setSelectedWorkflowTypeId] = useState(null);
    const [error, setError] = useState(null);
    
    // --- Hooks ---
    const auditingApi = useAuditingApi(); 
    const { showError } = useNotification();

    // --- Callbacks --- 
    const handleAgentSelected = useCallback((agentName) => {
        setSelectedAgentName(agentName);
        setSelectedUserId(null); // Reset user selection
        setSelectedWorkflowId(null); // Reset workflow selection
        setSelectedWorkflowTypeId(null); // Reset workflow type selection
        setError(null);
    }, []);

    const handleUserSelected = useCallback((userId) => {
        setSelectedUserId(userId);
        setSelectedWorkflowId(null); // Reset workflow selection
        setError(null);
    }, []);

    const handleWorkflowSelected = useCallback((workflowId) => {
        setSelectedWorkflowId(workflowId);
        setError(null);
    }, []);

    const handleWorkflowTypeSelected = useCallback((workflowTypeId) => {
        setSelectedWorkflowTypeId(workflowTypeId);
        setError(null);
    }, []);

    return (
        <Box sx={{
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            width: '100%'
        }}>
            <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
                Auditing
            </Typography>

            {/* Display top-level error if any */} 
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <AgentSelector
                auditingApi={auditingApi}
                showError={showError}
                onAgentSelected={handleAgentSelected}
            />

            {selectedAgentName && (
                <UserAndWorkflowTypeSelector
                    selectedAgentName={selectedAgentName}
                    selectedUserId={selectedUserId}
                    selectedWorkflowId={selectedWorkflowId}
                    selectedWorkflowTypeId={selectedWorkflowTypeId}
                    onUserSelected={handleUserSelected}
                    onWorkflowSelected={handleWorkflowSelected}
                    onWorkflowTypeSelected={handleWorkflowTypeSelected}
                />
            )}

            <WorkflowLogs
                selectedAgentName={selectedAgentName}
                selectedUserId={selectedUserId}
                selectedWorkflowId={selectedWorkflowId}
                selectedWorkflowTypeId={selectedWorkflowTypeId}
            />
        </Box>
    );
};

export default AuditingPage; 