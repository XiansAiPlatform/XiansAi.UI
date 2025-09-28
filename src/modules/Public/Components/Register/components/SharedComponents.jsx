import { Typography, Box, Link as MuiLink } from '@mui/material';
import { styled } from '@mui/material/styles';


// Enhanced footer with Nordic styling
export const Footer = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(3, 7, 18, 0.95) 100%)',
  backdropFilter: 'blur(20px)',
  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
  padding: theme.spacing(3, 0),
  marginTop: 'auto',
  color: '#9ca3af',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '1px',
    background: 'linear-gradient(90deg, transparent, rgba(14, 165, 233, 0.5), transparent)',
  },
}));

const FooterContent = styled(Box)(({ theme }) => ({
  maxWidth: '1200px',
  margin: '0 auto',
  padding: theme.spacing(0, 3),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(2),
}));

export const InfoMessage = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2.5),
  marginBottom: theme.spacing(3),
  background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.08) 0%, rgba(14, 165, 233, 0.05) 100%)',
  border: '1px solid rgba(14, 165, 233, 0.2)',
  borderRadius: theme.spacing(1.5),
  textAlign: 'center',
  backdropFilter: 'blur(10px)',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '2px',
    background: 'linear-gradient(90deg, transparent, rgba(14, 165, 233, 0.8), transparent)',
    borderRadius: theme.spacing(1.5, 1.5, 0, 0),
  },
}));


// Enhanced Nordic-style footer
export function RegisterFooter() {
  return (
    <Footer>
      <FooterContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#6b7280',
              fontSize: '0.875rem',
              fontWeight: 300,
              letterSpacing: '0.05em'
            }}
          >
            Powered by
          </Typography>
          <MuiLink
            href="https://99x.io"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              color: '#0ea5e9',
              fontWeight: 500,
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.25rem 0.5rem',
              borderRadius: '6px',
              '&:hover': {
                color: '#0284c7',
                backgroundColor: 'rgba(14, 165, 233, 0.1)',
                transform: 'translateY(-1px)',
              }
            }}
          >
            <img 
              src="/images/99xlogo.svg" 
              alt="99x" 
              style={{
                height: '14px',
                width: 'auto',
                opacity: 0.9
              }}
            />
          </MuiLink>
        </Box>
        
        <Typography 
          variant="caption" 
          sx={{ 
            color: '#6b7280',
            fontSize: '0.75rem',
            fontWeight: 300,
            letterSpacing: '0.05em',
            opacity: 0.8
          }}
        >
          © 2024 XiansAI Platform. Built for developers.
        </Typography>
      </FooterContent>
    </Footer>
  );
}

// Enhanced auth info message with Nordic styling
const AuthButton = styled(MuiLink)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(1, 2),
  background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
  color: 'white',
  textDecoration: 'none',
  borderRadius: '8px',
  fontSize: '0.875rem',
  fontWeight: 500,
  letterSpacing: '0.025em',
  transition: 'all 0.2s ease',
  boxShadow: '0 2px 8px rgba(14, 165, 233, 0.25)',
  '&:hover': {
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 12px rgba(14, 165, 233, 0.35)',
    color: 'white',
  },
}));

const UserBadge = styled(Box)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(0.75, 1.5),
  background: 'rgba(255, 255, 255, 0.08)',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  borderRadius: '20px',
  fontSize: '0.875rem',
  fontWeight: 500,
  color: '#ffffff',
}));

const UserIcon = styled(Box)(({ theme }) => ({
  width: '20px',
  height: '20px',
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '0.75rem',
  fontWeight: 600,
}));

export function AuthInfoMessage({ isAuthenticated, user }) {
  return (
    <InfoMessage>
      {isAuthenticated ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#0ea5e9',
              fontWeight: 500,
              fontSize: '0.875rem',
              letterSpacing: '0.05em',
              textTransform: 'uppercase'
            }}
          >
            Authenticated
          </Typography>
          {user?.email && (
            <UserBadge>
              <UserIcon>
                {user.email.charAt(0).toUpperCase()}
              </UserIcon>
              <Typography variant="body2" sx={{ color: '#ffffff', fontWeight: 500 }}>
                {user.email}
              </Typography>
            </UserBadge>
          )}
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Typography 
            variant="h6" 
            sx={{ 
              color: '#ffffff',
              fontWeight: 300,
              fontSize: '1.1rem',
              letterSpacing: '-0.01em'
            }}
          >
            Authentication Required
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#9ca3af',
              fontSize: '0.875rem',
              lineHeight: 1.6,
              maxWidth: '400px',
              textAlign: 'center'
            }}
          >
            Please authenticate to continue with your registration process
          </Typography>
          <AuthButton href="/manager/login">
            <Box sx={{ fontSize: '1rem' }}>🔐</Box>
            Sign In to Continue
          </AuthButton>
        </Box>
      )}
    </InfoMessage>
  );
}

// Enhanced unauthenticated message with Nordic styling
const WarningMessage = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2.5),
  marginBottom: theme.spacing(3),
  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(239, 68, 68, 0.05) 100%)',
  border: '1px solid rgba(239, 68, 68, 0.2)',
  borderRadius: theme.spacing(1.5),
  textAlign: 'center',
  backdropFilter: 'blur(10px)',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '2px',
    background: 'linear-gradient(90deg, transparent, rgba(239, 68, 68, 0.6), transparent)',
    borderRadius: theme.spacing(1.5, 1.5, 0, 0),
  },
}));

export function UnauthenticatedMessage() {
  return (
    <WarningMessage>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ fontSize: '2rem', opacity: 0.8 }}>⚠️</Box>
        <Typography 
          variant="h6" 
          sx={{ 
            color: '#ef4444',
            fontWeight: 400,
            fontSize: '1rem',
            letterSpacing: '0.025em'
          }}
        >
          Access Restricted
        </Typography>
        <Typography 
          variant="body2" 
          sx={{ 
            color: '#9ca3af',
            fontSize: '0.875rem',
            lineHeight: 1.6,
            maxWidth: '300px'
          }}
        >
          Registration requires authentication. Please sign in to continue.
        </Typography>
      </Box>
    </WarningMessage>
  );
}
