import { useTenantApi } from "../services/tenant-api";
import { useState, createContext, useContext } from "react";
import { useSelectedOrg } from "../contexts/OrganizationContext"; 

// Create the context
const TenantContext = createContext();

// Custom hook to use the tenant context
export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error("useTenant must be used within a TenantProvider");
  }
  return context;
};

//provide tenant data provider
export const TenantProvider = ({ children }) => {
  const [tenantData, setTenantData] = useState(null);
  const [tenantId, setTenantId] = useState(null);
  const [tenantLogo, setTenantLogo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const tenantApi = useTenantApi();
  const { selectedOrg } = useSelectedOrg();

  const fetchTenant = async (id) => {
    if (!id) {
      id = selectedOrg;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await tenantApi.getTenant(id);
      setTenantData(data);
      
      // Process tenant data after it's available
      if (data && data.length > 0) {
        console.log("Tenant data fetched:", data);
        setTenantId(data[0].id);
        setTenantLogo(data[0].logo?.imgBase64);
      } else {
        console.warn("No tenant data returned");
      }

      return data;
    } catch (error) {
      console.error(`Error fetching tenant ${id}:`, error);
      setError(error);
      return null;
    } finally {
      setLoading(false);
    }
  };
  // Provide the context value
  const contextValue = {
    tenantData,
    tenantId,
    tenantLogo,
    loading,
    error,
    fetchTenant
  };

  return (
    <TenantContext.Provider value={contextValue}>
      {children}
    </TenantContext.Provider>
  );
};
