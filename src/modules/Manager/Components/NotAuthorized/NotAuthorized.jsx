import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Container } from '@mui/material';
import { LockOutlined, PersonAdd, Home } from '@mui/icons-material';

const NotAuthorized = () => {
  const navigate = useNavigate();

  const handleRegisterClick = () => {
    navigate('/register');
  };

  const handleHomeClick = () => {
    navigate('/');
  };

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
          You don't have permission to access this resource. 
          Please register for an account to get started with Parkly AI.
        </Typography>

        <Box
          sx={{
            display: 'flex',
            gap: 2,
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          <Button
            variant="contained"
            size="large"
            startIcon={<PersonAdd />}
            onClick={handleRegisterClick}
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
            Register Now
          </Button>

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