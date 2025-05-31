import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';

/**
 * Component for displaying handover messages
 * 
 * @param {Object} props
 * @param {Object} props.message - The handover message object
 * @param {string} props.message.content - Message content to display
 */
const HandoverMessage = ({ message }) => {
    const theme = useTheme();
    const messageContent = message.content?.replace(/^"|"$/g, '') || '';

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