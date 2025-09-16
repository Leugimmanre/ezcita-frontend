// src/components/authComponents/Login.jsx
import React from "react";
import LoginForm from "./authForms/LoginForm";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "@/services/userAPI";
import { toast } from "react-toastify";

export default function Login() {
  const navigate = useNavigate();

  const handleLoginSubmit = async (data) => {
    try {
      const userData = await loginUser(data);

      // Guardar datos del usuario para AppLayout
      localStorage.setItem("user_EzCita", JSON.stringify(userData));

      toast.success(`¡Hola ${userData.name} ${userData.lastname}! Es un placer verte de nuevo.`);

      // Redirigir según el rol
      if (userData.role === "admin") {
        navigate("/settings");
      } else {
        navigate("/appointments/my-appointments");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error al iniciar sesión");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex-grow flex items-center justify-center">
        <div className="max-w-md w-full bg-white p-8 shadow-lg rounded-lg">
          <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-6">
            Inicio de Sesión
          </h2>
          <LoginForm onSubmit={handleLoginSubmit} />

          {/* <div className="mt-4 text-center">
            <Link
              to="/forgot-password"
              className="text-blue-600 hover:underline text-sm"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div> */}
        </div>
      </div>

      {/* Footer agregado */}
      <footer className="py-4 bg-gray-50 border-t border-gray-100">
        <div className="text-center text-gray-600 text-sm">
          <p>
            © {new Date().getFullYear()} EzCita. Todos los derechos reservados.
          </p>
          <p className="mt-1 text-blue-600 font-medium">
            Gestionando tus citas de forma sencilla
          </p>
        </div>
      </footer>
    </div>
  );
}
