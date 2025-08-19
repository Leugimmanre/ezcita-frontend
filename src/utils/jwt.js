// src/utils/jwt.js
const b64urlToB64 = (str) =>
  str.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (str.length % 4)) % 4);

export const parseJwt = (token) => {
  try {
    const base64 = b64urlToB64(token.split(".")[1] || "");
    const json = atob(base64);
    return JSON.parse(json);
  } catch {
    return null;
  }
};

export const isTokenExpired = (token, skewMs = 30000) => { // 30s de margen
  const payload = parseJwt(token);
  if (!payload?.exp) return true;
  return payload.exp * 1000 < Date.now() + skewMs;
};

export const isTokenValid = (token) => Boolean(token) && !isTokenExpired(token);
