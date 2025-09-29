import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Container, CircularProgress, Alert, Card, CardContent } from '@mui/material';
import { LockOutlined, Home, Refresh, AccessTime, ErrorOutline } from '@mui/icons-material';
import { useAuth } from '../../auth/AuthContext';
import { useUserApi } from '../../services/user-api';

const Landing = () => {
  const navigate = useNavigate();
  const userApi = useUserApi();
  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [tokenExpired, setTokenExpired] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { getAccessTokenSilently, error: authError } = useAuth();

  useEffect(() => {
    const fetchInvitation = async () => {
      try {
        setLoading(true);
        const token = await getAccessTokenSilently();
        if (token) {
          const invitationData = await userApi.getCurrentInvitation(token);
          if (invitationData?.token) {
            setInvitation(invitationData);
          }
        }
      } catch (err) {
        // Check if this is a token expiry or interaction required error
        if (err?.type === 'INTERACTION_REQUIRED' || err?.code === 'INTERACTION_REQUIRED' || 
            err?.message?.includes('expired') || err?.message?.includes('token')) {
          setTokenExpired(true);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchInvitation();
  }, [getAccessTokenSilently, userApi]);

  // Check for auth errors from context
  useEffect(() => {
    if (authError?.type === 'INTERACTION_REQUIRED' || 
        authError?.message?.includes('expired') || 
        authError?.message?.includes('token')) {
      setTokenExpired(true);
      setLoading(false);
    }
  }, [authError]);

  const handleAcceptInvitation = async () => {
    if (!invitation?.token) return;
    try {
      setAccepting(true);
      const token = await getAccessTokenSilently();
      await userApi.postAcceptInvitation(token, invitation.token);
      navigate('/');
    } catch (err) {
      // Optionally show error
    } finally {
      setAccepting(false);
    }
  };

  const handleHomeClick = () => {
    navigate('/');
  };

  const handleRefreshToManager = () => {
    setRefreshing(true);
    // Add a small delay to show the loading state
    setTimeout(() => {
      window.location.href = '/manager';
    }, 500);
  };

  const handleTryAgain = () => {
    setTokenExpired(false);
    setLoading(true);
    // Trigger a re-fetch by calling the effect again
    window.location.reload();
  };

  if (loading) {
    return (
      <Container maxWidth='md'>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            textAlign: 'center',
            py: 4,
          }}
        >
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>Checking for invitation...</Typography>
        </Box>
      </Container>
    );
  }

  // Determine the current scenario
  const getScenario = () => {
    if (tokenExpired) return 'token_expired';
    if (invitation?.token) return 'invitation';
    return 'unauthorized';
  };

  const scenario = getScenario();

  const scenarioConfig = {
    token_expired: {
      icon: <AccessTime sx={{ fontSize: 80 }} />,
      title: "Session Expired",
      description: "Your session has expired or there's an authentication issue. This is typically due to token expiry or account conflicts.",
      color: 'warning',
      actions: [
        {
          label: refreshing ? 'Refreshing...' : 'Refresh to Manager',
          onClick: handleRefreshToManager,
          variant: 'contained',
          icon: <Refresh />,
          disabled: refreshing
        },
        {
          label: 'Try Again',
          onClick: handleTryAgain,
          variant: 'outlined',
          icon: <Refresh />
        }
      ]
    },
    invitation: {
      icon: <LockOutlined sx={{ fontSize: 80 }} />,
      title: "Pending Invitation Acceptance",
      description: "You have been invited to join an organization. Please accept the invitation to get started with Xians.ai.",
      color: 'info',
      actions: [
        {
          label: accepting ? 'Accepting...' : 'Accept Invitation',
          onClick: handleAcceptInvitation,
          variant: 'contained',
          disabled: accepting
        }
      ]
    },
    unauthorized: {
      icon: <ErrorOutline sx={{ fontSize: 80 }} />,
      title: "Access Not Authorized",
      description: "You don't have permission to access this resource. Please contact System Admin for account approval to get started with Xians.ai.",
      color: 'error',
      actions: []
    }
  };

  const config = scenarioConfig[scenario];

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          textAlign: 'center',
          py: 4,
        }}
      >
        {/* Status Alert */}
        {tokenExpired && (
          <Alert 
            severity="warning" 
            sx={{ 
              mb: 3, 
              width: '100%',
              maxWidth: 600,
              '& .MuiAlert-message': {
                width: '100%'
              }
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Authentication Issue Detected
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5, opacity: 0.9 }}>
              Your session may have expired. Try refreshing the page or logging in again.
            </Typography>
          </Alert>
        )}

        {/* Main Card */}
        <Card 
          elevation={3}
          sx={{ 
            maxWidth: 600, 
            width: '100%',
            borderRadius: 3,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <CardContent sx={{ p: 4 }}>
            {/* Icon */}
            <Box
              sx={{
                mb: 3,
                color: `${config.color}.main`,
                opacity: 0.8,
              }}
            >
              {config.icon}
            </Box>

            {/* Title */}
            <Typography
              variant="h3"
              component="h1"
              sx={{
                mb: 2,
                fontWeight: 700,
                color: 'text.primary',
                background: `linear-gradient(135deg, var(--text-primary) 0%, var(--${config.color}) 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {config.title}
            </Typography>

            {/* Description */}
            <Typography
              variant="body1"
              sx={{
                mb: 4,
                color: 'text.secondary',
                lineHeight: 1.6,
                fontSize: '1.1rem',
              }}
            >
              {config.description}
            </Typography>

            {/* Action Buttons */}
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                flexWrap: 'wrap',
                justifyContent: 'center',
                mb: 2,
              }}
            >
              {config.actions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant}
                  size="large"
                  startIcon={action.icon}
                  onClick={action.onClick}
                  disabled={action.disabled}
                  sx={{
                    minWidth: 160,
                    py: 1.5,
                    px: 3,
                    ...(action.variant === 'contained' && {
                      backgroundColor: 'var(--primary)',
                      '&:hover': {
                        backgroundColor: 'var(--primary-dark)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(14, 165, 233, 0.3)',
                      },
                    }),
                    ...(action.variant === 'outlined' && {
                      borderColor: 'var(--border-color)',
                      color: 'text.secondary',
                      '&:hover': {
                        borderColor: 'var(--primary)',
                        backgroundColor: 'var(--primary-lighter)',
                        transform: 'translateY(-2px)',
                      },
                    }),
                    transition: 'all 0.3s ease',
                  }}
                >
                  {action.label}
                </Button>
              ))}
            </Box>

            {/* Additional Help */}
            {scenario === 'token_expired' && (
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  opacity: 0.8,
                  fontStyle: 'italic',
                  mt: 2,
                }}
              >
                💡 Tip: If problems persist, try clearing your browser cache or contact support
              </Typography>
            )}
          </CardContent>
        </Card>

        {/* Home Button - Always Available */}
        <Button
          variant="text"
          size="large"
          startIcon={<Home />}
          onClick={handleHomeClick}
          sx={{
            mt: 3,
            color: 'text.secondary',
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.05)',
            },
          }}
        >
          Go to Home
        </Button>
      </Box>
    </Container>
  );
};

export default Landing; 