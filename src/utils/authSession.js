// src/utils/authSession.js
// Utilidad para limpiar sesión y forzar logout sincronizado entre pestañas.
import { clearToken, getToken } from "@/utils/authStorage";
import { clearStoredUser } from "@/utils/userStorage";
import { parseJwt } from "@/utils/jwt";

const LOGIN_PATH = "/";

// Calcula claves/kanal por usuario (a partir del JWT)
function getSessionScope() {
  const token = getToken() || localStorage.getItem("token");
  const payload = token ? parseJwt(token) : null;
  const uid = payload?.id || payload?._id || "unknown"; // ajusta si tu payload usa otro campo
  const activityKey = `session:${uid}:lastActivityAt`;
  const logoutKey = `session:${uid}:forceLogout`;
  const channelName = `idle-logout:${uid}`;
  return { uid, activityKey, logoutKey, channelName };
}

export function clearAuthStorage() {
  try {
    clearToken();
  } catch {
    // noop
  }
  try {
    clearStoredUser();
  } catch {
    // noop
  }
  try {
    localStorage.removeItem("tenantId");
  } catch {
    // noop
  }
}

export function forceLogout(reason = "idle") {
  try {
    const { logoutKey, channelName } = getSessionScope();
    clearAuthStorage();
    const stamp = Date.now().toString();

    // Propaga solo a la sesión del usuario actual
    try {
      localStorage.setItem(logoutKey, stamp);
    } catch {
      // noop
    }
    if ("BroadcastChannel" in window) {
      const ch = new BroadcastChannel(channelName);
      ch.postMessage({ type: "LOGOUT", reason, stamp });
      ch.close();
    }
  } finally {
    if (window.location.pathname !== LOGIN_PATH) {
      window.location.replace(LOGIN_PATH);
    }
  }
}

// Exporta utilidades para otras partes (axios / provider)
export function getSessionKeys() {
  const { activityKey, logoutKey, channelName } = getSessionScope();
  return { activityKey, logoutKey, channelName };
}
