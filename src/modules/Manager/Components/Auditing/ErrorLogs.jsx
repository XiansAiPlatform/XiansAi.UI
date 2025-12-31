import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Alert,
    Paper,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Chip,
    ToggleButtonGroup,
    ToggleButton,
    Stack,
    IconButton,
    Tooltip,
    Switch,
    FormControlLabel,
    Dialog,
    DialogTitle,
    DialogContent,
    Button
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import RefreshIcon from '@mui/icons-material/Refresh';
import LinkIcon from '@mui/icons-material/Link';
import CloseIcon from '@mui/icons-material/Close';
import { useAuditingApi } from '../../services/auditing-api';
import { useLoading } from '../../contexts/LoadingContext';
import { useNotification } from '../../contexts/NotificationContext';
import { handleApiError } from '../../utils/errorHandler';
import EmptyState from '../Common/EmptyState';
import { ContentLoader } from '../Common/StandardLoaders';

const CriticalLogs = () => {
    const [criticalLogs, setCriticalLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [expandedAgents, setExpandedAgents] = useState({});
    const [expandedTypes, setExpandedTypes] = useState({});
    const [timeFilter, setTimeFilter] = useState('24hours');
    const [autoRefresh, setAutoRefresh] = useState(false);
    const [selectedRun, setSelectedRun] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedWorkflowId, setSelectedWorkflowId] = useState(null);

    const auditingApi = useAuditingApi();
    const { setLoading } = useLoading();
    const { showError } = useNotification();
    const navigate = useNavigate();

    const handleTimeFilterChange = (event, newTimeFilter) => {
        if (newTimeFilter !== null) {
            setTimeFilter(newTimeFilter);
        }
    };

    const getTimeRange = useCallback(() => {
        const now = new Date();
        let startTime = new Date();

        switch (timeFilter) {
            case '1hour':
                startTime.setHours(now.getHours() - 1);
                break;
            case '6hours':
                startTime.setHours(now.getHours() - 6);
                break;
            case '24hours':
                startTime.setHours(now.getHours() - 24);
                break;
            case '7days':
                startTime.setDate(now.getDate() - 7);
                break;
            default:
                startTime.setHours(now.getHours() - 24);
        }

        return {
            startTime: startTime.toISOString(),
            endTime: now.toISOString()
        };
    }, [timeFilter]);

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

    const fetchCriticalLogs = useCallback(async () => {
        setIsLoading(true);
        setLoading(true);
        setError(null);
        try {
            const { startTime, endTime } = getTimeRange();
            const result = await auditingApi.getCriticalLogs(startTime, endTime);
            setCriticalLogs(result);
        } catch (err) {
            setError('Failed to fetch critical logs');
            await handleApiError(err, 'Error fetching critical logs', showError);
        } finally {
            setIsLoading(false);
            setLoading(false);
        }
    }, [auditingApi, showError, getTimeRange, setLoading]);

    useEffect(() => {
        fetchCriticalLogs();

        let intervalId;
        if (autoRefresh) {
            intervalId = setInterval(fetchCriticalLogs, 30000); // Refresh every 30 seconds
        }

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [fetchCriticalLogs, autoRefresh]);

    const handleOpenDialog = (runGroup, workflowId) => {
        setSelectedRun(runGroup);
        setSelectedWorkflowId(workflowId);
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setSelectedRun(null);
        setSelectedWorkflowId(null);
    };

    if (isLoading) {
        return <ContentLoader />;
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ mt: 4 }}>
                {error}
            </Alert>
        );
    }

    if (!criticalLogs || criticalLogs.length === 0) {
        return (
            <Box sx={{ mt: 4 }}>
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 4,
                    flexDirection: { xs: 'column', md: 'row' },
                    gap: { xs: 2, md: 0 }
                }}>
                    <Typography variant="h6">
                        Activity Retry Failures
                    </Typography>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={autoRefresh}
                                    onChange={(e) => setAutoRefresh(e.target.checked)}
                                    size="small"
                                />
                            }
                            label="Auto-refresh"
                        />
                        <Tooltip title="Refresh logs">
                            <span>
                                <IconButton
                                    onClick={fetchCriticalLogs}
                                    disabled={isLoading}
                                    size="small"
                                >
                                    <RefreshIcon />
                                </IconButton>
                            </span>
                        </Tooltip>
                        <ToggleButtonGroup
                            value={timeFilter}
                            exclusive
                            onChange={handleTimeFilterChange}
                            size="small"
                            sx={{
                                '& .MuiToggleButton-root': {
                                    borderColor: 'var(--border-light)',
                                    color: 'var(--text-secondary)',
                                    textTransform: 'none',
                                    '&.Mui-selected': {
                                        backgroundColor: 'var(--bg-selected)',
                                        color: 'var(--text-primary)',
                                        fontWeight: 500
                                    }
                                }
                            }}
                        >
                            <ToggleButton value="1hour">Last Hour</ToggleButton>
                            <ToggleButton value="6hours">Last 6 Hours</ToggleButton>
                            <ToggleButton value="24hours">Last 24 Hours</ToggleButton>
                            <ToggleButton value="7days">Last 7 Days</ToggleButton>
                        </ToggleButtonGroup>
                    </Stack>
                </Box>
                <EmptyState
                    title="No Critical Logs Found"
                    description="No critical logs were found for the selected time period. Try adjusting the time filter or check back later."
                    context="audits"
                />
            </Box>
        );
    }

    return (
        <Box sx={{ mt: 4 }}>
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 4,
                flexDirection: { xs: 'column', md: 'row' },
                gap: { xs: 2, md: 0 }
            }}>
                <Typography variant="h6">
                    Activity Retry Failures
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                    <FormControlLabel
                        control={
                            <Switch
                                checked={autoRefresh}
                                onChange={(e) => setAutoRefresh(e.target.checked)}
                                size="small"
                            />
                        }
                        label="Auto-refresh"
                    />
                    <Tooltip title="Refresh logs">
                        <span>
                            <IconButton
                                onClick={fetchCriticalLogs}
                                disabled={isLoading}
                                size="small"
                            >
                                <RefreshIcon />
                            </IconButton>
                        </span>
                    </Tooltip>
                    <ToggleButtonGroup
                        value={timeFilter}
                        exclusive
                        onChange={handleTimeFilterChange}
                        size="small"
                        sx={{
                            '& .MuiToggleButton-root': {
                                borderColor: 'var(--border-light)',
                                color: 'var(--text-secondary)',
                                textTransform: 'none',
                                '&.Mui-selected': {
                                    backgroundColor: 'var(--bg-selected)',
                                    color: 'var(--text-primary)',
                                    fontWeight: 500
                                }
                            }
                        }}
                    >
                        <ToggleButton value="1hour">Last Hour</ToggleButton>
                        <ToggleButton value="6hours">Last 6 Hours</ToggleButton>
                        <ToggleButton value="24hours">Last 24 Hours</ToggleButton>
                        <ToggleButton value="7days">Last 7 Days</ToggleButton>
                    </ToggleButtonGroup>
                </Stack>
            </Box>

            {criticalLogs.map((agentGroup, agentIndex) => (
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
                                    color="primary"
                                    label={`${agentGroup.workflowTypes.reduce((total, type) =>
                                        total + type.workflows.reduce((workflowTotal, workflow) =>
                                            workflowTotal + workflow.workflowRuns.reduce((runTotal, run) =>
                                                runTotal + run.criticalLogs.length, 0), 0), 0)} Total`}
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
                                                color="primary"
                                                label={`${workflowTypeGroup.workflows.reduce((total, workflow) =>
                                                    total + workflow.workflowRuns.reduce((runTotal, run) =>
                                                        runTotal + run.criticalLogs.length, 0), 0)} Total`}
                                                sx={{ ml: 2 }}
                                            />
                                        )}
                                    </Box>
                                </AccordionSummary>
                                <AccordionDetails>
                                    {workflowTypeGroup.workflows.map((workflowGroup, workflowIndex) => (
                                        <Box
                                            key={`workflow-${agentIndex}-${typeIndex}-${workflowIndex}`}
                                            sx={{ mb: 2, p: 2, backgroundColor: 'background.default', borderRadius: 1 }}
                                        >
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <Typography variant="body2" fontWeight="medium" component="div" sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <Box sx={{
                                                            width: '10rem',
                                                            color: 'text.secondary',
                                                            fontSize: '0.75rem',
                                                            mr: 1.5
                                                        }}>
                                                            {workflowGroup.workflowRuns[0]?.criticalLogs[0]?.createdAt
                                                                ? new Date(workflowGroup.workflowRuns[0].criticalLogs[0].createdAt).toLocaleString()
                                                                : ''
                                                            }
                                                        </Box>
                                                        <Box sx={{
                                                            minWidth: '12rem',
                                                            maxWidth: '35rem',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap'
                                                        }}>
                                                            {workflowGroup.workflowId}
                                                        </Box>
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', ml: 2, flexShrink: 0 }}>
                                                        <Tooltip title="View workflow run">
                                                            <span>
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => navigate(`/manager/runs/details?workflowId=${encodeURIComponent(workflowGroup.workflowId)}&runId=${encodeURIComponent(workflowGroup.workflowRuns[0].workflowRunId)}`)}
                                                                    disabled={workflowGroup.workflowId === 'defaultWorkflowId'}
                                                                >
                                                                    <LinkIcon fontSize="small" />
                                                                </IconButton>
                                                            </span>
                                                        </Tooltip>
                                                    </Box>
                                                </Box>
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    onClick={() => handleOpenDialog(workflowGroup.workflowRuns[0], workflowGroup.workflowId)}
                                                >
                                                    View Details
                                                </Button>
                                            </Box>
                                        </Box>
                                    ))}
                                </AccordionDetails>
                            </Accordion>
                        ))}
                    </AccordionDetails>
                </Accordion>
            ))}

            <Dialog
                open={isDialogOpen}
                onClose={handleCloseDialog}
                maxWidth="md"
                fullWidth
            >
                {selectedRun && (
                    <>
                        <DialogTitle>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography variant="h6">Workflow Run Details</Typography>
                                    <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
                                        Run ID: {selectedRun.workflowRunId}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Tooltip title="View workflow run">
                                        <span>
                                            <IconButton
                                                size="small"
                                                onClick={() => navigate(`/manager/runs/details?workflowId=${encodeURIComponent(selectedWorkflowId)}&runId=${encodeURIComponent(selectedRun.workflowRunId)}`)}
                                                disabled={selectedWorkflowId === 'defaultWorkflowId'}
                                            >
                                                <LinkIcon fontSize="small" />
                                            </IconButton>
                                        </span>
                                    </Tooltip>
                                    <IconButton
                                        size="small"
                                        onClick={handleCloseDialog}
                                        aria-label="close"
                                    >
                                        <CloseIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            </Box>
                        </DialogTitle>
                        <DialogContent>
                            {selectedRun.criticalLogs.map((criticalLog, logIndex) => (
                                <Paper
                                    key={`log-${logIndex}`}
                                    sx={{
                                        p: 2,
                                        mb: 2,
                                        backgroundColor: 'rgba(211, 47, 47, 0.08)',
                                        borderLeft: '4px solid #d32f2f'
                                    }}
                                >
                                    <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
                                        <strong>Timestamp:</strong> {new Date(criticalLog.createdAt).toLocaleString()}
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
                                        {criticalLog.message}
                                    </Typography>

                                    {criticalLog.exception && (
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
                                            {criticalLog.exception}
                                        </Typography>
                                    )}
                                </Paper>
                            ))}
                        </DialogContent>
                    </>
                )}
            </Dialog>
        </Box>
    );
};

export default CriticalLogs; 
