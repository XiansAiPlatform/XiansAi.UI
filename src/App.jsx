import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useAuth0 } from "@auth0/auth0-react";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PublicRoutes from './modules/Public/PublicRoutes';
import ManagerRoutes from './modules/Manager/ManagerRoutes';

function App() {
  const { isLoading, error, logout } = useAuth0();

  if (error) {
    console.error(error);
    return <div>Oops... {error.message}</div>;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const handleLogout = () => {
    logout({
      logoutParams: {
        returnTo: window.location.origin + '/login'
      }
    });
  };

  return (
    <BrowserRouter>
      <PublicRoutes />
      <ManagerRoutes />
      <Routes>
        <Route path="/logout" element={<LogoutHandler onLogout={handleLogout} />} />
      </Routes>
      <ToastContainer />
    </BrowserRouter>
  );
}

function LogoutHandler({ onLogout }) {
  React.useEffect(() => {
    onLogout();
  }, [onLogout]);

  return null;
}

export default App; 