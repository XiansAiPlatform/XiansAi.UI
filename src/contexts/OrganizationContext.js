import React, { createContext, useContext, useState } from 'react';

const OrganizationContext = createContext();

export function OrganizationProvider({ children }) {
  const [selectedOrg, setSelectedOrg] = useState('');

  return (
    <OrganizationContext.Provider value={{ selectedOrg, setSelectedOrg }}>
      {children}
    </OrganizationContext.Provider>
  );
}

export function useSelectedOrg() {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error('useSelectedOrg must be used within an OrganizationProvider');
  }
  return context;
} 