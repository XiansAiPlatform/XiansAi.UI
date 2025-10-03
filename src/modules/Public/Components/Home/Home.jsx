import { useNavigate } from 'react-router-dom';
import { Typography, Box, Paper, Link, CircularProgress, Fade, Container, Chip, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import { BiLogoGithub } from 'react-icons/bi';
import { FiExternalLink, FiUsers, FiZap, FiCode, FiTerminal, FiGitBranch, FiStar } from 'react-icons/fi';
import { useAuth } from '../../../Manager/auth/AuthContext';
import '../Public.css';
import '../PublicLight.css';
import { ArrowForward } from '@mui/icons-material';

// Light Nordic-inspired page container
const PageContainer = styled(Box)(({ theme }) => ({
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #fafbfc 0%, #ffffff 50%, #f8fafc 100%)',
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

// Nordic hero section
const HeroSection = styled(Box)(({ theme }) => ({
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(8, 3),
    position: 'relative',
    zIndex: 1,
    [theme.breakpoints.down('md')]: {
        padding: theme.spacing(6, 2),
        minHeight: '90vh',
    },
    [theme.breakpoints.down('sm')]: {
        padding: theme.spacing(4, 1.5),
        minHeight: '85vh',
    },
}));

const HeroContent = styled(Container)(({ theme }) => ({
    maxWidth: '1200px',
    textAlign: 'center',
    position: 'relative',
}));

// Nordic typography
const HeroTitle = styled(Typography)(({ theme }) => ({
    fontSize: 'clamp(2.5rem, 5vw, 4rem)',
    fontWeight: 700,
    letterSpacing: '-0.02em',
    lineHeight: 1.1,
    marginBottom: theme.spacing(2),
    color: '#0f172a',
    position: 'relative',
}));

const HeroSubtitle = styled(Typography)(({ theme }) => ({
    fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)',
    fontWeight: 500,
    lineHeight: 1.6,
    color: '#334155',
    marginBottom: theme.spacing(4),
    maxWidth: '600px',
    margin: '0 auto',
}));

// Nordic feature section
const FeatureSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(8, 3),
  background: 'linear-gradient(135deg, #fafbfc 0%, #ffffff 50%, #f8fafc 100%)',
  borderTop: '1px solid rgba(229, 231, 235, 0.3)',
  backdropFilter: 'blur(20px)',
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
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(6, 2),
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(4, 1.5),
  },
}));

const FeatureGrid = styled(Box)(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: theme.spacing(3),
    maxWidth: '1200px',
    margin: '0 auto',
    [theme.breakpoints.down('md')]: {
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: theme.spacing(2.5),
    },
    [theme.breakpoints.down('sm')]: {
        gridTemplateColumns: '1fr',
        gap: theme.spacing(2),
    },
}));

const FeatureCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
  border: '1px solid rgba(229, 231, 235, 0.6)',
  borderRadius: '20px',
  backdropFilter: 'blur(20px)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  cursor: 'pointer',
  aspectRatio: '1 / 1',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  height: 'auto',
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
  '&:hover': {
    transform: 'translateY(-4px)',
    borderColor: 'rgba(66, 139, 131, 0.3)',
    boxShadow: '0 8px 24px rgba(66, 139, 131, 0.15), 0 0 0 1px rgba(66, 139, 131, 0.1)',
    '& .feature-icon': {
      transform: 'scale(1.1)',
      color: '#428b83',
    },
  },
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(3),
    borderRadius: '16px',
    aspectRatio: '1 / 1',
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2.5),
    borderRadius: '12px',
    aspectRatio: 'auto',
    '&:hover': {
      transform: 'translateY(-2px)',
    },
  },
}));

const FeatureIcon = styled(Box)(({ theme }) => ({
  fontSize: '3rem',
  color: '#428b83',
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(3),
  transition: 'all 0.3s ease',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '80px',
  height: '80px',
  background: 'linear-gradient(135deg, rgba(66, 139, 131, 0.08) 0%, rgba(66, 139, 131, 0.12) 100%)',
  border: '1px solid rgba(66, 139, 131, 0.15)',
  borderRadius: '20px',
  margin: '0 auto',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 4px 12px rgba(66, 139, 131, 0.1)',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: '1px',
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), transparent)',
    borderRadius: '20px',
    pointerEvents: 'none',
  },
}));

// Nordic badge/chip styling
const DevBadge = styled(Chip)(({ theme }) => ({
    backgroundColor: 'rgba(66, 139, 131, 0.1)',
    color: '#428b83',
    border: '1px solid rgba(66, 139, 131, 0.2)',
    fontWeight: 500,
    letterSpacing: '0.025em',
    '& .MuiChip-icon': {
        color: '#428b83',
    },
}));

// Nordic action buttons
const ActionButtonGroup = styled(Box)(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(2),
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing(4),
    flexWrap: 'wrap',
    [theme.breakpoints.down('sm')]: {
        gap: theme.spacing(1.5),
        '& button': {
            padding: `${theme.spacing(0.75)} ${theme.spacing(1.5)} !important`,
            fontSize: '0.875rem !important',
        },
    },
}));

// Nordic-styled action button
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
            background: 'linear-gradient(135deg, #357067 0%, #2d5a54 100%)',
            color: 'white',
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

// Nordic footer
const NordicFooter = styled(Box)(({ theme }) => ({
    padding: theme.spacing(4, 3),
    borderTop: '1px solid rgba(229, 231, 235, 0.8)',
    background: 'rgba(250, 251, 252, 0.95)',
    backdropFilter: 'blur(20px)',
    textAlign: 'center',
}));

export default function NewHome() {
    const navigate = useNavigate();
    const { isAuthenticated, login, isLoading } = useAuth();

    // Show loading animation while authentication is being initialized
    if (isLoading) {
        return (
            <PageContainer>
                <HeroSection>
                    <Fade in={true} timeout={800}>
                        <Box sx={{ textAlign: 'center' }}>
                            <CircularProgress
                                size={48}
                                thickness={3}
                                sx={{
                                    color: '#428b83',
                                    mb: 3,
                                    filter: 'drop-shadow(0 0 8px rgba(66, 139, 131, 0.3))'
                                }}
                            />
                            <Typography
                                variant="h5"
                                sx={{
                                    color: '#ffffff',
                                    fontWeight: 300,
                                    mb: 1,
                                    letterSpacing: '-0.01em'
                                }}
                            >
                                Loading
                            </Typography>
                            <Typography
                                variant="body1"
                                sx={{
                                    color: '#334155',
                                    fontWeight: 300
                                }}
                            >
                                Initializing your AI agent platform...
                            </Typography>
                        </Box>
                    </Fade>
                </HeroSection>
            </PageContainer>
        );
    }

    return (
        <PageContainer className="light-theme">
            {/* Hero Section */}
            <HeroSection>
                <HeroContent>
                    {/* Developer badges */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 4, flexWrap: 'wrap' }}>
                        <DevBadge 
                            icon={<FiGitBranch />} 
                            label="Open Source" 
                            size="small" 
                        />
                        <DevBadge 
                            icon={<FiTerminal />} 
                            label="Developer First" 
                            size="small" 
                        />
                        <DevBadge 
                            icon={<FiStar />} 
                            label="Enterprise Ready" 
                            size="small" 
                        />
                    </Box>

                    <HeroTitle component="h1">
                        Agent Development Kit
                    </HeroTitle>
                    
                    <HeroSubtitle>
                        Enterprise-grade AI Agent Platform for Building Complex Workflows
                    </HeroSubtitle>

                    <ActionButtonGroup>
                        {isAuthenticated ? (
                            <>
                                <ActionButton
                                    variant="primary"
                                    onClick={() => navigate('/manager/definitions')}
                                    startIcon={<ArrowForward />}
                                >
                                    Dashboard
                                </ActionButton>
                                <ActionButton
                                    variant="secondary"
                                    onClick={() => navigate('/manager/logout')}
                                >
                                    Sign Out
                                </ActionButton>
                            </>
                        ) : (
                            <>

                                <ActionButton
                                    variant="primary"
                                    onClick={() => navigate('/register')}
                                    endIcon={<ArrowForward />}
                                >
                                    Get Started
                                </ActionButton>
                                <ActionButton
                                    variant="secondary"
                                    onClick={() => login({ returnTo: window.location.origin })}
                                    startIcon={<FiTerminal />}
                                >
                                    Login
                                </ActionButton>
                            </>
                        )}
                    </ActionButtonGroup>

                </HeroContent>
            </HeroSection>

            {/* Features Section */}
            <FeatureSection>
                <Container maxWidth="lg">
                    <Typography
                        variant="h3"
                        sx={{
                            textAlign: 'center',
                            mb: 6,
                            fontWeight: 300,
                            letterSpacing: '-0.02em',
                            color: '#0f172a',
                            fontSize: 'clamp(2rem, 4vw, 3rem)',
                        }}
                    >
                        Built for Developers
                    </Typography>
                    
                    <FeatureGrid>
                        <FeatureCard elevation={0}>
                            <FeatureIcon className="feature-icon">
                                <FiCode />
                            </FeatureIcon>
                            <Typography
                                variant="h5"
                                sx={{
                                    fontWeight: 400,
                                    letterSpacing: '-0.01em',
                                    color: '#0f172a',
                                    mb: 2
                                    
                                }}
                            >
                                SDK First
                            </Typography>
                            <Typography
                                variant="body1"
                                sx={{
                                    color: '#334155',
                                    fontWeight: 300,
                                    lineHeight: 1.7,
                                    mb: 3
                                }}
                            >
                                Full-featured .NET SDK for building complex AI workflows. Type-safe, well-documented, and designed for enterprise development.
                            </Typography>
                            <Link
                                href="https://www.nuget.org/packages/XiansAi.Lib"
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{
                                    color: '#428b83',
                                    textDecoration: 'none',
                                    fontSize: '0.875rem',
                                    fontWeight: 400,
                                    letterSpacing: '0.025em',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                    '&:hover': {
                                        textDecoration: 'underline'
                                    }
                                }}
                            >
                                View on NuGet <FiExternalLink size={14} />
                            </Link>
                        </FeatureCard>

                        <FeatureCard elevation={0}>
                            <FeatureIcon className="feature-icon">
                                <FiUsers />
                            </FeatureIcon>
                            <Typography
                                variant="h5"
                                sx={{
                                    fontWeight: 400,
                                    letterSpacing: '-0.01em',
                                    color: '#0f172a',
                                    mb: 2
                                }}
                            >
                                Management Portal
                            </Typography>
                            <Typography
                                variant="body1"
                                sx={{
                                    color: '#334155',
                                    fontWeight: 300,
                                    lineHeight: 1.7,
                                    mb: 3
                                }}
                            >
                                Complete web interface for agent management, knowledge administration, and workflow monitoring with real-time insights.
                            </Typography>
                            <Link
                                href="https://github.com/XiansAiPlatform/community-edition"
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{
                                    color: '#428b83',
                                    textDecoration: 'none',
                                    fontSize: '0.875rem',
                                    fontWeight: 400,
                                    letterSpacing: '0.025em',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                    '&:hover': {
                                        textDecoration: 'underline'
                                    }
                                }}
                            >
                                View on GitHub <FiExternalLink size={14} />
                            </Link>
                        </FeatureCard>

                        <FeatureCard elevation={0}>
                            <FeatureIcon className="feature-icon">
                                <FiZap />
                            </FeatureIcon>
                            <Typography
                                variant="h5"
                                sx={{
                                    fontWeight: 400,
                                    letterSpacing: '-0.01em',
                                    color: '#0f172a',
                                    mb: 2
                                }}
                            >
                                Enterprise Ready
                            </Typography>
                            <Typography
                                variant="body1"
                                sx={{
                                    color: '#334155',
                                    fontWeight: 300,
                                    lineHeight: 1.7,
                                    mb: 3
                                }}
                            >
                                Built on Temporal.io for fault-tolerant execution, multi-agent coordination, and comprehensive tooling for production workflows.
                            </Typography>
                            <Link
                                href="https://xiansaiplatform.github.io/XiansAi.PublicDocs"
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{
                                    color: '#428b83',
                                    textDecoration: 'none',
                                    fontSize: '0.875rem',
                                    fontWeight: 400,
                                    letterSpacing: '0.025em',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                    '&:hover': {
                                        textDecoration: 'underline'
                                    }
                                }}
                            >
                                Documentation <FiExternalLink size={14} />
                            </Link>
                        </FeatureCard>
                    </FeatureGrid>

                    {/* CTA Section */}
                    <Box sx={{ textAlign: 'center', mt: 8 }}>
                        <Typography
                            variant="body1"
                            sx={{
                                color: '#94a3b8',
                                fontWeight: 300,
                                lineHeight: 1.7,
                                mb: 4,
                                maxWidth: '600px',
                                margin: '0 auto 2rem'
                            }}
                        >
                            Explore comprehensive guides, API references, and working examples to build enterprise AI agents.
                        </Typography>
                        <ActionButtonGroup>
                            <ActionButton
                                variant="primary"
                                onClick={() => window.open('https://github.com/XiansAiPlatform', '_blank')}
                                startIcon={<BiLogoGithub />}
                            >
                                View on GitHub
                            </ActionButton>
                            <ActionButton
                                variant="secondary"
                                onClick={() => window.open('https://xiansaiplatform.github.io/XiansAi.PublicDocs', '_blank')}
                                endIcon={<FiExternalLink />}
                            >
                                Documentation
                            </ActionButton>
                        </ActionButtonGroup>
                    </Box>
                </Container>
            </FeatureSection>

            {/* Nordic Footer */}
            <NordicFooter>
                <Typography 
                    variant="body2" 
                    sx={{ 
                        color: '#334155',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1,
                        fontWeight: 300,
                        letterSpacing: '0.025em'
                    }}
                >
                    Powered by{' '}
                    <Link
                        href="https://99x.io"
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                            color: '#428b83',
                            fontWeight: 400,
                            textDecoration: 'none',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            '&:hover': {
                                color: '#357067',
                                transform: 'translateY(-1px)'
                            }
                        }}
                    >
                        <img 
                            src="/images/99xlogo.svg" 
                            alt="99x" 
                            style={{
                                height: '16px',
                                width: 'auto',
                                opacity: 0.8,
                                transition: 'opacity 0.2s ease'
                            }}
                        />
                    </Link>
                </Typography>
            </NordicFooter>
        </PageContainer>
    );
}