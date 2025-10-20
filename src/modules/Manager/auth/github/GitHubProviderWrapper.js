import React from "react";
import { AuthProvider as GenericAuthProvider } from "../AuthContext";
import GitHubService from "./GitHubService";

const GitHubProviderWrapper = ({ children }) => {
  // Instantiate the GitHubService
  const githubServiceInstance = new GitHubService();

  return (
    <GenericAuthProvider provider={githubServiceInstance}>
      {children}
    </GenericAuthProvider>
  );
};

export default GitHubProviderWrapper;

