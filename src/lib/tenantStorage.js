// src/utils/tenantStorage.js
// 🇪🇸 Gestión de tenantId (persistencia + resolución dinámica por URL)

const TENANT_KEY = "tenantId";

// 🇪🇸 Extrae "manicura" de manicura.midominio.com
function getTenantFromHostname(hostname) {
  const sub = (hostname || "").split(".")[0];
  if (!sub || sub === "www" || sub === "localhost") return "";
  return sub;
}

// 🇪🇸 Extrae "manicura" de /manicura/lo-que-sea
function getTenantFromPathname(pathname) {
  const first = (pathname || "").split("/").filter(Boolean)[0];
  return first || "";
}

// 🇪🇸 Lee ?tenant=manicura
function getQueryTenant() {
  try {
    const q = new URLSearchParams(window.location.search).get("tenant");
    return q || "";
  } catch {
    return "";
  }
}

// 🇪🇸 Orden de resolución con fallback seguro
function resolveTenantId() {
  const injected = window.__TENANT__ || ""; // override manual opcional
  const query = getQueryTenant();
  const byHost = getTenantFromHostname(window.location.hostname);
  const byPath = getTenantFromPathname(window.location.pathname);

  return injected || query || byHost || byPath || "salon"; // fallback
}

export function getTenantId() {
  try {
    const stored = localStorage.getItem(TENANT_KEY);
    if (stored) return stored;

    // 🇪🇸 Si no hay guardado, resolver desde URL y persistir
    const resolved = resolveTenantId();
    localStorage.setItem(TENANT_KEY, resolved);
    return resolved;
  } catch {
    // 🇪🇸 Si localStorage falla (modo privado, CSP, etc.), devolver resuelto
    return resolveTenantId();
  }
}

export function setTenantId(tenantId) {
  try {
    localStorage.setItem(TENANT_KEY, tenantId);
  } catch {
    // noop
  }
}

export function clearTenantId() {
  try {
    localStorage.removeItem(TENANT_KEY);
  } catch {
    // noop
  }
}
