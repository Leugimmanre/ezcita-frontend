// src/components/authComponents/Verify.jsx
import React, { useState } from "react";
import { authAPI } from "@/services/authAPI";
import { Link } from "react-router-dom";

export default function Verify() {
  // Estado: verificación
  const [token, setToken] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);

  // Estado: reenviar código
  const [showResend, setShowResend] = useState(false);
  const [email, setEmail] = useState("");
  const [resendMsg, setResendMsg] = useState("");
  const [resendErr, setResendErr] = useState("");
  const [resending, setResending] = useState(false);

  // Enviar token para confirmar
  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setErr("");
    setVerifying(true);
    try {
      const res = await authAPI.confirmAccount(token);
      if (res?.success === false) {
        setErr(res?.message || "No se pudo verificar la cuenta");
      } else {
        setMsg("¡Cuenta verificada correctamente!");
        setIsVerified(true);
      }
    } catch (error) {
      setErr(
        error?.response?.data?.message || error?.message || "Error al verificar"
      );
    } finally {
      setVerifying(false);
    }
  };

  // Reenviar código por email
  const onResend = async (e) => {
    e.preventDefault();
    setResendMsg("");
    setResendErr("");
    setResending(true);
    try {
      const res = await authAPI.resendToken(email);
      if (res?.success === false) {
        setResendErr(res?.message || "No se pudo reenviar el código");
      } else {
        setResendMsg("Si el correo existe, se envió un nuevo código.");
      }
    } catch (error) {
      setResendErr(
        error?.response?.data?.message ||
          error?.message ||
          "Error al reenviar el código"
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6">
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg w-full max-w-md">
        <div className="text-center mb-6">
          <div className="mx-auto bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full p-3 w-16 h-16 flex items-center justify-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-indigo-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Verificar cuenta</h2>
          <p className="text-gray-600 mt-2">
            {isVerified
              ? "Tu cuenta ha sido verificada exitosamente"
              : "Introduce el código de verificación que recibiste por correo"}
          </p>
        </div>

        {!isVerified ? (
          <>
            {/* Formulario de verificación */}
            <form onSubmit={onSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="token"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Código de verificación
                </label>
                <div className="relative">
                  <input
                    id="token"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm"
                    placeholder="Pega aquí el token del email"
                    required
                    autoFocus
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={verifying || !token.trim()}
                className={`w-full text-white font-medium py-3 px-4 rounded-lg transition duration-300 flex justify-center items-center ${
                  verifying
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-md hover:shadow-lg"
                }`}
              >
                {verifying ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Verificando...
                  </>
                ) : (
                  "Verificar cuenta"
                )}
              </button>

              {err && (
                <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{err}</span>
                </div>
              )}
            </form>

            {/* Toggle para mostrar/ocultar el bloque de reenvío */}
            <div className="mt-6 text-center text-sm text-gray-600">
              <span>¿No recibiste el código? </span>
              <button
                type="button"
                onClick={() => setShowResend((v) => !v)}
                className="text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
              >
                {showResend ? "Ocultar" : "Reenviar código"}
              </button>
            </div>

            {/* Bloque colapsable de reenvío */}
            {showResend && (
              <form
                onSubmit={onResend}
                className="mt-4 space-y-4 border border-gray-200 rounded-lg p-4 bg-gray-50"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Correo electrónico
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value.trim())}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                      placeholder="usuario@ejemplo.com"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={resending || !email}
                  className={`w-full text-white font-medium py-3 px-4 rounded-lg transition duration-300 flex justify-center items-center ${
                    resending
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-md hover:shadow-lg"
                  }`}
                >
                  {resending ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Enviando...
                    </>
                  ) : (
                    "Enviar nuevo código"
                  )}
                </button>

                {resendMsg && (
                  <div className="p-3 bg-green-50 text-green-700 rounded-lg border border-green-200 flex items-start">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>{resendMsg}</span>
                  </div>
                )}
                {resendErr && (
                  <div className="p-3 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-start">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>{resendErr}</span>
                  </div>
                )}
              </form>
            )}
          </>
        ) : (
          <div className="text-center animate-fadeIn">
            <div className="p-4 bg-green-50 text-green-700 rounded-lg border border-green-200 mb-6 flex flex-col items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-green-500 mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="font-medium">{msg}</p>
            </div>

            <div className="mt-6">
              <Link
                to="/"
                className="inline-block w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-medium py-3 px-4 rounded-lg transition duration-300 shadow-md hover:shadow-lg"
              >
                Iniciar sesión
              </Link>
            </div>

            <div className="mt-4 text-sm text-gray-600">
              <p>
                ¿Tienes problemas?{" "}
                <Link
                  to="/support"
                  className="text-indigo-600 hover:underline font-medium"
                >
                  Contacta con soporte
                </Link>
              </p>
            </div>
          </div>
        )}

        <div className="mt-8 text-center pt-6 border-t border-gray-200">
          <p className="text-gray-600">
            ¿Ya tienes cuenta?{" "}
            <Link
              to="/"
              className="text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
            >
              Iniciar sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
