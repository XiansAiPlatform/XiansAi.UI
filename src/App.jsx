import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import PublicRoutes from './modules/Public/PublicRoutes';
import ManagerRoutes from './modules/Manager/ManagerRoutes';
import AgentsRoutes from './modules/Agents/AgentsRoutes';
import AuthProvider from './modules/Manager/auth/AuthProvider';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PublicRoutes />
        <AgentsRoutes />
        <ManagerRoutes />
        <ToastContainer />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App; 