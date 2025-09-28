import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Box, Typography, Container, TextField, Button, MenuItem, Alert, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import { FiArrowLeft, FiHome, FiSend, FiCheck, FiExternalLink } from 'react-icons/fi';
import { useAuth } from '../../../Manager/auth/AuthContext';
import { AuthInfoMessage, UnauthenticatedMessage, RegisterFooter } from './components/SharedComponents';
import { useRegistrationApi } from '../../services/registration-api';

// Nordic-inspired styled components (reusing from RegisterJoin for consistency)
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
  maxWidth: '700px',
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

const FormGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: theme.spacing(3),
  marginBottom: theme.spacing(4),
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'rgba(255, 255, 255, 0.02) !important',
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
    // Force background for all input types
    '& input': {
      backgroundColor: 'transparent !important',
      '&:-webkit-autofill': {
        WebkitBoxShadow: '0 0 0 1000px rgba(255, 255, 255, 0.02) inset !important',
        WebkitTextFillColor: '#ffffff !important',
        backgroundColor: 'rgba(255, 255, 255, 0.02) !important',
        transition: 'background-color 5000s ease-in-out 0s',
      },
      '&:-webkit-autofill:hover': {
        WebkitBoxShadow: '0 0 0 1000px rgba(255, 255, 255, 0.02) inset !important',
        WebkitTextFillColor: '#ffffff !important',
      },
      '&:-webkit-autofill:focus': {
        WebkitBoxShadow: '0 0 0 1000px rgba(255, 255, 255, 0.02) inset !important',
        WebkitTextFillColor: '#ffffff !important',
      },
      '&:-webkit-autofill:active': {
        WebkitBoxShadow: '0 0 0 1000px rgba(255, 255, 255, 0.02) inset !important',
        WebkitTextFillColor: '#ffffff !important',
      },
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
  },
  '& .MuiOutlinedInput-input': {
    padding: theme.spacing(1.5),
    '&::placeholder': {
      color: '#64748b',
      opacity: 1,
    },
  },
  '& .MuiFormHelperText-root': {
    color: '#64748b',
    fontSize: '0.75rem',
    fontWeight: 400,
    marginTop: theme.spacing(0.5),
    marginLeft: theme.spacing(1.75),
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
  ...(buttonVariant === 'primary' ? {
    background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
    color: 'white',
    border: 'none',
    boxShadow: '0 4px 12px rgba(14, 165, 233, 0.25)',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 20px rgba(14, 165, 233, 0.35)',
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
    flexDirection: 'column',
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

export default function RegisterNew() {
  const navigate = useNavigate();
  const auth = useAuth();
  const { user, isAuthenticated, getAccessTokenSilently } = auth;
  const registrationApi = useRegistrationApi();

  const [formData, setFormData] = useState({
    tenantId: '',
    tenantName: '',
    companyUrl: '',
    companyEmail: '',
    subscription: 'Free',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdTenant, setCreatedTenant] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
  };

  const validateTenantId = (tenantId) => {
    if (!tenantId) return '';
    if (tenantId.length > 100) return 'Tenant ID must be 100 characters or less';
    if (!/^[a-zA-Z0-9._-]+$/.test(tenantId)) return 'Tenant ID can only contain letters, numbers, dots, underscores, and hyphens';
    return '';
  };

  const tenantIdError = validateTenantId(formData.tenantId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    
    // Validate form before submission
    if (tenantIdError) {
      setSubmitError('Please fix the validation errors before submitting.');
      return;
    }
    
    setIsSubmitting(true);

    try {
      // Get access token for API call
      const accessToken = await getAccessTokenSilently();
      if (!accessToken) {
        throw new Error('Failed to get access token. Please try logging in again.');
      }

      // Prepare tenant data for API call
      const tenantData = {
        tenantId: formData.tenantId.trim(),
        name: formData.tenantName.trim(),
        domain: formData.companyUrl.trim(),
        description: `${formData.tenantName} - ${formData.subscription} plan`
      };

      // Call the API to create the tenant
      const response = await registrationApi.createTenant(tenantData, accessToken);
      
      if (response.success) {
        setCreatedTenant({
          tenantId: response.tenantId,
          name: formData.tenantName
        });
        setIsSuccess(true);
      } else {
        throw new Error(response.message || 'Failed to create tenant');
      }
    } catch (error) {
      console.error('Error creating tenant:', error);
      setSubmitError(error.message || 'Failed to create tenant. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate('..');
  };

  return (
    <PageContainer>
      <MainContent maxWidth="lg">
        <AuthInfoMessage isAuthenticated={isAuthenticated} user={user} />
        
        {!isAuthenticated && <UnauthenticatedMessage />}
        
        {isAuthenticated && !isSuccess && (
          <FormContainer>
            <TitleSection>
              <StepIndicator>Step 2 of 2</StepIndicator>
              <MainTitle>Create New Tenant</MainTitle>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#94a3b8',
                  fontSize: '1rem',
                  fontWeight: 300,
                  lineHeight: 1.6
                }}
              >
                Set up your new workspace with the details below
              </Typography>
            </TitleSection>

            {submitError && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {submitError}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <FormGrid>
                <Box>
                  <StyledTextField
                    fullWidth
                    label="Tenant ID"
                    name="tenantId"
                    value={formData.tenantId}
                    onChange={handleChange}
                    placeholder="my-company"
                    required
                    variant="outlined"
                    helperText={tenantIdError || "Unique identifier for your tenant (letters, numbers, dots, underscores, and hyphens only)"}
                    error={!!tenantIdError}
                    disabled={isSubmitting}
                  />
                  <StyledTextField
                    fullWidth
                    label="Tenant Name"
                    name="tenantName"
                    value={formData.tenantName}
                    onChange={handleChange}
                    placeholder="My Company Workspace"
                    required
                    variant="outlined"
                    disabled={isSubmitting}
                  />
                  <StyledTextField
                    fullWidth
                    label="Company URL"
                    name="companyUrl"
                    type="url"
                    value={formData.companyUrl}
                    onChange={handleChange}
                    placeholder="https://mycompany.com"
                    required
                    variant="outlined"
                    disabled={isSubmitting}
                  />
                </Box>
                <Box>
                  <StyledTextField
                    fullWidth
                    label="Company Email"
                    name="companyEmail"
                    type="email"
                    value={formData.companyEmail}
                    onChange={handleChange}
                    placeholder="admin@mycompany.com"
                    required
                    variant="outlined"
                    disabled={isSubmitting}
                  />
                  <StyledTextField
                    fullWidth
                    select
                    label="Subscription Plan"
                    name="subscription"
                    value={formData.subscription}
                    onChange={handleChange}
                    variant="outlined"
                    disabled={isSubmitting}
                  >
                    <MenuItem value="Free">Free - Limited Agent Runs</MenuItem>

                  </StyledTextField>
                </Box>
              </FormGrid>
              
              <ButtonContainer>
                <ActionButton
                  variant="secondary"
                  onClick={handleBack}
                  startIcon={<FiArrowLeft />}
                  sx={{ flex: 1 }}
                  disabled={isSubmitting}
                >
                  Back
                </ActionButton>
                
                <ActionButton
                  variant="secondary"
                  component={Link}
                  to="/"
                  startIcon={<FiHome />}
                  sx={{ flex: 1 }}
                  disabled={isSubmitting}
                >
                  Home
                </ActionButton>
                
                <ActionButton
                  variant="primary"
                  type="submit"
                  startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : <FiSend />}
                  sx={{ flex: 2 }}
                  disabled={isSubmitting || !!tenantIdError}
                >
                  {isSubmitting ? 'Creating...' : 'Create Tenant'}
                </ActionButton>
              </ButtonContainer>
            </form>
          </FormContainer>
        )}

        {isAuthenticated && isSuccess && createdTenant && (
          <FormContainer>
            <TitleSection>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  width: '80px', 
                  height: '80px', 
                  borderRadius: '50%', 
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)'
                }}>
                  <FiCheck size={40} color="white" />
                </Box>
              </Box>
              <MainTitle sx={{ color: '#10b981', mb: 2 }}>
                Tenant Created Successfully!
              </MainTitle>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: '#94a3b8',
                  fontSize: '1.125rem',
                  fontWeight: 300,
                  lineHeight: 1.6,
                  textAlign: 'center',
                  mb: 3
                }}
              >
                Your tenant <strong style={{ color: '#0ea5e9' }}>{createdTenant.name}</strong> has been created successfully.
                You have been assigned as the tenant administrator.
              </Typography>
            </TitleSection>

            <Alert severity="success" sx={{ mb: 4 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Tenant ID:</strong> {createdTenant.tenantId}
              </Typography>
              <Typography variant="body2">
                You can now access your dashboard and start managing your tenant.
              </Typography>
            </Alert>
            
            <ButtonContainer>
              <ActionButton
                variant="secondary"
                component={Link}
                to="/"
                startIcon={<FiHome />}
                sx={{ flex: 1 }}
              >
                Home
              </ActionButton>
              
              <ActionButton
                variant="primary"
                component={Link}
                to="/manager"
                startIcon={<FiExternalLink />}
                sx={{ flex: 2 }}
              >
                Access Dashboard
              </ActionButton>
            </ButtonContainer>
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
