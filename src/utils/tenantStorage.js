// src/utils/tenantStorage.js
export const getTenantId = () => localStorage.getItem("tenantId") || "";
export const setTenantId = (id) => localStorage.setItem("tenantId", id);
export const clearTenantId = () => localStorage.removeItem("tenantId");
