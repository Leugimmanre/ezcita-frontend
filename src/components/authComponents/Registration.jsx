// src/components/authComponents/Registration.jsx
import { APP_NAME } from "@/data/index";
import { useDocumentTitle } from "@/hooks/title";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import RegisterForm from "./authForms/RegisterForm";
import { authAPI } from "@/services/authAPI";
import { getTenantId, setTenantId } from "@/utils/tenantStorage";

export default function Registration() {
  useDocumentTitle(`Registro | ${APP_NAME}`);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegistrationSubmit = async (data) => {
    setLoading(true);
    setError("");
    if (!getTenantId()) {
      setTenantId(import.meta.env.VITE_TENANT_ID || "default");
    }

    try {
      const payload = {
        name: data.name,
        lastname: data.lastname,
        email: data.email.toLowerCase().trim(),
        password: data.password,
      };

      const response = await authAPI.register(payload);

      if (response?.success) {
        navigate("/verify"); // vista de verificación por token
      } else {
        setError(response?.message || "Error en el registro");
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Error al registrar el usuario"
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
            Crear una cuenta
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            ¿Ya tienes cuenta?{" "}
            <Link
              to="/"
              className="font-medium text-green-600 hover:text-green-500"
            >
              Inicia sesión
            </Link>
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <RegisterForm onSubmit={handleRegistrationSubmit} loading={loading} />

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            Al registrarte, aceptas nuestras{" "}
            <Link
              to="/privacy-policy"
              href="#"
              className="font-medium text-green-600 hover:text-green-500"
            >
              Políticas de Privacidad
            </Link>{" "}
            y{" "}
            <Link
              to="/terms-of-service"
              href="#"
              className="font-medium text-green-600 hover:text-green-500"
            >
              Términos de Uso
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
