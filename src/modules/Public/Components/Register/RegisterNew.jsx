import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Box, Typography, Container, TextField, Button, Alert, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import { FiArrowLeft, FiSend, FiCheck, FiExternalLink } from 'react-icons/fi';
import { useAuth } from '../../../Manager/auth/AuthContext';
import { useUserTenantApi } from '../../../Manager/services/user-tenant-api';
import { AuthInfoMessage, RegisterFooter, NoTenantsWarningMessage } from './components/SharedComponents';
import '../PublicLight.css';
import { useRegistrationApi } from '../../services/registration-api';

// Nordic-inspired styled components (reusing from RegisterJoin for consistency)
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
  maxWidth: '700px',
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

const FormGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: theme.spacing(3),
  marginBottom: theme.spacing(4),
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(2),
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
    // Fix autofill for light theme
    '& input': {
      color: '#0f172a',
      '&:-webkit-autofill': {
        WebkitBoxShadow: '0 0 0 1000px rgba(255, 255, 255, 0.9) inset !important',
        WebkitTextFillColor: '#0f172a !important',
        transition: 'background-color 5000s ease-in-out 0s',
      },
      '&:-webkit-autofill:hover': {
        WebkitBoxShadow: '0 0 0 1000px rgba(255, 255, 255, 0.9) inset !important',
        WebkitTextFillColor: '#0f172a !important',
      },
      '&:-webkit-autofill:focus': {
        WebkitBoxShadow: '0 0 0 1000px rgba(255, 255, 255, 0.95) inset !important',
        WebkitTextFillColor: '#0f172a !important',
      },
      '&:-webkit-autofill:active': {
        WebkitBoxShadow: '0 0 0 1000px rgba(255, 255, 255, 0.9) inset !important',
        WebkitTextFillColor: '#0f172a !important',
      },
      '&:disabled': {
        color: '#64748b',
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
    flexDirection: 'column',
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

export default function RegisterNew() {
  const navigate = useNavigate();
  const auth = useAuth();
  const { user, isAuthenticated, getAccessTokenSilently } = auth;
  const registrationApi = useRegistrationApi();
  const userTenantApi = useUserTenantApi();
  
  const [hasNoTenants, setHasNoTenants] = useState(false);
  const [isCheckingTenants, setIsCheckingTenants] = useState(false);

  const [formData, setFormData] = useState({
    tenantId: '',
    emailDomain: '',
    companyEmail: '',
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

  const validateEmail = (email) => {
    if (!email) return '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return '';
  };

  const validateEmailDomain = (domain) => {
    if (!domain) return ''; // Optional field, so no error if empty
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.[a-zA-Z]{2,}$/;
    if (!domainRegex.test(domain)) return 'Please enter a valid domain (e.g., company.com)';
    return '';
  };

  const tenantIdError = validateTenantId(formData.tenantId);
  const emailError = validateEmail(formData.companyEmail);
  const emailDomainError = validateEmailDomain(formData.emailDomain);

  // Check if form is valid
  const isFormValid = 
    formData.tenantId.trim() && 
    formData.companyEmail.trim() && 
    !tenantIdError && 
    !emailError && 
    !emailDomainError;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    
    // Validate form before submission
    if (!isFormValid) {
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
        name: formData.tenantId.trim(),
        domain: formData.emailDomain.trim() || '',
        description: formData.tenantId.trim()
      };

      // Call the API to create the tenant
      const response = await registrationApi.createTenant(tenantData, accessToken);
      
      if (response.success) {
        setCreatedTenant({
          tenantId: response.tenantId,
          name: formData.tenantId.trim()
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
    <PageContainer className="light-theme">
      <MainContent maxWidth="lg">
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
        
        {isAuthenticated && !isSuccess && (
          <FormContainer>
            <TitleSection>
              <StepIndicator>Step 2 of 2</StepIndicator>
              <MainTitle>Create New Tenant</MainTitle>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#64748b',
                  fontSize: '1rem',
                  fontWeight: 400,
                  lineHeight: 1.6
                }}
              >
                Set up your new workspace with the details below
              </Typography>
            </TitleSection>

            {submitError && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3,
                  borderRadius: '12px',
                  backgroundColor: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  color: '#dc2626',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 2px 8px rgba(239, 68, 68, 0.1)',
                  '& .MuiAlert-icon': {
                    color: 'inherit',
                  },
                  '& .MuiAlert-message': {
                    fontWeight: 500,
                  },
                }}
              >
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
                    label="Email Domain"
                    name="emailDomain"
                    type="text"
                    value={formData.emailDomain}
                    onChange={handleChange}
                    placeholder="company.com"
                    variant="outlined"
                    helperText={emailDomainError || "Enter your company's email domain (optional)"}
                    error={!!emailDomainError}
                    disabled={isSubmitting}
                  />
                  
                  {formData.emailDomain.trim() && (
                    <Alert 
                      severity="warning" 
                      sx={{ 
                        mt: 2,
                        borderRadius: '12px',
                        backgroundColor: 'rgba(245, 158, 11, 0.08)',
                        border: '1px solid rgba(245, 158, 11, 0.2)',
                        color: '#d97706',
                        backdropFilter: 'blur(10px)',
                        boxShadow: '0 2px 8px rgba(245, 158, 11, 0.1)',
                        '& .MuiAlert-icon': {
                          color: 'inherit',
                        },
                        '& .MuiAlert-message': {
                          fontWeight: 500,
                          fontSize: '0.875rem',
                          lineHeight: 1.5,
                        },
                      }}
                    >
                      Adding an email domain will allow End Users with this email domain to gain access to the 'Agent Studio' automatically. If you want explicit access control keep this empty.
                    </Alert>
                  )}
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
                    helperText={emailError || "Enter your company's contact email"}
                    error={!!emailError}
                    disabled={isSubmitting}
                  />
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
                  variant="primary"
                  type="submit"
                  startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : <FiSend />}
                  sx={{ flex: 2 }}
                  disabled={isSubmitting || !isFormValid}
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
                  color: '#64748b',
                  fontSize: '1.125rem',
                  fontWeight: 400,
                  lineHeight: 1.6,
                  textAlign: 'center',
                  mb: 3
                }}
              >
                Your tenant <strong style={{ color: '#428b83' }}>{createdTenant.name}</strong> has been created successfully.
                You have been assigned as the tenant administrator. <strong style={{ color: '#f59e0b' }}>Please contact your system administrator to enable the tenant.</strong>
              </Typography>
            </TitleSection>

            <Alert 
              severity="success" 
              sx={{ 
                mb: 4,
                borderRadius: '12px',
                backgroundColor: 'rgba(34, 197, 94, 0.08)',
                border: '1px solid rgba(34, 197, 94, 0.2)',
                color: '#16a34a',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 2px 8px rgba(34, 197, 94, 0.1)',
                '& .MuiAlert-icon': {
                  color: 'inherit',
                },
                '& .MuiAlert-message': {
                  fontWeight: 500,
                },
              }}
            >
              <Typography variant="body2" sx={{ mb: 1, color: 'inherit' }}>
                <strong>Tenant ID:</strong> {createdTenant.tenantId}
              </Typography>
              <Typography variant="body2" sx={{ color: '#f59e0b', fontWeight: 600 }}>
                <strong>Please contact your system administrator to enable the tenant.</strong>
              </Typography>
            </Alert>
            
            <ButtonContainer>
              <ActionButton
                variant="primary"
                onClick={() => window.location.href = `/manager/definitions/templates?org=${createdTenant.tenantId}`}
                startIcon={<FiExternalLink />}
                sx={{ flex: 1 }}
              >
                Try Accessing Dashboard
              </ActionButton>
            </ButtonContainer>
          </FormContainer>
        )}
      </MainContent>
      
      
      <RegisterFooter />
    </PageContainer>
  );
}
