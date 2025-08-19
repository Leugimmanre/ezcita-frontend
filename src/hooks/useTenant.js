// src/hooks/useTenant.js
import { useContext } from "react";
import { TenantContext } from "contexts/tenant-context";

// Este hook permite acceder al contexto del inquilino (tenant) en cualquier componente de la aplicación
export const useTenant = () => useContext(TenantContext);
