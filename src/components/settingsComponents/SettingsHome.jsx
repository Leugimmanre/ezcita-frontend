// src/pages/settings/SettingsHome.jsx
import { Link } from "react-router-dom";
import { CogIcon, ClockIcon } from "@heroicons/react/24/outline";
import { settingCategories } from "@/data/index";
import { Navigate, Outlet } from "react-router-dom";
import { useRecentActivity } from "@/hooks/useActivity";
import { timeAgo } from "@/utils/timeAgo";

export default function SettingsHome() {
  // Datos de actividad reciente
  const { data, isLoading, isError, refetch, isFetching } =
    useRecentActivity(8);
  const lastUpdateAt = data?.lastUpdateAt || null;
  const items = data?.items || [];
  // Verifica rol de usuario
  const userData = JSON.parse(localStorage.getItem("user_EzCita"));
  if (!userData || userData.role !== "admin") {
    return <Navigate to="/appointments/my-appointments" replace />;
  }

  return (
    <div className="bg-gray-5 min-h-screen max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
          <p className="mt-2 text-lg text-gray-600">
            Administra todas las configuraciones de tu negocio en un solo lugar
          </p>
        </div>
        {/* Última actualización (dinámica) */}
        <div className="bg-gray-100 p-4 rounded-lg flex items-center">
          <CogIcon className="h-10 w-10 text-gray-500 mr-3" />
          <div>
            <p className="text-sm font-medium text-gray-500">
              Última actualización
            </p>
            {isLoading ? (
              <p className="font-semibold animate-pulse text-gray-400">
                Cargando…
              </p>
            ) : lastUpdateAt ? (
              <p className="font-semibold">{timeAgo(lastUpdateAt)}</p>
            ) : (
              <p className="font-semibold text-gray-500">
                Sin cambios recientes
              </p>
            )}
            <button
              onClick={() => refetch()}
              className="mt-1 text-xs text-blue-600 hover:text-blue-800"
              disabled={isFetching}
            >
              {isFetching ? "Actualizando…" : "Actualizar"}
            </button>
          </div>
        </div>
      </div>

      {/* Consejo de Configuración */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
          <h2 className="text-xl font-bold mb-2">Consejo de Configuración</h2>
          <p className="mb-4">
            Configura tus horarios primero para asegurar que tus clientes solo
            puedan reservar en los momentos disponibles.
          </p>
          <Link
            to="/settings/generate-time-slots"
            className="inline-flex items-center px-4 py-2 bg-white text-blue-600 font-medium rounded-md hover:bg-blue-50"
          >
            Configurar Horarios
            <ClockIcon className="ml-2 h-5 w-5" />
          </Link>
        </div>

        {/* Cambios recientes (dinámico) con altura limitada */}
        <div className="bg-white rounded-xl p-6 shadow flex flex-col h-50">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              Cambios Recientes
            </h3>
            <button
              onClick={() => refetch()}
              className="text-sm font-medium text-blue-600 hover:text-blue-800"
              disabled={isFetching}
            >
              {isFetching ? "Actualizando…" : "Actualizar"}
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {" "}
            {/* Contenedor con scroll */}
            {isLoading ? (
              <ul className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <li
                    key={i}
                    className="animate-pulse h-10 bg-gray-100 rounded"
                  />
                ))}
              </ul>
            ) : isError ? (
              <p className="text-sm text-red-600">
                No se pudo cargar la actividad. Intenta de nuevo.
              </p>
            ) : items.length === 0 ? (
              <p className="text-sm text-gray-500">
                Aún no hay cambios registrados.
              </p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {items.map((item) => (
                  <li key={item._id} className="py-2 flex items-center">
                    <div className="bg-gray-100 p-2 rounded-lg mr-3">
                      <CogIcon className="h-5 w-5 text-gray-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.action}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {item.category} — por {item.userName || "Sistema"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">
                        {timeAgo(item.createdAt)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Secciones de Configuración */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Secciones de Configuración
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {settingCategories.map((category) => (
            <Link
              key={category.id}
              to={category.path}
              className={`flex flex-col p-6 rounded-xl border transition-all duration-200 transform hover:-translate-y-1 hover:shadow-lg ${category.color}`}
            >
              <div className="flex items-center mb-4">
                <div className="mr-3">{category.icon}</div>
                <h3 className="text-lg font-semibold">{category.title}</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                {category.description}
              </p>
              <div className="mt-auto text-sm font-medium flex items-center">
                Administrar
                <svg
                  className="ml-1 w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  ></path>
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-12 bg-white rounded-xl p-6 shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            ¿Necesitas ayuda?
          </h3>
          <button className="text-sm font-medium text-blue-600 hover:text-blue-800">
            Ver todos los recursos
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4">
            <div className="text-blue-500 mb-2">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </div>
            <h4 className="font-medium text-gray-900 mb-1">
              Preguntas Frecuentes
            </h4>
            <p className="text-sm text-gray-600">
              Encuentra respuestas a preguntas comunes
            </p>
          </div>
          <div className="border rounded-lg p-4">
            <div className="text-green-500 mb-2">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                ></path>
              </svg>
            </div>
            <h4 className="font-medium text-gray-900 mb-1">Soporte en Vivo</h4>
            <p className="text-sm text-gray-600">
              Chatea con nuestro equipo de soporte
            </p>
          </div>
          <div className="border rounded-lg p-4">
            <div className="text-purple-500 mb-2">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                ></path>
              </svg>
            </div>
            <h4 className="font-medium text-gray-900 mb-1">Guías de Usuario</h4>
            <p className="text-sm text-gray-600">
              Documentación detallada paso a paso
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
