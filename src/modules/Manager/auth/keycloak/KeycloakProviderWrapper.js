import React from "react";
import { AuthProvider as GenericAuthProvider } from "../AuthContext";
import KeycloakService from "./KeycloakService";

const KeycloakProviderWrapper = ({ children }) => {
  // Instantiate the KeycloakService
  const keycloakServiceInstance = new KeycloakService();

  return (
    <GenericAuthProvider provider={keycloakServiceInstance}>
      {children}
    </GenericAuthProvider>
  );
};

export default KeycloakProviderWrapper;
