// src/layouts/SettingsLayout.jsx
import React, { useState } from "react";
import {
  Link,
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  XMarkIcon,
  Bars3Icon,
  CalendarIcon,
  ArrowRightEndOnRectangleIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { navigation } from "../data";
import { useAuthUser } from "@/hooks/useAuthUser";

const SettingsLayout = () => {
  // Estado para el sidebar móvil
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoading } = useAuthUser();

  const userData = JSON.parse(localStorage.getItem("user_EzCita"));

  if (!userData || userData.role !== "admin") {
    return <Navigate to="/appointments/my-appointments" replace />;
  }

  const isActive = (href) => {
    if (href === "/settings") {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  const handleLogout = () => {
    // Eliminar token de autenticación y datos de usuario
    localStorage.removeItem("token");
    localStorage.removeItem("user_EzCita");
    localStorage.removeItem("tenantId");

    // Redirigir a la página de login
    navigate("/");
  };

  return (
    <div className="flex h-screen">
      {/* Mobile sidebar */}
      <div
        className={`fixed inset-0 z-40 md:hidden ${
          sidebarOpen ? "block" : "hidden"
        }`}
      >
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75"
          onClick={() => setSidebarOpen(false)}
        ></div>
        <div className="relative flex flex-col flex-1 w-64 max-w-xs bg-white">
          <div className="absolute top-0 right-0 pt-2 -mr-12">
            <button
              type="button"
              className="flex items-center justify-center w-10 h-10 ml-1 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sr-only">Close sidebar</span>
              <XMarkIcon className="w-6 h-6 text-white" aria-hidden="true" />
            </button>
          </div>
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <div className="w-auto h-8 text-2xl font-bold text-indigo-600">
                EZCita
              </div>
            </div>
            <nav className="px-2 mt-5 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-2 py-2 text-base font-medium rounded-md group ${
                    isActive(item.href)
                      ? "bg-indigo-100 text-indigo-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <item.icon
                    className={`mr-4 flex-shrink-0 h-6 w-6 ${
                      isActive(item.href)
                        ? "text-indigo-500"
                        : "text-gray-400 group-hover:text-gray-500"
                    }`}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          {/* Sección de usuario para móvil */}
          <div className="px-4 py-4 border-t border-gray-200">
            <div className="flex items-center mb-3">
              <div className="flex-shrink-0">
                <UserCircleIcon className="h-10 w-10 rounded-full" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">
                  {isLoading ? "Cargando..." : user?.name || "Admin User"}
                </p>
                <Link
                  to="/settings/profile"
                  className="text-xs font-medium text-gray-500 hover:text-gray-700"
                >
                  Ver perfil
                </Link>
              </div>
            </div>
            {/* Nuevos elementos: Mis citas y Cerrar sesión (móvil) */}
            <div className="space-y-2">
              <Link
                to="/appointments/my-appointments"
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
              >
                <CalendarIcon className="mr-3 h-5 w-5 text-gray-400" />
                Mis citas
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
              >
                <ArrowRightEndOnRectangleIcon className="mr-3 h-5 w-5 text-gray-400" />
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex flex-col flex-grow pt-5 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <div className="w-auto h-8 text-2xl font-bold text-indigo-600">
              EZCita
            </div>
          </div>
          <div className="mt-5 flex-grow flex flex-col">
            <nav className="flex-1 px-2 pb-4 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-2 py-2 text-sm font-medium rounded-md group ${
                    isActive(item.href)
                      ? "bg-indigo-100 text-indigo-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <item.icon
                    className={`mr-3 flex-shrink-0 h-6 w-6 ${
                      isActive(item.href)
                        ? "text-indigo-500"
                        : "text-gray-400 group-hover:text-gray-500"
                    }`}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              ))}
            </nav>
            <div className="px-4 py-4 border-t border-gray-200">
              <div className="flex items-center mb-3">
                <div className="flex-shrink-0">
                  <UserCircleIcon className="h-10 w-10 rounded-full" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">
                    {isLoading ? "Cargando..." : user?.name || "Admin User"}
                  </p>
                  <Link
                    to="/settings/profile"
                    className="text-xs font-medium text-gray-500 hover:text-gray-700"
                  >
                    Ver perfil
                  </Link>
                </div>
              </div>

              {/* Nuevos elementos: Mis citas y Cerrar sesión (desktop) */}
              <div className="space-y-2">
                <Link
                  to="/appointments/my-appointments"
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
                >
                  <CalendarIcon className="mr-3 h-5 w-5 text-gray-400" />
                  Mis citas
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
                >
                  <ArrowRightEndOnRectangleIcon className="mr-3 h-5 w-5 text-gray-400" />
                  Cerrar sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 md:pl-64">
        <div className="sticky top-0 z-10 bg-white shadow-sm md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3">
          <button
            type="button"
            className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <div className="py-4">
                <div className="rounded-lg bg-white shadow-sm border border-gray-200">
                  <Outlet />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SettingsLayout;
