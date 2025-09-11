// src/lib/publicApi.js
import axios from "axios";

const publicApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "/api", // base del backend
  withCredentials: false, // no enviar cookies en llamadas públicas
  headers: { Accept: "application/json" },
  timeout: 30000,
});

export default publicApi;
