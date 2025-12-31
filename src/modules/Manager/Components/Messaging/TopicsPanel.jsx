import { 
    Paper, 
    Box, 
    Typography, 
    useTheme,
    IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

/**
 * Topics panel component - placeholder for future topics functionality
 * This will replace the conversations list in the left panel
 */
const TopicsPanel = ({ selectedAgentName }) => {
    const theme = useTheme();

    return (
        <Paper 
            sx={{
                bgcolor: theme.palette.background.paper,
                border: '1px solid',
                borderColor: theme.palette.divider,
                borderRadius: 2,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                height: '100%'
            }}
        >
            <Box sx={{ 
                p: 2, 
                borderBottom: '1px solid', 
                borderColor: theme.palette.divider,
                backgroundColor: theme.palette.background.paper,
                borderTopLeftRadius: 1,
                borderTopRightRadius: 1,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <Typography variant="subtitle1" fontWeight="bold">
                    Topics
                </Typography>
                <IconButton 
                    size="small" 
                    color="primary" 
                    onClick={() => {}}
                    disabled={!selectedAgentName}
                    title="Add new topic"
                >
                    <AddIcon />
                </IconButton>
            </Box>
            <Box sx={{ 
                flex: '1 1 auto', 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                p: 3
            }}>
                <Typography variant="body2" color="text.secondary" align="center">
                    Topics feature coming soon...
                </Typography>
            </Box>
        </Paper>
    );
};

export default TopicsPanel;

