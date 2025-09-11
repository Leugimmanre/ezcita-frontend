// src/services/brandApi.js
import api from "@/lib/axios";

/** Get brand settings for current tenant */
export async function getBrandSettings() {
  const { data } = await api.get("/brand");
  return data?.data ?? null;
}

/** Upsert brand settings
 * payload: { brandName, brandDomain, contactEmail, timezone, frontendUrl }
 */
export async function updateBrandSettings(payload) {
  const { data } = await api.put("/brand", payload);
  return data?.data ?? null;
}

/** Upload/replace logo (FormData field: "logo") */
export async function uploadBrandLogo(file) {
  const fd = new FormData();
  fd.set("logo", file);
  const { data } = await api.post("/brand/logo", fd); // no fuerces Content-Type
  return data?.data ?? null;
}

/** Delete logo */
export async function deleteBrandLogo() {
  const { data } = await api.delete("/brand/logo");
  return data;
}

/** Upload/replace hero (FormData field: "hero") */
export async function uploadBrandHero(file) {
  const fd = new FormData();
  fd.set("hero", file);
  const { data } = await api.post("/brand/hero", fd);
  return data?.data ?? null;
}

/** Delete hero */
export async function deleteBrandHero() {
  const { data } = await api.delete("/brand/hero");
  return data;
}

/** ─────────────────────────────────────────────
 * URL helpers (necesarios por AppLayout.jsx)
 * ─────────────────────────────────────────────
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
  // fallback al mismo origen del navegador
  return typeof window !== "undefined" ? window.location.origin : "";
}

export function toAbsoluteUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return getApiOrigin() + path; // ej. http://localhost:4000 + /static/...
}
