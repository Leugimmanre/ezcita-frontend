// src/components/authComponents/ForgotPassword.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "@/services/authAPI";
import ForgotPasswordForm from "./authForms/ForgotPasswordForm";

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async ({ email }) => {
    setLoading(true);
    setError("");
    try {
      const response = await authAPI.forgotPassword(email);
      if (response?.success !== false) {
        setSuccess(true);
      } else {
        setError(response?.message || "Error al enviar el enlace");
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Error al solicitar restablecimiento"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 shadow-xl rounded-lg">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Restablecer contraseña
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {success
              ? "Revisa tu correo para continuar con el proceso"
              : "Ingresa tu correo para recibir un enlace de restablecimiento"}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {success ? (
          <div className="text-center">
            <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md">
              Se ha enviado un enlace a tu correo para restablecer tu
              contraseña.
            </div>
            <button
              onClick={() => navigate("/")}
              className="mt-4 w-full py-2 px-4 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Volver al inicio de sesión
            </button>
          </div>
        ) : (
          <ForgotPasswordForm onSubmit={handleSubmit} loading={loading} />
        )}
      </div>
    </div>
  );
}
