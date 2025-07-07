import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Container, CircularProgress } from '@mui/material';
import { LockOutlined, Home } from '@mui/icons-material';
import { useAuth } from '../../../Manager/auth/AuthContext';
import { useUserApi } from '../../services/user-api';

const NotAuthorized = () => {
  const navigate = useNavigate();
  const userApi = useUserApi();
  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const { getAccessTokenSilently } = useAuth();

  useEffect(() => {
    const fetchInvitation = async () => {
      try {
        setLoading(true);
        const token = await getAccessTokenSilently();
        const invitationData = await userApi.getCurrentInvitation(token);
        if (invitationData && invitationData.token) {
          setInvitation(invitationData);
        }
      } catch (err) {
        // Optionally handle error
      } finally {
        setLoading(false);
      }
    };
    fetchInvitation();
  }, [getAccessTokenSilently, userApi]);

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
        <Box
          sx={{
            mb: 3,
            color: 'text.secondary',
            opacity: 0.6,
          }}
        >
          <LockOutlined sx={{ fontSize: 80 }} />
        </Box>

        <Typography
          variant="h3"
          component="h1"
          sx={{
            mb: 2,
            fontWeight: 700,
            color: 'text.primary',
            background: 'linear-gradient(135deg, var(--text-primary) 0%, var(--text-secondary) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Access Not Authorized
        </Typography>

        <Typography
          variant="h6"
          sx={{
            mb: 4,
            color: 'text.secondary',
            lineHeight: 1.6,
            maxWidth: '500px',
          }}
        >
          You don't have permission to access this resource. Please contact
          System Admin for account approval to get started with Xians.ai.
        </Typography>

        <Box
          sx={{
            display: 'flex',
            gap: 2,
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {invitation?.token && (
          <Button
            variant="contained"
            size="large"
            onClick={handleAcceptInvitation}
            sx={{
              minWidth: 160,
              py: 1.5,
              px: 3,
              backgroundColor: 'var(--primary)',
              '&:hover': {
                backgroundColor: 'var(--primary-dark)',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(14, 165, 233, 0.3)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            {accepting ? 'Accepting...' : 'Accept Invitation'}
          </Button>
          )}

          <Button
            variant="outlined"
            size="large"
            startIcon={<Home />}
            onClick={handleHomeClick}
            sx={{
              minWidth: 160,
              py: 1.5,
              px: 3,
              borderColor: 'var(--border-color)',
              color: 'text.secondary',
              '&:hover': {
                borderColor: 'var(--primary)',
                backgroundColor: 'var(--primary-lighter)',
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            Go to Home
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default NotAuthorized; 