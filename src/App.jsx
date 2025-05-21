import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import PublicRoutes from './modules/Public/PublicRoutes';
import ManagerRoutes from './modules/Manager/ManagerRoutes';
import AgentsRoutes from './modules/Agents/AgentsRoutes';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { getConfig } from './config';
import Auth0ProviderWrapper from './auth/auth0/Auth0ProviderWrapper';
import EntraIdProviderWrapper from './auth/entraId/EntraIdProviderWrapper';

// Dynamically select the Auth Provider based on configuration
const AppAuthProvider = ({ children }) => {
  const config = getConfig();

  if (config.authProvider === 'entraId') {
    return <EntraIdProviderWrapper>{children}</EntraIdProviderWrapper>;
  }
  // Default to Auth0
  return <Auth0ProviderWrapper>{children}</Auth0ProviderWrapper>;
};

function App() {
  return (
    <BrowserRouter>
      <AppAuthProvider>
        <PublicRoutes />
        <AgentsRoutes />
        <ManagerRoutes />
        <ToastContainer />
      </AppAuthProvider>
    </BrowserRouter>
  );
}

export default App; 