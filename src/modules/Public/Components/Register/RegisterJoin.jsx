import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Box, Typography, Container, TextField, Button, Alert, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import { FiArrowLeft, FiSend, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { useRegistrationApi } from '../../services/registration-api';
import { useAuth } from '../../../Manager/auth/AuthContext';
import { useUserTenantApi } from '../../../Manager/services/user-tenant-api';
import { AuthInfoMessage, RegisterFooter, NoTenantsWarningMessage } from './components/SharedComponents';
import '../PublicLight.css';

// Light Nordic-inspired styled components
const PageContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #fafbfc 0%, #ffffff 50%, #f8fafc 100%)',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: 0,
    backgroundImage: `
      linear-gradient(rgba(66, 139, 131, 0.02) 1px, transparent 1px),
      linear-gradient(90deg, rgba(66, 139, 131, 0.02) 1px, transparent 1px)
    `,
    backgroundSize: '50px 50px',
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
  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
  border: '1px solid rgba(229, 231, 235, 0.6)',
  borderRadius: '20px',
  padding: theme.spacing(4),
  backdropFilter: 'blur(20px)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '2px',
    background: 'linear-gradient(90deg, transparent, rgba(66, 139, 131, 0.4), transparent)',
    borderRadius: '20px 20px 0 0',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    inset: '1px',
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), transparent)',
    borderRadius: '20px',
    pointerEvents: 'none',
  },
  [theme.breakpoints.down('sm')]: {
    margin: theme.spacing(0, 2),
    padding: theme.spacing(3),
  },
}));

const TitleSection = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  marginBottom: theme.spacing(4),
}));

const MainTitle = styled(Typography)(({ theme }) => ({
  fontSize: '2rem',
  fontWeight: 700,
  letterSpacing: '-0.025em',
  color: '#0f172a',
  marginBottom: theme.spacing(1),
}));

const StepIndicator = styled(Typography)(({ theme }) => ({
  fontSize: '0.875rem',
  fontWeight: 400,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: '#428b83',
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
    background: 'linear-gradient(90deg, transparent, #428b83, transparent)',
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: 400,
    color: '#0f172a',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
    transition: 'all 0.2s ease',
    '& fieldset': {
      borderColor: 'rgba(229, 231, 235, 0.8)',
      transition: 'all 0.2s ease',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(66, 139, 131, 0.4)',
    },
    '&.Mui-focused': {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      boxShadow: '0 4px 16px rgba(66, 139, 131, 0.1)',
      '& fieldset': {
        borderColor: '#428b83',
        borderWidth: '2px',
      },
    },
    '&.Mui-error fieldset': {
      borderColor: '#ef4444',
    },
    '&.Mui-disabled': {
      backgroundColor: 'rgba(248, 250, 252, 0.8)',
      '& fieldset': {
        borderColor: 'rgba(229, 231, 235, 0.5)',
      },
    },
  },
  '& .MuiInputLabel-root': {
    color: '#64748b',
    fontSize: '0.875rem',
    fontWeight: 500,
    letterSpacing: '0.025em',
    '&.Mui-focused': {
      color: '#428b83',
      fontWeight: 600,
    },
    '&.Mui-error': {
      color: '#ef4444',
    },
    '&.Mui-disabled': {
      color: '#94a3b8',
    },
  },
  '& .MuiOutlinedInput-input': {
    padding: theme.spacing(1.5),
    color: '#0f172a',
    '&::placeholder': {
      color: '#94a3b8',
      opacity: 1,
    },
    '&:disabled': {
      color: '#64748b',
    },
  },
  '& .MuiFormHelperText-root': {
    color: '#64748b',
    fontSize: '0.75rem',
    marginTop: theme.spacing(0.5),
    '&.Mui-error': {
      color: '#ef4444',
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
  position: 'relative',
  overflow: 'hidden',
  ...(buttonVariant === 'primary' ? {
    background: 'linear-gradient(135deg, #428b83 0%, #357067 100%)',
    color: 'white',
    border: 'none',
    boxShadow: '0 4px 12px rgba(66, 139, 131, 0.25)',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 20px rgba(66, 139, 131, 0.35)',
    },
    '&:disabled': {
      background: 'rgba(148, 163, 184, 0.3)',
      color: 'rgba(148, 163, 184, 0.7)',
      transform: 'none',
      boxShadow: 'none',
      cursor: 'not-allowed',
    },
  } : {
    background: 'rgba(255, 255, 255, 0.8)',
    color: '#475569',
    border: '1px solid rgba(229, 231, 235, 0.6)',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: 'rgba(66, 139, 131, 0.3)',
      color: '#428b83',
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 12px rgba(66, 139, 131, 0.1)',
    },
    '&:disabled': {
      background: 'rgba(248, 250, 252, 0.5)',
      color: 'rgba(148, 163, 184, 0.7)',
      borderColor: 'rgba(229, 231, 235, 0.4)',
      cursor: 'not-allowed',
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
    ? 'rgba(34, 197, 94, 0.08)' 
    : 'rgba(239, 68, 68, 0.08)',
  border: `1px solid ${severity === 'success' 
    ? 'rgba(34, 197, 94, 0.2)' 
    : 'rgba(239, 68, 68, 0.2)'}`,
  color: severity === 'success' ? '#16a34a' : '#dc2626',
  backdropFilter: 'blur(10px)',
  boxShadow: severity === 'success' 
    ? '0 2px 8px rgba(34, 197, 94, 0.1)' 
    : '0 2px 8px rgba(239, 68, 68, 0.1)',
  '& .MuiAlert-icon': {
    color: 'inherit',
  },
  '& .MuiAlert-message': {
    fontWeight: 500,
  },
}));


const NavLink = styled(Link)(({ theme }) => ({
  color: '#475569',
  textDecoration: 'none',
  fontSize: '0.875rem',
  fontWeight: 500,
  letterSpacing: '0.025em',
  padding: theme.spacing(1, 2),
  borderRadius: '10px',
  transition: 'all 0.2s ease',
  position: 'relative',
  '&:hover': {
    color: '#428b83',
    backgroundColor: 'rgba(66, 139, 131, 0.08)',
    transform: 'translateY(-1px)',
    boxShadow: '0 2px 8px rgba(66, 139, 131, 0.15)',
  },
}));

export default function RegisterJoin() {
  const navigate = useNavigate();
  const registrationApi = useRegistrationApi();
  const auth = useAuth();
  const { user, isAuthenticated, accessToken, getAccessTokenSilently } = auth;
  const userTenantApi = useUserTenantApi();
  
  const [hasNoTenants, setHasNoTenants] = useState(false);
  const [isCheckingTenants, setIsCheckingTenants] = useState(false);

  const [formData, setFormData] = useState({
    tenantId: '',
  });

  // Check if user has any tenants
  useEffect(() => {
    const checkUserTenants = async () => {
      if (!isAuthenticated) {
        setHasNoTenants(false);
        return;
      }

      try {
        setIsCheckingTenants(true);
        const token = await getAccessTokenSilently();
        if (!token) {
          setHasNoTenants(false);
          return;
        }

        const tenants = await userTenantApi.getCurrentUserTenant(token);
        setHasNoTenants(!tenants || tenants.length === 0);
      } catch (error) {
        console.error('Error checking user tenants:', error);
        setHasNoTenants(false);
      } finally {
        setIsCheckingTenants(false);
      }
    };

    checkUserTenants();
  }, [isAuthenticated, getAccessTokenSilently, userTenantApi]);

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
    <PageContainer className="light-theme">
      <MainContent maxWidth="md">
        {hasNoTenants && isAuthenticated && !isCheckingTenants && <NoTenantsWarningMessage />}
        <AuthInfoMessage isAuthenticated={isAuthenticated} user={user} />
        
        {isAuthenticated && (
          <Box sx={{ 
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 3,
            mb: 4,
            padding: 2,
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.8)',
            border: '1px solid rgba(229, 231, 235, 0.6)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
            '@media (max-width: 600px)': {
              gap: 2,
              padding: 1.5,
              flexWrap: 'wrap',
            },
          }}>
            <NavLink 
              to="/manager"
              sx={{
                background: 'linear-gradient(135deg, #428b83 0%, #357067 100%)',
                color: 'white !important',
                fontWeight: 600,
                padding: '8px 20px !important',
                borderRadius: '10px',
                boxShadow: '0 4px 12px rgba(66, 139, 131, 0.25)',
                border: 'none',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 20px rgba(66, 139, 131, 0.35)',
                  backgroundColor: 'transparent !important',
                  color: 'white !important',
                },
              }}
            >
              Dashboard
            </NavLink>
            <Box sx={{ 
              width: '1px', 
              height: '16px', 
              backgroundColor: 'rgba(229, 231, 235, 0.6)',
              borderRadius: '0.5px'
            }} />
            <NavLink to="/manager/logout">
              Sign Out
            </NavLink>
          </Box>
        )}
        
        {isAuthenticated && (
          <FormContainer>
            <TitleSection>
              <StepIndicator>Step 2 of 2</StepIndicator>
              <MainTitle>Join Existing Tenant</MainTitle>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#64748b',
                  fontSize: '1rem',
                  fontWeight: 400,
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
      
      
      <RegisterFooter />
    </PageContainer>
  );
}
