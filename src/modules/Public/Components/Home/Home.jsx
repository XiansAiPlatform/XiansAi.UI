import { useNavigate } from 'react-router-dom';
import { Typography, Box, Paper, Link, CircularProgress, Fade, Container, Chip } from '@mui/material';
import { styled } from '@mui/material/styles';
import { BiLogoGithub } from 'react-icons/bi';
import { FiExternalLink, FiUsers, FiZap, FiCode, FiTerminal, FiGitBranch, FiStar } from 'react-icons/fi';
import { useAuth } from '../../../Manager/auth/AuthContext';
import '../Public.css';
import { ArrowForward } from '@mui/icons-material';

// Nordic-inspired page container
const PageContainer = styled(Box)(({ theme }) => ({
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    position: 'relative',
    '&::before': {
        content: '""',
        position: 'absolute',
        inset: 0,
        backgroundImage: `
            linear-gradient(rgba(14, 165, 233, 0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(14, 165, 233, 0.015) 1px, transparent 1px)
        `,
        backgroundSize: '80px 80px',
        maskImage: 'radial-gradient(circle at center, black, transparent 70%)',
        pointerEvents: 'none',
        opacity: 0.4,
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
    fontWeight: 300,
    letterSpacing: '-0.02em',
    lineHeight: 1.1,
    marginBottom: theme.spacing(2),
    background: 'linear-gradient(135deg, #ffffff 0%, #e2e8f0 70%, #cbd5e1 100%)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    position: 'relative',
}));

const HeroSubtitle = styled(Typography)(({ theme }) => ({
    fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)',
    fontWeight: 300,
    lineHeight: 1.6,
    color: '#94a3b8',
    marginBottom: theme.spacing(4),
    maxWidth: '600px',
    margin: '0 auto',
    marginBottom: theme.spacing(4),
}));

// Nordic feature section
const FeatureSection = styled(Box)(({ theme }) => ({
    padding: theme.spacing(8, 3),
    background: 'rgba(15, 23, 42, 0.6)',
    borderTop: '1px solid rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(20px)',
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
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0.01) 100%)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '8px',
    backdropFilter: 'blur(10px)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer',
    aspectRatio: '1 / 1',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    height: 'auto',
    '&:hover': {
        transform: 'translateY(-4px)',
        borderColor: 'rgba(14, 165, 233, 0.2)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(14, 165, 233, 0.05)',
        '& .feature-icon': {
            transform: 'scale(1.1)',
            color: '#0ea5e9',
        },
    },
    [theme.breakpoints.down('md')]: {
        padding: theme.spacing(3),
        borderRadius: '8px',
        aspectRatio: '1 / 1',
    },
    [theme.breakpoints.down('sm')]: {
        padding: theme.spacing(2.5),
        borderRadius: '8px',
        aspectRatio: 'auto',
        '&:hover': {
            transform: 'translateY(-2px)',
        },
    },
}));

const FeatureIcon = styled(Box)(({ theme }) => ({
    fontSize: '4.5rem',
    color: '#64748b',
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(4),
    transition: 'all 0.3s ease',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '120px',
}));

// Nordic badge/chip styling
const DevBadge = styled(Chip)(({ theme }) => ({
    backgroundColor: 'rgba(14, 165, 233, 0.1)',
    color: '#0ea5e9',
    border: '1px solid rgba(14, 165, 233, 0.2)',
    fontWeight: 400,
    letterSpacing: '0.025em',
    '& .MuiChip-icon': {
        color: '#0ea5e9',
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

// Nordic footer
const NordicFooter = styled(Box)(({ theme }) => ({
    padding: theme.spacing(4, 3),
    borderTop: '1px solid rgba(255, 255, 255, 0.03)',
    background: 'rgba(15, 23, 42, 0.8)',
    backdropFilter: 'blur(20px)',
    textAlign: 'center',
}));

export default function NewHome() {
    const navigate = useNavigate();
    const { isAuthenticated, login, logout, isLoading } = useAuth();

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
                                    color: '#0ea5e9',
                                    mb: 3,
                                    filter: 'drop-shadow(0 0 8px rgba(14, 165, 233, 0.3))'
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
                                    color: '#94a3b8',
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
        <PageContainer>
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
                                <button
                                    className="home-btn home-btn-primary"
                                    onClick={() => navigate('/manager/definitions')}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.875rem 1.75rem',
                                        fontSize: '0.95rem',
                                        fontWeight: 400,
                                        letterSpacing: '0.025em'
                                    }}
                                >
                                    <ArrowForward style={{ fontSize: '1.1em' }} />
                                    Dashboard
                                </button>
                                <button
                                    className="home-btn home-btn-secondary"
                                    onClick={() => navigate('/manager/logout')}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.875rem 1.75rem',
                                        fontSize: '0.95rem',
                                        fontWeight: 400,
                                        letterSpacing: '0.025em'
                                    }}
                                >
                                    Sign Out
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    className="home-btn home-btn-primary"
                                    onClick={() => login({ returnTo: window.location.origin })}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.875rem 1.75rem',
                                        fontSize: '0.95rem',
                                        fontWeight: 400,
                                        letterSpacing: '0.025em'
                                    }}
                                >
                                    <FiTerminal style={{ fontSize: '1.1em' }} />
                                    Login
                                </button>
                                <button
                                    className="home-btn home-btn-secondary"
                                    onClick={() => navigate('/register')}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.875rem 1.75rem',
                                        fontSize: '0.95rem',
                                        fontWeight: 400,
                                        letterSpacing: '0.025em'
                                    }}
                                >
                                    Get Started
                                    <ArrowForward style={{ fontSize: '1em' }} />
                                </button>
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
                            color: '#ffffff',
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
                                    color: '#ffffff',
                                    mb: 2
                                    
                                }}
                            >
                                SDK First
                            </Typography>
                            <Typography
                                variant="body1"
                                sx={{
                                    color: '#94a3b8',
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
                                    color: '#0ea5e9',
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
                                    color: '#ffffff',
                                    mb: 2
                                }}
                            >
                                Management Portal
                            </Typography>
                            <Typography
                                variant="body1"
                                sx={{
                                    color: '#94a3b8',
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
                                    color: '#0ea5e9',
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
                                    color: '#ffffff',
                                    mb: 2
                                }}
                            >
                                Enterprise Ready
                            </Typography>
                            <Typography
                                variant="body1"
                                sx={{
                                    color: '#94a3b8',
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
                                    color: '#0ea5e9',
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
                            <button
                                className="home-btn home-btn-primary"
                                onClick={() => window.open('https://github.com/XiansAiPlatform', '_blank')}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.875rem 1.75rem',
                                    fontSize: '0.95rem',
                                    fontWeight: 400,
                                    letterSpacing: '0.025em'
                                }}
                            >
                                <BiLogoGithub style={{ fontSize: '1.2em' }} />
                                View on GitHub
                            </button>
                            <button
                                className="home-btn home-btn-secondary"
                                onClick={() => window.open('https://xiansaiplatform.github.io/XiansAi.PublicDocs', '_blank')}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.875rem 1.75rem',
                                    fontSize: '0.95rem',
                                    fontWeight: 400,
                                    letterSpacing: '0.025em'
                                }}
                            >
                                Documentation
                                <FiExternalLink style={{ fontSize: '1.1em' }} />
                            </button>
                        </ActionButtonGroup>
                    </Box>
                </Container>
            </FeatureSection>

            {/* Nordic Footer */}
            <NordicFooter>
                <Typography 
                    variant="body2" 
                    sx={{ 
                        color: '#64748b',
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
                            color: '#0ea5e9',
                            fontWeight: 400,
                            textDecoration: 'none',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            '&:hover': {
                                color: '#0284c7',
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