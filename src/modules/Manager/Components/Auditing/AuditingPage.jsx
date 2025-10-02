import { useState, useCallback } from 'react';
import {
    Box,
    Alert,
    Tabs,
    Tab,
    Badge
} from '@mui/material';
import { useAgentsApi } from '../../services/agents-api';
import { useNotification } from '../../contexts/NotificationContext';
import { useAuditContext } from '../../contexts/AuditContext';
import AgentSelector from './AgentSelector';
import WorkflowSelector from './WorkflowSelector';
import WorkflowLogs from './WorkflowLogs';
import ErrorLogs from './ErrorLogs';
import PageLayout from '../Common/PageLayout';

/**
 * Parent component that coordinates messaging components and manages shared state
 */
const AuditingPage = () => {
    // --- State --- 
    const [selectedAgentName, setSelectedAgentName] = useState(null);
    const [selectedWorkflowId, setSelectedWorkflowId] = useState(null);
    const [selectedWorkflowTypeId, setSelectedWorkflowTypeId] = useState(null);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState(0);
    
    // --- Hooks ---
    const agentsApi = useAgentsApi();
    const { showError } = useNotification();
    const { tabErrorCount, resetTabErrorCount } = useAuditContext();

    // --- Callbacks --- 
    const handleAgentSelected = useCallback((agentName) => {
        setSelectedAgentName(agentName);
        setSelectedWorkflowId(null); // Reset workflow selection
        setSelectedWorkflowTypeId(null); // Reset workflow type selection
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

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
        
        // Reset tab error count when switching to the Activity Retry Failures tab
        if (newValue === 1 && tabErrorCount > 0) {
            resetTabErrorCount();
        }
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs 
                    value={activeTab} 
                    onChange={handleTabChange}
                    aria-label="auditing tabs"
                    sx={{
                        '& .MuiTabs-indicator': {
                            backgroundColor: 'primary.main',
                        },
                        '& .MuiTab-root': {
                            textTransform: 'none',
                            fontSize: '1rem',
                            fontWeight: 200,
                            minWidth: 120,
                            '&.Mui-selected': {
                                color: 'primary.main',
                                fontWeight: 200,
                            },
                        },
                    }}
                >
                    <Tab 
                        label={
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                Activity Retry Failures
                                {tabErrorCount > 0 && (
                                    <Badge 
                                        badgeContent={tabErrorCount} 
                                        color="error"
                                        sx={{ 
                                            ml: 1,
                                            '& .MuiBadge-badge': {
                                                fontSize: '0.65rem',
                                                height: '18px',
                                                minWidth: '18px',
                                            }
                                        }}
                                    />
                                )}
                            </Box>
                        } 
                    />
                    <Tab label="Workflow Log Explorer" />
                </Tabs>
            </Box>

            <PageLayout title="Auditing">
                {/* Display top-level error if any */} 
                {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 'var(--radius-lg)' }}>{error}</Alert>}

                {activeTab === 0 && (
                    <ErrorLogs />
                )}

                {activeTab === 1 && (
                    <>
                        <AgentSelector
                            agentsApi={agentsApi}
                            showError={showError}
                            onAgentSelected={handleAgentSelected}
                        />

                        {selectedAgentName && (
                            <WorkflowSelector
                                selectedAgentName={selectedAgentName}
                                selectedWorkflowId={selectedWorkflowId}
                                selectedWorkflowTypeId={selectedWorkflowTypeId}
                                onWorkflowSelected={handleWorkflowSelected}
                                onWorkflowTypeSelected={handleWorkflowTypeSelected}
                            />
                        )}

                        <WorkflowLogs
                            selectedAgentName={selectedAgentName}
                            selectedWorkflowId={selectedWorkflowId}
                            selectedWorkflowTypeId={selectedWorkflowTypeId}
                        />
                    </>
                )}
            </PageLayout>
        </Box>
    );
};

export default AuditingPage; 