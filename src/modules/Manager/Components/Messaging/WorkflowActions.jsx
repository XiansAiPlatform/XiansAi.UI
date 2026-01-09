import {
    Box,
    Button
} from '@mui/material';

const WorkflowActions = ({
    selectedAgentName,
    onRefresh,
}) => {
    return (
        <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button
                variant="outlined"
                size="small"
                onClick={() => onRefresh()}
                disabled={!selectedAgentName}
            >
                Refresh
            </Button>
        </Box>
    );
};

export default WorkflowActions; 