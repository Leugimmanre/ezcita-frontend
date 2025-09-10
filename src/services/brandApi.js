// Código en inglés; comentarios en español
import api from "@/lib/axios";

/**
 * Obtiene la configuración de marca del tenant actual
 */
export async function getBrandSettings() {
  const { data } = await api.get("/brand");
  return data?.data ?? null;
}

/**
 * Crea/actualiza (upsert) los ajustes de marca
 * payload: { brandName, brandDomain, contactEmail, timezone, frontendUrl }
 */
export async function updateBrandSettings(payload) {
  const { data } = await api.put("/brand", payload);
  return data?.data ?? null;
}

/**
 * Sube o reemplaza el logo (campo 'logo' en FormData)
 * ⚠️ No forzar 'Content-Type': el interceptor elimina el header para FormData
 */
export async function uploadBrandLogo(file) {
  const form = new FormData();
  form.append("logo", file);
  const { data } = await api.post("/brand/logo", form);
  // Devuelve el objeto logo guardado { url, publicId, provider, filename, mimetype, size }
  return data?.data ?? null;
}

/**
 * Elimina el logo actual
 */
export async function deleteBrandLogo() {
  const { data } = await api.delete("/brand/logo");
  return data;
}

/**
 * Sube/reemplaza el hero (campo 'hero' en FormData)
 * ⚠️ No forzar 'Content-Type'
 */
export async function uploadBrandHero(file) {
  const form = new FormData();
  form.append("hero", file);
  const { data } = await api.post("/brand/hero", form);
  // Devuelve el objeto hero guardado { url, publicId, provider, filename, mimetype, size }
  return data?.data ?? null;
}

/**
 * Elimina el hero actual
 */
export async function deleteBrandHero() {
  const { data } = await api.delete("/brand/hero");
  return data;
}

/**
 * Utilidades para URLs absolutas (por si sirves estáticos desde el backend)
 */
export function getApiOrigin() {
  const base = import.meta.env.VITE_API_URL ?? "/api";
  if (/^https?:\/\//i.test(base)) {
    try {
      return new URL(base).origin;
    } catch {
      return "";
    }
  }
  return window.location.origin;
}

export function toAbsoluteUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return getApiOrigin() + path; // p.ej. http://localhost:4000 + /static/...
}
