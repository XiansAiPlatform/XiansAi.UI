import { Box, Typography, useTheme } from '@mui/material';

/**
 * Component for displaying handover messages
 * 
 * @param {Object} props
 * @param {Object} props.message - The message object
 * @param {string} props.message.text - Message text to display
 * @param {boolean} [props.isRecent] - Whether the message is recent (less than 1 minute old)
 */
const HandoverMessage = ({ message, isRecent = false }) => {
    const theme = useTheme();
    const messageContent = message.text?.replace(/^"|"$/g, '') || '';

    return (
        <Box 
            sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                my: 2,
                mt: 6,
                px: 2
            }}
        >
            <Typography 
                variant="body1" 
                sx={{ 
                    textAlign: 'center',
                    fontStyle: 'italic',
                    color: theme.palette.text.secondary,
                    fontWeight: 500,
                    fontSize: '0.8rem',
                    padding: '6px 12px',
                }}
            >
                {messageContent}
            </Typography>
        </Box>
    );
};

export default HandoverMessage; 