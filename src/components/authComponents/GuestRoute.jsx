// src/components/authComponents/GuestRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { getToken } from "@/utils/authStorage";
import { isTokenValid } from "@/utils/jwt";

// Bloquea pantallas de autentificación si ya hay sesión
export default function GuestRoute({ to = "/appointments/my-appointments", children }) {
  const token = getToken();
  if (isTokenValid(token)) {
    return <Navigate to={to} replace />;
  }
  return children ? children : <Outlet />;
}
