import React from 'react';
import { Box, Paper, Typography, useTheme } from '@mui/material';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';

/**
 * A component that displays a typing indicator animation
 * Appears when the system is processing a message
 */
const TypingIndicator = () => {
  const theme = useTheme();
  
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        mb: 1,
        width: '100%',
        pr: '12px',
      }}
    >
      
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          width: '100%',
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 2,
            pl: 2.5,
            maxWidth: '200px',
            backgroundColor: theme.palette.grey[100],
            color: theme.palette.text.primary,
            borderRadius: '5px',
            position: 'relative',
            border: '1px solid',
            borderColor: theme.palette.grey[300],
            display: 'flex',
            alignItems: 'center',
            '&::before': {
              content: '""',
              position: 'absolute',
              width: 0,
              height: 0,
              borderStyle: 'solid',
              borderWidth: '8px 0 8px 8px',
              borderColor: `transparent transparent transparent ${theme.palette.grey[300]}`,
              top: '20px',
              right: '-8px',
              zIndex: 1
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              width: 0,
              height: 0,
              borderStyle: 'solid',
              borderWidth: '7px 0 7px 7px',
              borderColor: `transparent transparent transparent ${theme.palette.grey[100]}`,
              top: '21px',
              right: '-7px',
              zIndex: 2
            }
          }}
        >
          <ChatBubbleOutlineIcon 
            sx={{ 
              fontSize: '1rem', 
              mr: 1, 
              color: theme.palette.text.secondary 
            }} 
          />
          
          <Box sx={{ display: 'flex', alignItems: 'center', height: '24px' }}>
            {/* Animated dots */}
            {[0, 1, 2].map((dot) => (
              <Box
                key={dot}
                sx={{
                  width: '6px',
                  height: '6px',
                  backgroundColor: theme.palette.primary.main,
                  borderRadius: '50%',
                  mx: 0.5,
                  animation: 'typingAnimation 1.5s infinite ease-in-out',
                  animationDelay: `${dot * 0.2}s`,
                  '@keyframes typingAnimation': {
                    '0%': {
                      transform: 'translateY(0)',
                    },
                    '50%': {
                      transform: 'translateY(-7px)',
                    },
                    '100%': {
                      transform: 'translateY(0)',
                    },
                  },
                }}
              />
            ))}
          </Box>

        </Paper>
      </Box>
    </Box>
  );
};

export default TypingIndicator; 