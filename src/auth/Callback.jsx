import { useAuth0 } from '@auth0/auth0-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Callback = () => {
  const { isAuthenticated, error, loginWithRedirect } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    if (!navigator.onLine) {
      throw new Error('No internet connection. Please check your network and try again.');
    }
    if (isAuthenticated) {
      navigate('/');
    } else {
      loginWithRedirect();
    }
  }, [isAuthenticated, navigate, loginWithRedirect]);

  if (error) {
    return <div>Authentication error: {error.message}</div>;
  }

  return <div>Loading...</div>;
};

export default Callback;
