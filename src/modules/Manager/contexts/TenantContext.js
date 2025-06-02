import { useTenantApi } from "../services/tenant-api";
import { useState, createContext, useContext, useEffect } from "react";

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
export const TenantProvider = ({ children }) => {  const [tenantData, setTenantData] = useState(null);
  const [tenantId, setTenantId] = useState(null);
  const [loading, setLoading] = useState(false);
  const tenantApi = useTenantApi();
  const organizationId = localStorage.getItem("selectedOrganization");
  useEffect(() => {
    const fetchTenant = async () => {
      setLoading(true);
      try {
        const data = await tenantApi.getTenant(organizationId);
        if (data) {
          setTenantData(data);
          setTenantId(data.id);
        }
      } catch (error) {
        console.error(`Error fetching tenant`, error);
      } finally {
        setLoading(false);
      }
    };
    
    if (organizationId) {
      fetchTenant();
    }
  }, [organizationId, tenantApi]);

  
  const contextValue = {
    tenantData,
    tenantId,
    loading
  };

  return (
    <TenantContext.Provider value={contextValue}>
      {children}
    </TenantContext.Provider>
  );
};
