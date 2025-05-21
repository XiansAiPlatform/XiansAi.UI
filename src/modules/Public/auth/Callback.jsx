import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../Manager/contexts/NotificationContext';
import { useAuth } from '../../../auth/AuthContext';

const Callback = () => {
  const { isAuthenticated, error, isLoading } = useAuth();
  const navigate = useNavigate();
  const { showError } = useNotification();

  useEffect(() => {
    if (error) {
      showError(error.message);
      navigate('/login');
      return;
    }
    if (!isLoading && isAuthenticated) {
      navigate('/runs');
    }
  }, [isAuthenticated, error, isLoading, navigate, showError]);

  if (isLoading) {
    return <div>Loading authentication...</div>;
  }

  if (!isAuthenticated) {
    return <div>Processing authentication... If you are not redirected, please try logging in again.</div>;
  }

  return <div>Loading...</div>;
};

export default Callback;
