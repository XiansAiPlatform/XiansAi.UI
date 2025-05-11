import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './Components/Home/Home';
import Register from './Components/Register/Register';
import Login from '../../auth/Login';
import Callback from '../../auth/Callback';

function PublicRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/callback" element={<Callback />} />
    </Routes>
  );
}

export default PublicRoutes; 