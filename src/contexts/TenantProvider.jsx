// src/context/TenantProvider.jsx
import { useState, useEffect } from "react";
import { TenantContext } from "@/contexts/tenant-context";

export const TenantProvider = ({ children }) => {
  const [tenantId, setTenantId] = useState(() => {
    return localStorage.getItem("tenantId") || "default";
  });

  // Sync con localStorage si cambia desde setTenant
  useEffect(() => {
    localStorage.setItem("tenantId", tenantId);
  }, [tenantId]);

  const setTenant = (id) => setTenantId(id);

  return (
    <TenantContext.Provider value={{ tenantId, setTenant }}>
      {children}
    </TenantContext.Provider>
  );
};
