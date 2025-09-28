import { useNavigate } from 'react-router-dom';
import { Typography, Box, Paper, Link, CircularProgress, Fade } from '@mui/material';
import { styled } from '@mui/material/styles';
import { BiLogoGithub } from 'react-icons/bi';
import { FiExternalLink, FiUsers, FiZap } from 'react-icons/fi';
import { useAuth } from '../../../Manager/auth/AuthContext';
import '../Public.css';
import { ArrowForward } from '@mui/icons-material';

const HeaderSection = styled(Box)(({ theme }) => ({
    textAlign: 'center',
    marginBottom: theme.spacing(4),
}));

const ContentSection = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    marginBottom: theme.spacing(4),
    textAlign: 'center',
    backgroundColor: '#1e293b',
    borderRadius: theme.spacing(2),
    border: '1px solid rgba(14, 165, 233, 0.15)',
    color: '#ffffff',
    boxShadow: 'none',
}));

const FeatureCard = styled(Box)(({ theme }) => ({
    padding: theme.spacing(3),
    marginBottom: theme.spacing(2),
    backgroundColor: '#1e293b',
    borderRadius: theme.spacing(1),
    border: '1px solid rgba(14, 165, 233, 0.15)',
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    transition: 'all 0.3s ease',
    '&:hover': {
        borderColor: '#0ea5e9',
        boxShadow: '0 4px 12px rgba(14, 165, 233, 0.3)',
    },
}));

const Footer = styled(Box)(({ theme }) => ({
    textAlign: 'center',
    padding: theme.spacing(2),
    borderTop: '1px solid rgba(14, 165, 233, 0.15)',
    marginTop: 'auto',
    color: '#d4d4d8',
}));

export default function NewHome() {

    const navigate = useNavigate();
    const { isAuthenticated, login, logout, isLoading } = useAuth();

    // Show loading animation while authentication is being initialized
    if (isLoading) {
        return (
            <div className="home-container">
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '100vh',
                        textAlign: 'center',
                        px: 2
                    }}
                >
                    <Fade in={true} timeout={800}>
                        <Box>
                            <CircularProgress
                                size={60}
                                thickness={4}
                                sx={{
                                    color: '#0ea5e9',
                                    mb: 3,
                                    filter: 'drop-shadow(0 0 8px rgba(14, 165, 233, 0.4))'
                                }}
                            />
                            <Typography
                                variant="h5"
                                sx={{
                                    color: '#ffffff',
                                    fontWeight: 600,
                                    mb: 1
                                }}
                            >
                                Loading
                            </Typography>
                            <Typography
                                variant="body1"
                                sx={{
                                    color: '#e4e4e7',
                                    opacity: 0.8
                                }}
                            >
                                Initializing your AI agent platform...
                            </Typography>
                        </Box>
                    </Fade>
                </Box>
            </div>
        );
    }

    return (
        <div className="home-container">
            <section className="home-hero">
                <div className="home-hero-content">
                    <HeaderSection>
                        <Typography
                            variant="h2"
                            component="h1"
                            gutterBottom
                            sx={{
                                fontWeight: 700,
                                color: '#ffffff',
                                marginBottom: 2
                            }}
                        >
                            Agent Development Kit
                        </Typography>
                        <Typography
                            variant="h5"
                            sx={{
                                fontWeight: 400,
                                marginBottom: 3,
                                color: '#e4e4e7'
                            }}
                        >
                            Enterprise-grade Agent Platform for Building Complex AI Workflows
                        </Typography>
                    </HeaderSection>

                    <div className="home-auth-buttons">
                        {isAuthenticated ? (
                            <>
                                <button
                                    className="home-btn home-btn-primary"
                                    onClick={() => {
                                        navigate('/manager/definitions');
                                    }}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        boxShadow: '0 4px 12px rgba(14, 165, 233, 0.3)',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    <ArrowForward style={{ fontSize: '1.1em' }} />
                                    Go to Dashboard
                                </button>
                                <button
                                    className="home-btn home-btn-secondary"
                                    onClick={() => {
                                        navigate('/manager/logout');
                                    }}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    className="home-btn home-btn-secondary"
                                    onClick={() => login({ returnTo: window.location.origin })}
                                >
                                    Login
                                </button>
                                <button
                                    className="home-btn home-btn-primary"
                                    onClick={() => login({ returnTo: window.location.origin })}
                                >
                                    <BiLogoGithub />
                                    Sign up
                                </button>
                            </>
                        )}
                    </div>

                    <ContentSection elevation={0}>
                        <Typography variant="body1" paragraph sx={{
                            fontSize: '1.1rem',
                            lineHeight: 1.6,
                            marginBottom: 4,
                            color: '#e4e4e7'
                        }}>
                            Build sophisticated AI agents with enterprise reliability. Powered by temporal.io
                            for fault-tolerant execution, multi-agent coordination, and comprehensive tooling
                            for complex automation workflows.
                        </Typography>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, textAlign: 'left', marginBottom: 4 }}>
                            <FeatureCard>
                                <FiUsers size={24} style={{ color: '#0ea5e9' }} />
                                <Box>
                                    <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 600 }}>
                                        Agent Development SDK
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#e4e4e7' }}>
                                        Full-featured SDK for building complex AI workflows. Available for .NET at <a href="https://www.nuget.org/packages/XiansAi.Lib" target="_blank" rel="noopener noreferrer">Xians.Lib</a>.
                                    </Typography>
                                </Box>
                            </FeatureCard>

                            <FeatureCard>
                                <FiZap size={24} style={{ color: '#0ea5e9' }} />
                                <Box>
                                    <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 600 }}>
                                        Agent Management Portal
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#e4e4e7' }}>
                                        Complete web interface for agent management, knowledge administration, and workflow monitoring. Available at <a href="https://github.com/XiansAiPlatform/community-edition" target="_blank" rel="noopener noreferrer">Xians Community Edition</a>.
                                    </Typography>
                                </Box>
                            </FeatureCard>
                        </Box>

                        <Typography variant="h6" gutterBottom sx={{
                            marginTop: 4,
                            marginBottom: 2,
                            color: '#ffffff'
                        }}>
                            Getting Started
                        </Typography>

                        <Typography variant="body1" paragraph sx={{
                            marginBottom: 3,
                            color: '#e4e4e7'
                        }}>
                            Explore comprehensive guides, API references, and working examples to build enterprise AI agents.
                        </Typography>

                        <div className="home-cta-buttons">
                            <button
                                className="home-btn home-btn-primary"
                                onClick={() => window.open('https://github.com/XiansAiPlatform', '_blank')}
                            >
                                <BiLogoGithub />
                                View on GitHub
                            </button>
                            <button
                                className="home-btn home-btn-secondary"
                                onClick={() => window.open('https://xiansaiplatform.github.io/XiansAi.PublicDocs', '_blank')}
                            >
                                Documentation
                                <FiExternalLink />
                            </button>
                        </div>
                    </ContentSection>
                </div>
            </section>

            <Footer>
                <Typography variant="body" sx={{ 
                    color: '#d4d4d8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                }}>
                    Powered by{' '}
                    <Link
                        href="https://99x.io"
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                            color: '#0ea5e9',
                            fontWeight: 600,
                            textDecoration: 'none',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            '&:hover': {
                                color: '#0284c7',
                                textDecoration: 'underline'
                            }
                        }}
                    >
                        <img 
                            src="/images/99xlogo.svg" 
                            alt="99x" 
                            className="home-logo-99x"
                            style={{
                                height: '16px',
                                width: 'auto',
                                verticalAlign: 'middle'
                            }}
                        />
                        
                    </Link>
                </Typography>
            </Footer>
        </div>
    );
}