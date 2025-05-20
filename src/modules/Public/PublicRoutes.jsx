import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './Components/Home/Home';
import Register from './Components/Register/Register';
import Login from './auth/Login';
import Callback from './auth/Callback';
import { OrganizationProvider } from '../Manager/contexts/OrganizationContext';
import { NotificationProvider } from '../Manager/contexts/NotificationContext';

function PublicRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/register" element={
        <NotificationProvider>
          <OrganizationProvider>
            <Register />
          </OrganizationProvider>
        </NotificationProvider>
      } />
      <Route path="/login" element={<Login />} />
      <Route path="/callback" element={<Callback />} />
    </Routes>
  );
}

export default PublicRoutes; 