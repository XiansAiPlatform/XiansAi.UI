import { Typography, Box, Link as MuiLink } from '@mui/material';
import { styled } from '@mui/material/styles';


// Enhanced footer with Light Nordic styling
export const Footer = styled(Box)(({ theme }) => ({
  background: 'rgba(250, 251, 252, 0.95)',
  backdropFilter: 'blur(20px)',
  borderTop: '1px solid rgba(229, 231, 235, 0.8)',
  padding: theme.spacing(3, 0),
  marginTop: 'auto',
  color: '#64748b',
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
  padding: theme.spacing(3),
  marginBottom: theme.spacing(4),
  background: 'linear-gradient(135deg, rgba(217, 231, 230, 0.4) 0%, rgba(217, 231, 230, 0.15) 100%)',
  border: '1px solid rgba(66, 139, 131, 0.2)',
  borderRadius: theme.spacing(2),
  textAlign: 'center',
  backdropFilter: 'blur(15px)',
  position: 'relative',
  boxShadow: '0 4px 16px rgba(66, 139, 131, 0.08)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '2px',
    background: 'linear-gradient(90deg, transparent, rgba(66, 139, 131, 0.6), transparent)',
    borderRadius: theme.spacing(2, 2, 0, 0),
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    inset: '1px',
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), transparent)',
    borderRadius: theme.spacing(2),
    pointerEvents: 'none',
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
              color: '#64748b',
              fontSize: '0.875rem',
              fontWeight: 400,
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
              color: '#428b83',
              fontWeight: 500,
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.25rem 0.5rem',
              borderRadius: '6px',
              '&:hover': {
                color: '#357067',
                backgroundColor: 'rgba(66, 139, 131, 0.1)',
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
            color: '#64748b',
            fontSize: '0.75rem',
            fontWeight: 400,
            letterSpacing: '0.05em'
          }}
        >
          © {new Date().getFullYear()} XiansAI Platform.
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
  background: 'linear-gradient(135deg, #428b83 0%, #357067 100%)',
  color: 'white',
  textDecoration: 'none',
  borderRadius: '8px',
  fontSize: '0.875rem',
  fontWeight: 500,
  letterSpacing: '0.025em',
  transition: 'all 0.2s ease',
  boxShadow: '0 2px 8px rgba(66, 139, 131, 0.25)',
  '&:hover': {
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 12px rgba(66, 139, 131, 0.35)',
    color: 'white',
  },
}));

const UserBadge = styled(Box)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(0.75, 1.5),
  background: 'rgba(66, 139, 131, 0.08)',
  border: '1px solid rgba(66, 139, 131, 0.2)',
  borderRadius: '20px',
  fontSize: '0.875rem',
  fontWeight: 500,
  color: '#0f172a',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 2px 8px rgba(66, 139, 131, 0.1)',
  transition: 'all 0.2s ease',
  maxWidth: '280px',
  overflow: 'hidden',
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.8rem',
    padding: theme.spacing(0.5, 1.25),
    maxWidth: '240px',
  },
}));

const UserIcon = styled(Box)(({ theme }) => ({
  width: '24px',
  height: '24px',
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #428b83 0%, #357067 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '0.75rem',
  fontWeight: 600,
  color: 'white',
  boxShadow: '0 2px 4px rgba(66, 139, 131, 0.3)',
}));

export function AuthInfoMessage({ isAuthenticated, user }) {
  return (
    <InfoMessage>
      {isAuthenticated ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#428b83',
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
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#0f172a', 
                  fontWeight: 500,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '200px'
                }}
              >
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
              color: '#0f172a',
              fontWeight: 600,
              fontSize: '1.1rem',
              letterSpacing: '-0.01em'
            }}
          >
            Authentication Required
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#334155',
              fontSize: '0.875rem',
              lineHeight: 1.6,
              maxWidth: '400px',
              textAlign: 'center'
            }}
          >
            Please authenticate to continue with your registration process
          </Typography>
          <AuthButton href="/manager">
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
            color: '#64748b',
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

// Enhanced styled components for NoTenantsWarningMessage
const NoTenantsContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2.5, 3),
  marginBottom: theme.spacing(3),
  background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.08) 0%, rgba(251, 191, 36, 0.03) 100%)',
  border: '2px solid rgba(251, 191, 36, 0.25)',
  borderRadius: theme.spacing(2),
  backdropFilter: 'blur(15px)',
  position: 'relative',
  boxShadow: '0 4px 16px rgba(251, 191, 36, 0.12)',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '2px',
    background: 'linear-gradient(90deg, transparent, rgba(251, 191, 36, 0.8), transparent)',
    borderRadius: theme.spacing(2, 2, 0, 0),
  },
}));

const IconBadge = styled(Box)(({ theme }) => ({
  width: '36px',
  height: '36px',
  borderRadius: '50%',
  background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(251, 191, 36, 0.05) 100%)',
  border: '2px solid rgba(251, 191, 36, 0.3)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '1.25rem',
  marginBottom: theme.spacing(1),
  boxShadow: '0 2px 8px rgba(251, 191, 36, 0.15)',
  position: 'relative',
  zIndex: 1,
}));

const OptionCard = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1.5, 2),
  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)',
  border: '1.5px solid rgba(251, 191, 36, 0.2)',
  borderRadius: theme.spacing(1.25),
  display: 'flex',
  gap: theme.spacing(1.5),
  alignItems: 'flex-start',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
  transition: 'all 0.2s ease',
  position: 'relative',
  zIndex: 1,
  '&:hover': {
    transform: 'translateX(4px)',
    borderColor: 'rgba(251, 191, 36, 0.4)',
    boxShadow: '0 4px 12px rgba(251, 191, 36, 0.15)',
  },
}));

const OptionNumber = styled(Box)(({ theme }) => ({
  width: '20px',
  height: '20px',
  minWidth: '20px',
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '0.7rem',
  fontWeight: 700,
  boxShadow: '0 2px 4px rgba(251, 191, 36, 0.3)',
  marginTop: '1px',
}));

// Warning message for users with no enabled tenants
export function NoTenantsWarningMessage() {
  return (
    <NoTenantsContainer>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, position: 'relative', zIndex: 1 }}>
        <IconBadge>
          🏢
        </IconBadge>
        
        <Box sx={{ flex: 1 }}>
          <Typography 
            variant="h6" 
            sx={{ 
              color: '#92400e',
              fontWeight: 700,
              fontSize: '1.1rem',
              letterSpacing: '-0.01em',
              marginBottom: 0.75,
            }}
          >
            No Enabled Tenant Found
          </Typography>
          
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#78716c',
              fontSize: '0.875rem',
              lineHeight: 1.6,
              marginBottom: 1.5,
              fontWeight: 400
            }}
          >
            You don't currently belong to an enabled tenant. Please choose one of the following options:
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 1.25,
          }}>
            <OptionCard>
              <OptionNumber>1</OptionNumber>
              <Box sx={{ flex: 1 }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#1f2937',
                    fontSize: '0.875rem',
                    lineHeight: 1.6,
                    fontWeight: 400
                  }}
                >
                  Contact your <strong style={{ color: '#92400e', fontWeight: 600 }}>existing tenant's administrator</strong> and request to be added to the tenant
                </Typography>
              </Box>
            </OptionCard>
            
            <OptionCard>
              <OptionNumber>2</OptionNumber>
              <Box sx={{ flex: 1 }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#1f2937',
                    fontSize: '0.875rem',
                    lineHeight: 1.6,
                    fontWeight: 400
                  }}
                >
                  <strong style={{ color: '#92400e', fontWeight: 600 }}>If you have created a new tenant,</strong> contact the system administrator to enable it
                </Typography>
              </Box>
            </OptionCard>
          </Box>
        </Box>
      </Box>
    </NoTenantsContainer>
  );
}
