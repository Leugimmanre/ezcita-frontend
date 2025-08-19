// src/components/authComponents/ProtectedRoute.jsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getToken, clearToken } from "@/utils/authStorage";
import { isTokenValid } from "@/utils/jwt";
import { clearStoredUser } from "@/utils/userStorage";

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const token = getToken();

  if (!isTokenValid(token)) {
    // Limpieza defensiva por si el token expiró
    clearToken();
    clearStoredUser();
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  // Permite dos modos: wrapper o padre con Outlet
  return children ? children : <Outlet />;
}
