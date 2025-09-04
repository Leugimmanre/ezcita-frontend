// src/components/settingsComponents/UserForm.jsx
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Esquemas
const createUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  lastname: z.string().optional(),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Min 6 characters").optional(),
  admin: z.boolean().optional().default(false),
  verified: z.boolean().optional().default(false),
});

const updateUserSchema = createUserSchema.extend({
  password: z.string().min(6, "Min 6 characters").optional(),
});

export default function UserForm({
  mode,
  defaultValues,
  onSubmit,
  isSubmitting,
}) {
  const schema = mode === "create" ? createUserSchema : updateUserSchema;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });

  useEffect(() => {
    if (defaultValues) reset(defaultValues);
  }, [defaultValues, reset]);

  const showPassword = mode === "create";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Nombre */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Nombre <span className="text-red-500">*</span>
        </label>
        <input
          className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 ${
            errors.name ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="Ingresa el nombre"
          {...register("name")}
        />
        {errors.name && (
          <p className="mt-1.5 text-red-600 text-sm flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {String(errors.name.message)}
          </p>
        )}
      </div>

      {/* Apellidos */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Apellidos
        </label>
        <input
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
          placeholder="Ingresa los apellidos"
          {...register("lastname")}
        />
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 ${
            errors.email ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="ejemplo@correo.com"
          {...register("email")}
        />
        {errors.email && (
          <p className="mt-1.5 text-red-600 text-sm flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {String(errors.email.message)}
          </p>
        )}
      </div>

      {/* Password: solo crear (en editar lo dejamos opcional/oculto) */}
      {showPassword && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Contraseña <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 ${
              errors.password ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Mínimo 6 caracteres"
            {...register("password")}
          />
          {errors.password && (
            <p className="mt-1.5 text-red-600 text-sm flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {String(errors.password.message)}
            </p>
          )}
        </div>
      )}

      {/* Admin & Verified */}
      <div className="flex items-center gap-8 py-2">
        <label className="inline-flex items-center gap-2.5 cursor-pointer">
          <div className="relative inline-flex items-center">
            <input
              type="checkbox"
              className="sr-only peer"
              {...register("admin")}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </div>
          <span className="text-sm font-medium text-gray-700">
            Administrador
          </span>
        </label>

        <label className="inline-flex items-center gap-2.5 cursor-pointer">
          <div className="relative inline-flex items-center">
            <input
              type="checkbox"
              className="sr-only peer"
              {...register("verified")}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
          </div>
          <span className="text-sm font-medium text-gray-700">Verificado</span>
        </label>
      </div>

      <div className="pt-4 border-t border-gray-100">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isSubmitting ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
              {mode === "create" ? "Creando..." : "Guardando..."}
            </>
          ) : mode === "create" ? (
            "Crear usuario"
          ) : (
            "Guardar cambios"
          )}
        </button>
      </div>
    </form>
  );
}
