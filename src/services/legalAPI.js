// src/services/legalAPI.js
// Servicio para leer/actualizar documentos legales (términos y privacidad)
import api from "@/lib/axios";

// Claves para cache local opcional
const CACHE_KEYS = {
  terms: "legal:terms",
  privacy: "legal:privacy",
};

// Obtiene un doc legal público por tipo ("terms" | "privacy")
export async function getLegalDoc(type) {
  try {
    const { data } = await api.get(`/legal/${type}`, {
      __skipAuthRedirect: true, // ← respeta tu interceptor
    });
    // Guardar cache local (opcional)
    localStorage.setItem(CACHE_KEYS[type], JSON.stringify(data));
    return data;
  } catch {
    // fallback de cache si hay (sin romper la UX pública)
    const cached = localStorage.getItem(CACHE_KEYS[type]);
    if (cached) return JSON.parse(cached);
    // Si no hay doc aún, devolvemos un esqueleto
    return {
      type,
      content: "",
      version: "1.0",
      effectiveDate: new Date().toISOString(),
      updatedAt: null,
      updatedBy: null,
    };
  }
}

// Actualiza/crea un doc legal (requiere admin y auth en backend)
export async function updateLegalDoc({
  type,
  content,
  version,
  effectiveDate,
}) {
  const payload = {
    content: content ?? "",
    version: version ?? "1.0",
    effectiveDate: effectiveDate ?? new Date().toISOString().slice(0, 10),
  };
  const { data } = await api.put(`/legal/${type}`, payload, {
    __skipAuthRedirect: true,
  });
  localStorage.setItem(CACHE_KEYS[type], JSON.stringify(data));
  return data;
}
