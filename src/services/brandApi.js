// src/services/brandApi.js
import api from "@/lib/axios";

// Obtiene la configuración de marca del tenant actual
export async function getBrandSettings() {
  const { data } = await api.get("/brand");
  return data?.data ?? null;
}

// Actualiza (upsert) marca
export async function updateBrandSettings(payload) {
  // payload: { brandName, brandDomain, contactEmail, timezone, frontendUrl }
  const { data } = await api.put("/brand", payload);
  return data?.data ?? null;
}

// Sube o reemplaza el logo (una sola imagen)
export async function uploadBrandLogo(file) {
  const form = new FormData();
  form.append("logo", file);
  const { data } = await api.post("/brand/logo", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data?.data ?? null; // { url, filename, mimetype, size, absoluteUrl? }
}

// Elimina el logo actual
export async function deleteBrandLogo() {
  const { data } = await api.delete("/brand/logo");
  return data;
}

//
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

//
export function toAbsoluteUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return getApiOrigin() + path; // p.ej. http://localhost:4000 + /static/...
}

