import { useNavigate, Link } from 'react-router-dom';
import { Box, Typography, Container } from '@mui/material';
import { styled } from '@mui/material/styles';
import { FiPlusCircle, FiUsers, FiArrowRight } from 'react-icons/fi';
import { useAuth } from '../../../Manager/auth/AuthContext';
import { AuthInfoMessage, RegisterFooter } from './components/SharedComponents';

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

const TitleSection = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  marginBottom: theme.spacing(6),
}));

const MainTitle = styled(Typography)(({ theme }) => ({
  fontSize: '2.5rem',
  fontWeight: 300,
  letterSpacing: '-0.025em',
  color: '#ffffff',
  marginBottom: theme.spacing(1),
  background: 'linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%)',
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
}));

const StepIndicator = styled(Typography)(({ theme }) => ({
  fontSize: '0.875rem',
  fontWeight: 400,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: '#0ea5e9',
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
    background: 'linear-gradient(90deg, transparent, #0ea5e9, transparent)',
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
    ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0.01) 100%)'
    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '16px',
  padding: theme.spacing(4),
  cursor: disabled ? 'not-allowed' : 'pointer',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  opacity: disabled ? 0.5 : 1,
  backdropFilter: 'blur(10px)',
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.1), transparent 50%)',
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },
  '&:hover': disabled ? {} : {
    transform: 'translateY(-4px)',
    borderColor: 'rgba(14, 165, 233, 0.3)',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(14, 165, 233, 0.1)',
    '&::before': {
      opacity: 1,
    },
    '& .selection-icon': {
      transform: 'scale(1.1)',
      color: '#0ea5e9',
    },
    '& .selection-arrow': {
      transform: 'translateX(4px)',
      opacity: 1,
    },
  },
}));

const SelectionIcon = styled(Box)(({ theme }) => ({
  fontSize: '3rem',
  color: '#64748b',
  marginBottom: theme.spacing(3),
  transition: 'all 0.3s ease',
  display: 'flex',
  justifyContent: 'center',
}));

const SelectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.5rem',
  fontWeight: 500,
  letterSpacing: '-0.01em',
  color: '#ffffff',
  marginBottom: theme.spacing(2),
  textAlign: 'center',
}));

const SelectionDescription = styled(Typography)(({ theme }) => ({
  fontSize: '1rem',
  fontWeight: 300,
  lineHeight: 1.6,
  color: '#94a3b8',
  textAlign: 'center',
  marginBottom: theme.spacing(3),
}));

const SelectionArrow = styled(FiArrowRight)(({ theme }) => ({
  fontSize: '1.25rem',
  color: '#0ea5e9',
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

export default function RegisterSelection() {
  const navigate = useNavigate();
  const auth = useAuth();
  const { user, isAuthenticated } = auth;

  const handleSelection = (joinExisting) => {
    if (joinExisting) {
      navigate('join');
    } else {
      navigate('new');
    }
  };

  return (
    <PageContainer>
      <MainContent maxWidth="lg">
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
