import { useAuth0 } from '@auth0/auth0-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../contexts/NotificationContext';

const Callback = () => {
  const { isAuthenticated, error } = useAuth0();
  const navigate = useNavigate();
  const { showError } = useNotification();

  useEffect(() => {
    if (error) {
      showError(error.message);
      return;
    }
    
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate, error, showError]);

  return <div>Loading...</div>;
};

export default Callback;
