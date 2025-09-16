// src/lib/axios.js
import axios from "axios";
import { getToken } from "@/utils/authStorage";
import { getTenantId, setTenantId } from "@/utils/tenantStorage";
import { forceLogout, getSessionKeys } from "@/utils/authSession"; // ⬅️ usar logout centralizado

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "/api",
  headers: { Accept: "application/json" },
  timeout: 30000,
});

// ── Request: Authorization, x-tenant-id y marcar actividad ───────────────
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;

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

    // Si es FormData, deja que el navegador ponga el boundary
    const isFormData =
      typeof FormData !== "undefined" && config.data instanceof FormData;
    if (isFormData) {
      if (typeof config.headers?.delete === "function") {
        config.headers.delete("Content-Type");
      } else if (config.headers && config.headers["Content-Type"]) {
        delete config.headers["Content-Type"];
      }
    }

    // Marca actividad (útil para vistas sin interacción)
    try {
      const { activityKey, channelName } = getSessionKeys();
      const now = Date.now();
      localStorage.setItem(activityKey, String(now));
      if ("BroadcastChannel" in window) {
        const ch = new BroadcastChannel(channelName);
        ch.postMessage({ type: "ACTIVITY", stamp: now });
        ch.close();
      }
    } catch {
      // noop
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response: 401 -> logout global, 403 -> redirigir a mis citas ─────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      // Usa el logout centralizado (sin duplicar lógica)
      forceLogout("auth");
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
