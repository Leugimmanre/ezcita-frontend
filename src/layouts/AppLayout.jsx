// src/layouts/AppLayout.jsx
import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { getBrandSettings, toAbsoluteUrl } from "@/services/brandApi";
import ThemeToggle from "@/components/ThemeToggle";
import ChangePasswordModal from "@/components/profile/ChangePasswordModal";

export default function AppLayout() {
  const [userName, setUserName] = useState("");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [brand, setBrand] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Cargar el nombre de usuario desde localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user_EzCita");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserName(user.name || "Usuario");
    } else {
      navigate("/");
    }
  }, [navigate]);

  // Cargar marca (logo, nombre, etc.) desde backend
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getBrandSettings();
        if (!mounted) return;
        setBrand(data || null);
      } catch {
        // en caso de error, deja brand en null (usaremos fallback)
        setBrand(null);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_EzCita");
    localStorage.removeItem("tenantId");
    setShowLogoutConfirm(false);
    navigate("/");
  };

  // URL de fondo desde el backend (absoluta)
  const bgUrl = brand?.hero?.url
    ? toAbsoluteUrl(brand.hero.url)
    : brand?.logo?.url
    ? toAbsoluteUrl(brand.logo.url)
    : null;
  // Nombre de marca
  const brandName = brand?.brandName || "Mi Negocio";

  return (
    <div className="flex flex-col md:flex-row h-screen">
      {/* Imagen de fondo a la izquierda (desde backend) */}
      <div
        className="h-64 md:h-auto md:w-1/3 bg-cover bg-center"
        style={
          bgUrl
            ? { backgroundImage: `url(${bgUrl})` }
            : { backgroundColor: "#111827" }
        }
      />

      {/* Contenido principal */}
      <div className="w-full md:w-2/3 px-4 sm:px-6 lg:px-10 py-6 overflow-y-auto app-surface flex flex-col">
        <header className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start mb-">
          <h1 className="text-3xl lg:text-5xl font-extrabold text-current transition-colors">
            {brandName}
          </h1>

          <div className="flex flex-col sm:items-end gap-4">
            <div className="flex flex-col sm:items-end gap-4">
              <div className="flex flex-row items-center justify-between bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg shadow-md">
                {/* Botón de cambio de tema */}
                <ThemeToggle />

                {/* Contenedor para nombre de usuario y botones */}
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Hola, {userName}
                    </p>
                  </div>

                  {/* Botón cambiar contraseña */}
                  <button
                    className="p-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer"
                    onClick={() => setShowPasswordModal(true)}
                    aria-label="Cambiar contraseña"
                    title="Cambiar contraseña"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>

                  {/* Botón de cierre de sesión con icono */}
                  <div className="relative">
                    <button
                      className={`
                                  w-10 h-10 flex items-center justify-center rounded-full
                                  transition-all duration-300 cursor-pointer
                                  ${
                                    showLogoutConfirm
                                      ? "scale-110 bg-red-100 dark:bg-gray-800"
                                      : "bg-white dark:bg-gray-800"
                                  }
                                  shadow-md hover:shadow-lg
                                  text-gray-600 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400
                                  border border-gray-200 dark:border-gray-700
                                `}
                      aria-label="Cerrar sesión"
                      onClick={() => setShowLogoutConfirm(!showLogoutConfirm)}
                    >
                      <svg
                        className={`w-5 h-5 transition-transform ${
                          showLogoutConfirm ? "rotate-90 text-red-500" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                    </button>

                    {/* Confirmación de cierre de sesión */}
                    {showLogoutConfirm && (
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-10 overflow-hidden border border-red-200 dark:border-red-500 animate-fadeIn">
                        <div className="p-4">
                          <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 font-medium">
                            ¿Estás seguro de que quieres cerrar sesión?
                          </p>
                          <div className="flex justify-end gap-2">
                            <button
                              className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded transition-colors"
                              onClick={() => setShowLogoutConfirm(false)}
                            >
                              Cancelar
                            </button>
                            <button
                              className="px-3 py-1.5 text-sm bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white rounded transition-colors"
                              onClick={handleLogout}
                            >
                              Sí, salir
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <nav className="flex flex-row gap-2 justify-center sm:justify-end">
              <Link
                to="/appointments/my-appointments"
                className="px-3 py-2 bg-blue-700 hover:bg-blue-800 text-white uppercase text-xs sm:text-sm text-center font-semibold rounded-lg transition flex-1 sm:flex-none"
              >
                Mis Citas
              </Link>
              <Link
                to="/appointments/new"
                className="px-3 py-2 bg-blue-700 hover:bg-blue-800 text-white uppercase text-xs sm:text-sm text-center font-semibold rounded-lg transition flex-1 sm:flex-none"
              >
                Nueva Cita
              </Link>
              <Link
                to="/appointments/history"
                className="px-3 py-2 bg-blue-700 hover:bg-blue-800 text-white uppercase text-xs sm:text-sm text-center font-semibold rounded-lg transition flex-1 sm:flex-none"
              >
                Histórico
              </Link>
            </nav>
          </div>
        </header>

        {/* Contenido dinámico */}
        <main className="flex-1 overflow-y-auto">
          <Outlet
            context={{
              selectedServices: location.state?.selectedServices || [],
            }}
          />
        </main>
      </div>
      {/* Modal para cambiar contraseña */}
      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
    </div>
  );
}
