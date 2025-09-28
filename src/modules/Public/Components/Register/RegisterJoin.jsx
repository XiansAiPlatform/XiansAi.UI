import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Box, Typography, Container, TextField, Button, Alert, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import { FiArrowLeft, FiSend, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { useRegistrationApi } from '../../services/registration-api';
import { useAuth } from '../../../Manager/auth/AuthContext';
import { AuthInfoMessage, UnauthenticatedMessage, RegisterFooter } from './components/SharedComponents';

// Nordic-inspired styled components
const PageContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: 0,
    backgroundImage: `
      linear-gradient(rgba(14, 165, 233, 0.02) 1px, transparent 1px),
      linear-gradient(90deg, rgba(14, 165, 233, 0.02) 1px, transparent 1px)
    `,
    backgroundSize: '60px 60px',
    maskImage: 'radial-gradient(circle at center, black, transparent 70%)',
    pointerEvents: 'none',
  },
}));

const MainContent = styled(Container)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  padding: theme.spacing(4, 3),
  position: 'relative',
  zIndex: 1,
}));

const FormContainer = styled(Box)(({ theme }) => ({
  maxWidth: '500px',
  margin: '0 auto',
  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '20px',
  padding: theme.spacing(4),
  backdropFilter: 'blur(20px)',
  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
}));

const TitleSection = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  marginBottom: theme.spacing(4),
}));

const MainTitle = styled(Typography)(({ theme }) => ({
  fontSize: '2rem',
  fontWeight: 300,
  letterSpacing: '-0.025em',
  color: '#ffffff',
  marginBottom: theme.spacing(1),
}));

const StepIndicator = styled(Typography)(({ theme }) => ({
  fontSize: '0.875rem',
  fontWeight: 400,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: '#0ea5e9',
  marginBottom: theme.spacing(2),
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: '-8px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '40px',
    height: '2px',
    background: 'linear-gradient(90deg, transparent, #0ea5e9, transparent)',
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: 300,
    color: '#ffffff',
    '& fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.12)',
      transition: 'all 0.2s ease',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(14, 165, 233, 0.4)',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#0ea5e9',
      borderWidth: '2px',
    },
    '&.Mui-error fieldset': {
      borderColor: '#ef4444',
    },
  },
  '& .MuiInputLabel-root': {
    color: '#94a3b8',
    fontSize: '0.875rem',
    fontWeight: 400,
    letterSpacing: '0.025em',
    '&.Mui-focused': {
      color: '#0ea5e9',
    },
    '&.Mui-error': {
      color: '#ef4444',
    },
  },
  '& .MuiOutlinedInput-input': {
    padding: theme.spacing(1.5),
    '&::placeholder': {
      color: '#64748b',
      opacity: 1,
    },
  },
}));

const ActionButton = styled(Button)(({ theme, variant: buttonVariant }) => ({
  borderRadius: '12px',
  padding: theme.spacing(1.25, 3),
  fontSize: '0.875rem',
  fontWeight: 500,
  letterSpacing: '0.025em',
  textTransform: 'none',
  transition: 'all 0.2s ease',
  minHeight: '48px',
  ...(buttonVariant === 'primary' ? {
    background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
    color: 'white',
    border: 'none',
    boxShadow: '0 4px 12px rgba(14, 165, 233, 0.25)',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 20px rgba(14, 165, 233, 0.35)',
    },
    '&:disabled': {
      background: 'rgba(255, 255, 255, 0.1)',
      color: 'rgba(255, 255, 255, 0.5)',
      transform: 'none',
      boxShadow: 'none',
    },
  } : {
    background: 'transparent',
    color: '#94a3b8',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderColor: 'rgba(255, 255, 255, 0.2)',
      color: '#ffffff',
      transform: 'translateY(-1px)',
    },
  }),
}));

const ButtonContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  marginTop: theme.spacing(3),
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column-reverse',
  },
}));

const StatusAlert = styled(Alert)(({ theme, severity }) => ({
  borderRadius: '12px',
  marginBottom: theme.spacing(3),
  backgroundColor: severity === 'success' 
    ? 'rgba(34, 197, 94, 0.1)' 
    : 'rgba(239, 68, 68, 0.1)',
  border: `1px solid ${severity === 'success' 
    ? 'rgba(34, 197, 94, 0.2)' 
    : 'rgba(239, 68, 68, 0.2)'}`,
  color: severity === 'success' ? '#22c55e' : '#ef4444',
  '& .MuiAlert-icon': {
    color: 'inherit',
  },
}));

const NavigationFooter = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: theme.spacing(3),
  padding: theme.spacing(3),
  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
  background: 'rgba(15, 23, 42, 0.8)',
  backdropFilter: 'blur(20px)',
}));

const NavLink = styled(Link)(({ theme }) => ({
  color: '#64748b',
  textDecoration: 'none',
  fontSize: '0.875rem',
  fontWeight: 400,
  letterSpacing: '0.025em',
  padding: theme.spacing(1, 2),
  borderRadius: '8px',
  transition: 'all 0.2s ease',
  '&:hover': {
    color: '#0ea5e9',
    backgroundColor: 'rgba(14, 165, 233, 0.1)',
    transform: 'translateY(-1px)',
  },
}));

export default function RegisterJoin() {
  const navigate = useNavigate();
  const registrationApi = useRegistrationApi();
  const auth = useAuth();
  const { user, isAuthenticated, accessToken, getAccessTokenSilently } = auth;

  const [formData, setFormData] = useState({
    tenantId: '',
  });

  const [tenantError, setTenantError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear errors when user types
    if (name === 'tenantId') {
      setTenantError('');
      setSuccessMessage('');
    }
  };

  const handleTenantJoinSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.tenantId.trim()) {
      setTenantError('Tenant ID is required');
      return;
    }
    
    setIsLoading(true);
    try {
      // Get fresh access token
      let token = accessToken;
      if (!token) {
        token = await getAccessTokenSilently();
      }
      
      if (!token) {
        setTenantError('Authentication token not available. Please try logging in again.');
        return;
      }

      const response = await registrationApi.joinTenant(formData.tenantId.trim(), token);
      
      if (response.success) {
        setTenantError('');
        setSuccessMessage(response.message);
        
        // If already approved, redirect to login
        if (response.status === 'approved') {
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        }
      } else {
        setTenantError(response.message || 'Failed to submit tenant join request');
      }
    } catch (error) {
      console.error('Tenant join error:', error);
      setTenantError(error.message || 'Failed to submit tenant join request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate('..');
  };

  return (
    <PageContainer>
      <MainContent maxWidth="md">
        <AuthInfoMessage isAuthenticated={isAuthenticated} user={user} />
        
        {!isAuthenticated && <UnauthenticatedMessage />}
        
        {isAuthenticated && (
          <FormContainer>
            <TitleSection>
              <StepIndicator>Step 2 of 2</StepIndicator>
              <MainTitle>Join Existing Tenant</MainTitle>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#94a3b8',
                  fontSize: '1rem',
                  fontWeight: 300,
                  lineHeight: 1.6
                }}
              >
                Enter the tenant ID provided by your team administrator
              </Typography>
            </TitleSection>

            <form onSubmit={handleTenantJoinSubmit}>
              {tenantError && (
                <StatusAlert severity="error" icon={<FiAlertCircle />}>
                  {tenantError}
                </StatusAlert>
              )}
              
              {successMessage && (
                <StatusAlert severity="success" icon={<FiCheck />}>
                  {successMessage}
                  {successMessage.includes('approved') && (
                    <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
                      Redirecting to login...
                    </Typography>
                  )}
                </StatusAlert>
              )}

              <StyledTextField
                fullWidth
                label="Tenant ID"
                name="tenantId"
                value={formData.tenantId}
                onChange={handleChange}
                placeholder="e.g., company-workspace-2024"
                required
                error={!!tenantError}
                disabled={isLoading || !!successMessage}
                variant="outlined"
              />
              
              <ButtonContainer>
                <ActionButton
                  variant="secondary"
                  onClick={handleBack}
                  disabled={isLoading}
                  startIcon={<FiArrowLeft />}
                  sx={{ flex: 1 }}
                >
                  Back
                </ActionButton>
                
                <ActionButton
                  variant="primary"
                  type="submit"
                  disabled={isLoading || !!successMessage || !formData.tenantId.trim()}
                  startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : <FiSend />}
                  sx={{ flex: 2 }}
                >
                  {isLoading ? 'Submitting Request...' : 'Request to Join'}
                </ActionButton>
              </ButtonContainer>
            </form>
          </FormContainer>
        )}
      </MainContent>
      
      {isAuthenticated && (
        <NavigationFooter>
          <NavLink to="/manager">
            Dashboard
          </NavLink>
          <Box sx={{ width: '1px', height: '16px', backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
          <NavLink to="/manager/logout">
            Sign Out
          </NavLink>
        </NavigationFooter>
      )}
      
      <RegisterFooter />
    </PageContainer>
  );
}
