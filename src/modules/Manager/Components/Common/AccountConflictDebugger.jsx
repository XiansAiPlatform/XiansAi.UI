import React, { useEffect } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { 
  Paper, 
  Typography, 
  Box, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails,
  Chip
} from '@mui/material';
import { ExpandMore, BugReport } from '@mui/icons-material';

/**
 * Debug component to help troubleshoot account conflict detection issues.
 * Only shows in development mode or when explicitly enabled.
 */
const AccountConflictDebugger = ({ enabled = false }) => {
  const { 
    error, 
    isAccountConflictError, 
    hasMultipleAccounts, 
    getCachedAccounts,
    isAuthenticated,
    isLoading
  } = useAuth();

  useEffect(() => {
    if (error) {
      console.group('🐛 Account Conflict Debug Info');
      console.log('Current error:', error);
      console.log('Error type:', typeof error);
      console.log('Error message:', error.message);
      console.log('Error code:', error.code);
      console.log('Error type field:', error.type);
      console.log('Error userMessage:', error.userMessage);
      
      // Safely call functions that might trigger MSAL calls
      try {
        console.log('Is account conflict error:', isAccountConflictError ? isAccountConflictError(error) : 'Function not available');
      } catch (err) {
        console.log('Is account conflict error: Error calling function -', err.message);
      }
      
      try {
        console.log('Has multiple accounts:', hasMultipleAccounts ? hasMultipleAccounts() : 'Function not available');
      } catch (err) {
        console.log('Has multiple accounts: Error calling function -', err.message);
      }
      
      try {
        console.log('Cached accounts:', getCachedAccounts ? getCachedAccounts() : 'Function not available');
      } catch (err) {
        console.log('Cached accounts: Error calling function -', err.message);
      }
      
      console.log('Is authenticated:', isAuthenticated);
      console.log('Is loading:', isLoading);
      console.groupEnd();
    }
  }, [error, isAccountConflictError, hasMultipleAccounts, getCachedAccounts, isAuthenticated, isLoading]);

  // Only show in development or when explicitly enabled
  if (!enabled && process.env.NODE_ENV === 'production') {
    return null;
  }

  if (!error) {
    return null;
  }

  // Safely get values with error handling
  let isConflictError = false;
  let multipleAccounts = false;
  let cachedAccounts = [];
  
  try {
    isConflictError = isAccountConflictError ? isAccountConflictError(error) : false;
  } catch (err) {
    console.warn('Debug: Error checking conflict error:', err.message);
  }
  
  try {
    multipleAccounts = hasMultipleAccounts ? hasMultipleAccounts() : false;
  } catch (err) {
    console.warn('Debug: Error checking multiple accounts:', err.message);
  }
  
  try {
    cachedAccounts = getCachedAccounts ? getCachedAccounts() : [];
  } catch (err) {
    console.warn('Debug: Error getting cached accounts:', err.message);
  }

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        position: 'fixed', 
        bottom: 20, 
        right: 20, 
        maxWidth: 400, 
        zIndex: 9999,
        bgcolor: 'warning.light',
        border: '2px solid',
        borderColor: 'warning.main'
      }}
    >
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box display="flex" alignItems="center" gap={1}>
            <BugReport color="error" />
            <Typography variant="subtitle2">
              Account Conflict Debug
            </Typography>
            <Chip 
              label={isConflictError ? 'CONFLICT' : 'OTHER ERROR'} 
              color={isConflictError ? 'error' : 'warning'}
              size="small"
            />
          </Box>
        </AccordionSummary>
        
        <AccordionDetails>
          <Box>
            <Typography variant="body2" gutterBottom>
              <strong>Error Details:</strong>
            </Typography>
            
            <Box sx={{ pl: 1, mb: 1 }}>
              <Typography variant="caption" display="block">
                Message: {error.message || 'No message'}
              </Typography>
              <Typography variant="caption" display="block">
                Code: {error.code || 'No code'}
              </Typography>
              <Typography variant="caption" display="block">
                Type: {error.type || 'No type'}
              </Typography>
              <Typography variant="caption" display="block">
                User Message: {error.userMessage || 'No user message'}
              </Typography>
            </Box>

            <Typography variant="body2" gutterBottom>
              <strong>Conflict Detection:</strong>
            </Typography>
            
            <Box sx={{ pl: 1, mb: 1 }}>
              <Typography variant="caption" display="block">
                Is Conflict Error: {isConflictError ? 'YES' : 'NO'}
              </Typography>
              <Typography variant="caption" display="block">
                Has Multiple Accounts: {multipleAccounts ? 'YES' : 'NO'}
              </Typography>
              <Typography variant="caption" display="block">
                Cached Accounts Count: {cachedAccounts.length}
              </Typography>
            </Box>

            <Typography variant="body2" gutterBottom>
              <strong>Auth State:</strong>
            </Typography>
            
            <Box sx={{ pl: 1, mb: 1 }}>
              <Typography variant="caption" display="block">
                Is Authenticated: {isAuthenticated ? 'YES' : 'NO'}
              </Typography>
              <Typography variant="caption" display="block">
                Is Loading: {isLoading ? 'YES' : 'NO'}
              </Typography>
            </Box>

            {cachedAccounts.length > 0 && (
              <>
                <Typography variant="body2" gutterBottom>
                  <strong>Cached Accounts:</strong>
                </Typography>
                <Box sx={{ pl: 1 }}>
                  {cachedAccounts.map((account, index) => (
                    <Typography key={index} variant="caption" display="block">
                      {account.name || account.username} ({account.email})
                    </Typography>
                  ))}
                </Box>
              </>
            )}
          </Box>
        </AccordionDetails>
      </Accordion>
    </Paper>
  );
};

export default AccountConflictDebugger; 