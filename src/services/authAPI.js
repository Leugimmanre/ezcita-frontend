// Código en inglés; comentarios en español
import api from "@/lib/axios";
import { setToken, clearToken } from "@/utils/authStorage";
import { getTenantId } from "@/utils/tenantStorage";

/** helper: obtiene tenant actual (con fallback) */
function currentTenant() {
  return getTenantId() || import.meta.env.VITE_TENANT_ID || "default";
}

export const authAPI = {
  // Registro (PÚBLICO). Si tu backend requiere tenant en query, añádelo:
  async register({ name, lastname, email, password, phone }) {
    const tenant = currentTenant();
    const { data } = await api.post(
      "/auth/register",
      {
        name,
        lastname,
        email: email.toLowerCase().trim(),
        password,
        phone,
      },
      {
        // Público: sin Authorization/x-tenant-id
        meta: { public: true },
        params: { tenant },
      }
    );
    return data; // { success, data, message? }
  },

  // Reenviar token verificación (PÚBLICO)
  async resendToken(email) {
    const tenant = currentTenant();
    const { data } = await api.post(
      "/auth/resend-token",
      { email },
      { meta: { public: true }, params: { tenant } }
    );
    return data;
  },

  // Confirmar cuenta (PÚBLICO)
  async confirmAccount(token) {
    const tenant = currentTenant();
    const { data } = await api.post(
      "/auth/confirm-account",
      { token },
      { meta: { public: true }, params: { tenant } }
    );
    return data;
  },

  // Login (PÚBLICO)
  async login({ email, password }) {
    const tenant = currentTenant();
    const { data } = await api.post(
      "/auth/login",
      {
        email: email.toLowerCase().trim(),
        password,
      },
      {
        // Público: sin Authorization/x-tenant-id
        meta: { public: true },
        params: { tenant }, // el backend lo lee como ?tenant=...
      }
    );
    if (data?.success && data?.data?.token) {
      setToken(data.data.token);
    }
    return data;
  },

  // Olvidé mi contraseña (PÚBLICO)
  async forgotPassword(email) {
    const tenant = currentTenant();
    const { data } = await api.post(
      "/auth/forgot-password",
      { email },
      { meta: { public: true }, params: { tenant } }
    );
    return data;
  },

  // Resetear contraseña (PÚBLICO)
  async resetPassword({ token, password }) {
    const tenant = currentTenant();
    const { data } = await api.post(
      "/auth/reset-password",
      { token, password },
      { meta: { public: true }, params: { tenant } }
    );
    return data;
  },

  // Logout (local)
  logout() {
    clearToken();
  },
};
