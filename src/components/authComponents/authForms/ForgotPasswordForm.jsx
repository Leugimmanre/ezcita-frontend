// src/components/authComponents/authForms/ForgotPasswordForm.jsx
import React from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";

export default function ForgotPasswordForm({ onSubmit, loading }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="email" className="block mb-1 font-medium">
          Correo Electrónico
        </label>
        <input
          id="email"
          type="email"
          {...register("email", {
            required: "El email es obligatorio",
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "Email inválido",
            },
          })}
          className="w-full px-3 py-2 border rounded-md"
          placeholder="usuario@ejemplo.com"
          disabled={loading}
        />
        {errors.email && (
          <p className="mt-1 text-red-500 text-sm">{errors.email.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full py-2 px-4 rounded-md transition font-bold uppercase cursor-pointer ${
          loading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 text-white"
        }`}
      >
        {loading ? "Enviando..." : "Enviar enlace de recuperación"}
      </button>

      <div className="mt-4 text-center text-sm">
        <p>
          ¿Recordaste tu contraseña?{" "}
          <Link
            to="/"
            className="font-medium text-blue-600 hover:underline"
          >
            Inicia sesión
          </Link>
        </p>
      </div>
    </form>
  );
}
