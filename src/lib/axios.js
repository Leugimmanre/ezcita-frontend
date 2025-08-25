// src/lib/axios.js
import axios from "axios";
import { getToken, clearToken } from "@/utils/authStorage";
import { getTenantId /*, setTenantId*/ } from "@/utils/tenantStorage"; // <-- cambia import
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
// Request: añade Authorization y x-tenant-id (en runtime)
// ─────────────────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    // Token de autenticación
    const token = getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;

    // Tenant dinámico (subdominio / ruta / query) con persistencia automática
    const tenantId = getTenantId();
    if (tenantId) config.headers["x-tenant-id"] = tenantId;

    // (Opcional) Algunos endpoints (p.ej. /auth) esperan tenant en el body:
    const method = (config.method || "get").toLowerCase();
    const wantsBody =
      method === "post" || method === "put" || method === "patch";
    if (
      wantsBody &&
      config.data &&
      typeof config.data === "object" &&
      !("tenantId" in config.data)
    ) {
      config.data = { ...config.data, tenantId };
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ─────────────────────────────────────────────────────────────
// Response: manejo global de 401/403 (tu lógica tal cual)
// ─────────────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      try {
        clearToken();
        clearStoredUser();
      } catch (err) {
        console.log(err);
      }
      if (typeof window !== "undefined" && window.location.pathname !== "/") {
        window.location.assign("/");
      }
    }

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
