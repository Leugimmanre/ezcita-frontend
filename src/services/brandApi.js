// Código en inglés; comentarios en español
import api from "@/lib/axios";

export async function getBrandSettings() {
  const { data } = await api.get("/brand");
  return data?.data ?? null;
}

export async function updateBrandSettings(payload) {
  const { data } = await api.put("/brand", payload);
  return data?.data ?? null;
}

export async function uploadBrandLogo(file) {
  const form = new FormData();
  form.append("logo", file);
  const { data } = await api.post("/brand/logo", form);
  return data?.data ?? null;
}

export async function deleteBrandLogo() {
  const { data } = await api.delete("/brand/logo");
  return data;
}

export async function uploadBrandHero(file) {
  const form = new FormData();
  form.append("hero", file);
  const { data } = await api.post("/brand/hero", form);
  return data?.data ?? null;
}

export async function deleteBrandHero() {
  const { data } = await api.delete("/brand/hero");
  return data;
}
