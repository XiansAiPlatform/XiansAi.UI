import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Box, Typography, Container } from '@mui/material';
import { styled } from '@mui/material/styles';
import { FiPlusCircle, FiUsers, FiArrowRight } from 'react-icons/fi';
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
    maskImage: 'radial-gradient(circle at center, black, transparent 80%)',
    pointerEvents: 'none',
    opacity: 0.6,
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

const TitleSection = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  marginBottom: theme.spacing(6),
}));

const MainTitle = styled(Typography)(({ theme }) => ({
  fontSize: '2.5rem',
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
  marginBottom: theme.spacing(1),
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

const SelectionGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
  gap: theme.spacing(3),
  maxWidth: '800px',
  margin: '0 auto',
  width: '100%',
}));

const SelectionCard = styled(Box)(({ theme, disabled }) => ({
  background: disabled 
    ? 'rgba(248, 250, 252, 0.5)'
    : '#ffffff',
  border: '2px solid rgba(229, 231, 235, 0.8)',
  borderRadius: '20px',
  padding: theme.spacing(4),
  cursor: disabled ? 'not-allowed' : 'pointer',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  opacity: disabled ? 0.5 : 1,
  backdropFilter: 'blur(10px)',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(135deg, rgba(66, 139, 131, 0.05), transparent 50%)',
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },
  '&:hover': disabled ? {} : {
    transform: 'translateY(-4px)',
    borderColor: 'rgba(66, 139, 131, 0.3)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(66, 139, 131, 0.1)',
    '&::before': {
      opacity: 1,
    },
    '& .selection-icon': {
      transform: 'scale(1.1)',
      color: '#428b83',
    },
    '& .selection-arrow': {
      transform: 'translateX(4px)',
      opacity: 1,
    },
  },
}));

const SelectionIcon = styled(Box)(({ theme }) => ({
  fontSize: '3rem',
  color: '#475569',
  marginBottom: theme.spacing(3),
  transition: 'all 0.3s ease',
  display: 'flex',
  justifyContent: 'center',
}));

const SelectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.5rem',
  fontWeight: 600,
  letterSpacing: '-0.015em',
  color: '#0f172a',
  marginBottom: theme.spacing(2),
  textAlign: 'center',
}));

const SelectionDescription = styled(Typography)(({ theme }) => ({
  fontSize: '1rem',
  fontWeight: 400,
  lineHeight: 1.6,
  color: '#334155',
  textAlign: 'center',
  marginBottom: theme.spacing(3),
}));

const SelectionArrow = styled(FiArrowRight)(({ theme }) => ({
  fontSize: '1.25rem',
  color: '#428b83',
  opacity: 0,
  transition: 'all 0.3s ease',
  marginLeft: 'auto',
  marginRight: 'auto',
  display: 'block',
}));

const NavigationFooter = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: theme.spacing(3),
  padding: theme.spacing(3),
  borderTop: '1px solid rgba(229, 231, 235, 0.3)',
  background: 'rgba(250, 251, 252, 0.95)',
  backdropFilter: 'blur(20px)',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '1px',
    background: 'linear-gradient(90deg, transparent, rgba(66, 139, 131, 0.3), transparent)',
  },
  [theme.breakpoints.down('sm')]: {
    gap: theme.spacing(2),
    padding: theme.spacing(2),
    flexWrap: 'wrap',
  },
}));

const NavLink = styled(Link)(({ theme }) => ({
  color: '#475569 !important',
  textDecoration: 'none !important',
  fontSize: '0.875rem',
  fontWeight: 500,
  letterSpacing: '0.025em',
  padding: theme.spacing(1, 2),
  borderRadius: '10px',
  transition: 'all 0.2s ease',
  position: 'relative',
  display: 'inline-block',
  '&:hover, &:focus': {
    color: '#428b83 !important',
    backgroundColor: 'rgba(66, 139, 131, 0.08) !important',
    transform: 'translateY(-1px)',
    boxShadow: '0 2px 8px rgba(66, 139, 131, 0.15)',
    textDecoration: 'none !important',
  },
  '&:visited': {
    color: '#475569 !important',
  },
  '&:active': {
    color: '#428b83 !important',
  },
}));

export default function RegisterSelection() {
  const navigate = useNavigate();
  const auth = useAuth();
  const { user, isAuthenticated, getAccessTokenSilently } = auth;
  const userTenantApi = useUserTenantApi();
  
  const [hasNoTenants, setHasNoTenants] = useState(false);
  const [isCheckingTenants, setIsCheckingTenants] = useState(false);

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

  const handleSelection = (joinExisting) => {
    if (joinExisting) {
      navigate('join');
    } else {
      navigate('new');
    }
  };

  return (
    <PageContainer className="light-theme">
      <MainContent maxWidth="lg">
        {hasNoTenants && isAuthenticated && !isCheckingTenants && <NoTenantsWarningMessage />}
        <AuthInfoMessage isAuthenticated={isAuthenticated} user={user} />
        
        <TitleSection>
          <StepIndicator>Step 1 of 2</StepIndicator>
          <MainTitle>
            Choose Your Path
          </MainTitle>
          <Typography 
            variant="body1" 
            sx={{ 
              color: '#94a3b8',
              fontSize: '1.125rem',
              fontWeight: 300,
              lineHeight: 1.6,
              maxWidth: '500px',
              margin: '0 auto'
            }}
          >
            Select how you'd like to get started with XiansAI
          </Typography>
        </TitleSection>
        
        <SelectionGrid>
          <SelectionCard 
            disabled={!isAuthenticated}
            onClick={() => isAuthenticated && handleSelection(true)}
          >
            <SelectionIcon className="selection-icon">
              <FiUsers />
            </SelectionIcon>
            <SelectionTitle>Join Existing Tenant</SelectionTitle>
            <SelectionDescription>
              Connect with your team by joining an existing tenant. Admin approval required for secure access.
            </SelectionDescription>
            {isAuthenticated && <SelectionArrow className="selection-arrow" />}
          </SelectionCard>
          
          <SelectionCard 
            disabled={!isAuthenticated}
            onClick={() => isAuthenticated && handleSelection(false)}
          >
            <SelectionIcon className="selection-icon">
              <FiPlusCircle />
            </SelectionIcon>
            <SelectionTitle>Create New Tenant</SelectionTitle>
            <SelectionDescription>
              Start fresh with a new tenant workspace. Perfect for new organizations or independent projects.
            </SelectionDescription>
            {isAuthenticated && <SelectionArrow className="selection-arrow" />}
          </SelectionCard>
        </SelectionGrid>
      </MainContent>
      
      {isAuthenticated && (
        <NavigationFooter>
          <NavLink to="/">
            Home
          </NavLink>
          <Box sx={{ 
            width: '1px', 
            height: '16px', 
            backgroundColor: 'rgba(229, 231, 235, 0.6)',
            borderRadius: '0.5px'
          }} />
          <NavLink to="/manager">
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
        </NavigationFooter>
      )}
      
      <RegisterFooter />
    </PageContainer>
  );
}
