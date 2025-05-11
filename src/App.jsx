import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import PublicRoutes from './modules/Public/PublicRoutes';
import ManagerRoutes from './modules/Manager/ManagerRoutes';
import AgentsRoutes from './modules/Agents/AgentsRoutes';
import AuthProvider from './modules/Manager/auth/AuthProvider';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PublicRoutes />
        <AgentsRoutes />
        <ManagerRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App; 