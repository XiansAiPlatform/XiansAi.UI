import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Paper, 
  Typography, 
  Button, 
  Box,
  Stack
} from '@mui/material';
import { 
  ErrorOutline, 
  GroupAdd as GroupAddIcon,
  Business as BusinessIcon 
} from '@mui/icons-material';
import { ROUTES } from '../../../../routes/routeConstants';

const NoOrganizationAvailable = () => {
  const navigate = useNavigate();

  const handleRequestAccess = () => {
    navigate(ROUTES.REGISTER);
  };

  return (
    <Box 
      sx={{ 
        width: '100%',
        pt: 8,
        pb: 4,
        px: 2
      }}
    >
      <Container maxWidth="md">
        <Paper 
          elevation={3} 
          sx={{ 
            p: { xs: 4, md: 6 }, 
            textAlign: 'center',
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}
        >
        <Box sx={{ mb: 3 }}>
          <ErrorOutline 
            color="warning" 
            sx={{ 
              fontSize: 80, 
              mb: 2,
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
            }} 
          />
        </Box>
        
        <Typography 
          variant="h4" 
          gutterBottom
          sx={{ 
            fontWeight: 600,
            color: 'text.primary',
            mb: 2
          }}
        >
          No Organization Available
        </Typography>
        
        <Typography 
          variant="body1" 
          color="text.secondary"
          sx={{ 
            mb: 4,
            lineHeight: 1.6,
            fontSize: '1.1rem'
          }}
        >
          You're not currently assigned to any organization. To access the application, 
          you'll need to request to join an organization or create a new one.
        </Typography>

        <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }} justifyContent="center">
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<GroupAddIcon />}
            onClick={handleRequestAccess}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 500,
              boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
              '&:hover': {
                boxShadow: '0 6px 16px rgba(25, 118, 210, 0.4)',
                transform: 'translateY(-1px)'
              },
              transition: 'all 0.2s ease-in-out'
            }}
          >
            Request Organization Access
          </Button>
        </Stack>

        <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
          <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
            <BusinessIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              Need help? Contact your system administrator
            </Typography>
          </Stack>
         </Box>
       </Paper>
     </Container>
   </Box>
   );
 };

export default NoOrganizationAvailable;
