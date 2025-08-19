// src/services/authAPI.js
import api from "@/lib/axios";
import { setToken, clearToken } from "@/utils/authStorage";

export const authAPI = {
  // Registro
  async register({ name, lastname, email, password }) {
    const { data } = await api.post("/auth/register", {
      name,
      lastname,             // ← requerido por tu modelo
      email: email.toLowerCase().trim(),
      password,
      // tenantId NO es necesario en body: ya va por header x-tenant-id
    });
    return data; // { success, data, message? }
  },

  // Reenviar token verificación
  async resendToken(email) {
    const { data } = await api.post("/auth/resend-token", { email });
    return data;
  },

  // Confirmar cuenta
  async confirmAccount(token) {
    const { data } = await api.post("/auth/confirm-account", { token });
    return data;
  },

  // Login
  async login({ email, password }) {
    const { data } = await api.post("/auth/login", {
      email: email.toLowerCase().trim(),
      password,
    });
    if (data?.success && data?.data?.token) {
      setToken(data.data.token);
    }
    return data;
  },

  // Olvidé mi contraseña
  async forgotPassword(email) {
    const { data } = await api.post("/auth/forgot-password", { email });
    return data;
  },

  // Resetear contraseña
  async resetPassword({ token, password }) {
    const { data } = await api.post("/auth/reset-password", { token, password });
    return data;
  },

  // Logout (limpia token)
  logout() {
    clearToken();
  },
};
