import React, { useState, useEffect } from 'react';
import { Box, Paper, useTheme, Typography } from '@mui/material';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

/**
 * A component that displays a typing indicator animation
 * Shows "connecting" for 1 second, then "thinking", then "connection error" after 10 seconds
 */
const TypingIndicator = () => {
  const theme = useTheme();
  const [phase, setPhase] = useState('connecting');
  
  useEffect(() => {
    const thinkingTimer = setTimeout(() => {
      setPhase('thinking');
    }, 2000);
    
    const errorTimer = setTimeout(() => {
      setPhase('error');
    }, 15000);
    
    return () => {
      clearTimeout(thinkingTimer);
      clearTimeout(errorTimer);
    };
  }, []);

  const isDarkMode = theme.palette.mode === 'dark';
  const isConnecting = phase === 'connecting';
  const isError = phase === 'error';
  
  const getPhaseText = () => {
    switch (phase) {
      case 'connecting':
        return 'connecting';
      case 'thinking':
        return 'thinking';
      case 'error':
        return 'Error, check if agent is running';
      default:
        return 'thinking';
    }
  };

  const getPhaseColors = () => {
    if (isError) {
      return {
        primary: theme.palette.error.main,
        light: theme.palette.error.light,
        dark: theme.palette.error.dark,
      };
    } else if (isConnecting) {
      return {
        primary: theme.palette.primary.main,
        light: theme.palette.primary.light,
        dark: theme.palette.primary.dark,
      };
    } else {
      return {
        primary: theme.palette.secondary.main,
        light: theme.palette.secondary.light,
        dark: theme.palette.secondary.dark,
      };
    }
  };

  const colors = getPhaseColors();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        mb: 2,
        width: '100%',
        pr: '16px',
        opacity: 0,
        animation: 'fadeIn 0.3s ease-out forwards',
        '@keyframes fadeIn': {
          '0%': { opacity: 0, transform: 'translateY(10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' }
        }
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
            p: 2.5,
            pl: 3,
            pr: 3,
            maxWidth: isError ? '280px' : '240px',
            background: `linear-gradient(135deg, ${colors.light}15, ${colors.primary}10)`,
            backdropFilter: 'blur(10px)',
            color: theme.palette.text.primary,
            borderRadius: '5px',
            position: 'relative',
            border: '1px solid',
            borderColor: `${colors.primary}20`,
            display: 'flex',
            alignItems: 'center',
            boxShadow: isDarkMode 
              ? '0 4px 20px rgba(0,0,0,0.3), 0 1px 3px rgba(0,0,0,0.2)'
              : '0 4px 20px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.1)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: 'translateZ(0)',
            ...(isError && {
              animation: 'errorShake 0.5s ease-in-out',
              '@keyframes errorShake': {
                '0%, 100%': { transform: 'translateX(0)' },
                '25%': { transform: 'translateX(-2px)' },
                '75%': { transform: 'translateX(2px)' }
              }
            }),
            '&::before': {
              content: '""',
              position: 'absolute',
              width: 0,
              height: 0,
              borderStyle: 'solid',
              borderWidth: '10px 0 10px 12px',
              borderColor: `transparent transparent transparent ${colors.primary}20`,
              top: '24px',
              right: '-12px',
              zIndex: 1,
              transition: 'border-color 0.3s ease'
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              width: 0,
              height: 0,
              borderStyle: 'solid',
              borderWidth: '9px 0 9px 11px',
              borderColor: `transparent transparent transparent ${colors.light}15`,
              top: '25px',
              right: '-11px',
              zIndex: 2,
              transition: 'border-color 0.3s ease'
            }
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              background: `linear-gradient(45deg, ${colors.primary}, ${colors.light})`,
              borderRadius: '50%',
              p: 0.8,
              mr: 1.5,
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              animation: isError 
                ? 'errorPulse 1s infinite ease-in-out'
                : 'iconPulse 2s infinite ease-in-out',
              '@keyframes iconPulse': {
                '0%, 100%': { transform: 'scale(1)' },
                '50%': { transform: 'scale(1.05)' }
              },
              '@keyframes errorPulse': {
                '0%, 100%': { transform: 'scale(1)', opacity: 1 },
                '50%': { transform: 'scale(1.1)', opacity: 0.8 }
              }
            }}
          >
            {isError ? (
              <ErrorOutlineIcon 
                sx={{ 
                  fontSize: '1.1rem',
                  color: 'white',
                  filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))'
                }} 
              />
            ) : (
              <ChatBubbleOutlineIcon 
                sx={{ 
                  fontSize: '1.1rem',
                  color: 'white',
                  filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))'
                }} 
              />
            )}
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', minHeight: '28px' }}>
            <Typography 
              variant="body2" 
              sx={{ 
                color: theme.palette.text.primary,
                fontWeight: 500,
                fontSize: '0.9rem',
                letterSpacing: '0.02em',
                background: `linear-gradient(45deg, ${colors.primary}, ${colors.dark})`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                transition: 'all 0.3s ease',
                textShadow: 'none'
              }}
            >
              {getPhaseText()}
            </Typography>
            
            {/* Animated dots - hide in error state */}
            {!isError && (
              <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                {[0, 1, 2].map((dot) => (
                  <Box
                    key={dot}
                    sx={{
                      width: '5px',
                      height: '5px',
                      background: `linear-gradient(45deg, ${colors.primary}, ${colors.light})`,
                      borderRadius: '50%',
                      mx: 0.4,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                      animation: 'dotAnimation 1.8s infinite cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                      animationDelay: `${dot * 0.3}s`,
                      transition: 'background 0.3s ease',
                      '@keyframes dotAnimation': {
                        '0%, 80%, 100%': {
                          opacity: 0.3,
                          transform: 'scale(0.8) translateY(0)',
                        },
                        '40%': {
                          opacity: 1,
                          transform: 'scale(1.3) translateY(-8px)',
                        },
                      },
                    }}
                  />
                ))}
              </Box>
            )}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default TypingIndicator; 