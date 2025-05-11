import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import PublicRoutes from './modules/Public/PublicRoutes';
import ManagerRoutes from './modules/Manager/ManagerRoutes';
import AuthProvider from './modules/Manager/auth/AuthProvider';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PublicRoutes />
        <ManagerRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App; 