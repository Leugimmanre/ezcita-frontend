// src/lib/axios.js
import axios from "axios";
import { getToken, clearToken } from "@/utils/authStorage";
import { getTenantId, setTenantId } from "@/utils/tenantStorage";
import { clearStoredUser } from "@/utils/userStorage";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 15000,
});

// ─────────────────────────────────────────────────────────────
// Request: añade Authorization y x-tenant-id (con fallback)
// ─────────────────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    // Token de autenticación
    const token = getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;

    // Tenant: primero localStorage; si no hay, usa .env y persiste
    let tenantId = getTenantId();
    if (!tenantId) {
      tenantId = import.meta.env.VITE_TENANT_ID || "default";
      try {
        setTenantId(tenantId);
      } catch {
        // noop
      }
    }
    if (tenantId) config.headers["x-tenant-id"] = tenantId;

    return config;
  },
  (error) => Promise.reject(error)
);

// ─────────────────────────────────────────────────────────────
// Response: manejo global de 401/403
// ─────────────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    // 401: token inválido/expirado -> limpiar sesión y mandar a login
    if (status === 401) {
      try {
        clearToken();
        clearStoredUser();
      } catch {
        // noop
      }
      if (typeof window !== "undefined" && window.location.pathname !== "/") {
        window.location.assign("/");
      }
    }

    // 403: sin permisos (p.ej. no admin intentando entrar a /settings)
    if (status === 403) {
      if (
        typeof window !== "undefined" &&
        !window.location.pathname.startsWith("/appointments")
      ) {
        window.location.assign("/appointments/my-appointments");
      }
    }

    return Promise.reject(error);
  }
);

export default api;
