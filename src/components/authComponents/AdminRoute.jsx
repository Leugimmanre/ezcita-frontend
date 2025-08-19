
// src/components/authComponents/AdminRoute.jsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import { getStoredUser } from "@/utils/userStorage";

export default function AdminRoute({ children }) {
  const location = useLocation();
  const user = getStoredUser();

  if (!user || user.role !== "admin") {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  // Primero valida sesión (token), luego rol
  return <ProtectedRoute>{children ? children : <Outlet />}</ProtectedRoute>;
}
