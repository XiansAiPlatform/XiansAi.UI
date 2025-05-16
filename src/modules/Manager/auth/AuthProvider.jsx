import React from 'react';
import { Auth0Provider } from "@auth0/auth0-react";
import { providerConfig } from "./authConfig";

const AuthProvider = ({ children }) => {
  return (
    <Auth0Provider {...providerConfig}>
      {children}
    </Auth0Provider>
  );
};

export default AuthProvider; 