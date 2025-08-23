// src/layouts/AppLayout.jsx
import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { getBrandSettings, toAbsoluteUrl } from "@/services/brandApi";

export default function AppLayout() {
  const [userName, setUserName] = useState("");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [brand, setBrand] = useState(null); // { brandName, logo:{url,...}, ... }
  const navigate = useNavigate();
  const location = useLocation();

  // Cargar el nombre de usuario desde localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user_BarberShop");
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
    localStorage.removeItem("user_BarberShop");
    localStorage.removeItem("tenantId");
    setShowLogoutConfirm(false);
    navigate("/");
  };

  // URL de fondo desde el backend (absoluta)
  const bgUrl = brand?.logo?.url ? toAbsoluteUrl(brand.logo.url) : null;
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
            : { backgroundColor: "#111827" } // fallback si no hay logo
        }
      />

      {/* Contenido principal */}
      <div className="w-full md:w-2/3 px-4 sm:px-6 lg:px-10 py-6 overflow-y-auto bg-gray-900 text-white flex flex-col">
        {/* Encabezado */}
        <header className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start mb-6">
          <h1 className="text-3xl lg:text-5xl font-extrabold">
            {brandName}
          </h1>

          <div className="flex flex-col sm:items-end gap-4">
            <div className="flex sm:flex-row items-start justify-between sm:items-center gap-3 bg-gray-800 p-3 rounded-lg shadow-md">
              <div className="text-left sm:text-right">
                <p className="text-sm text-gray-300">Bienvenido, {userName}</p>
              </div>
              {/* Botón de cierre de sesión con icono */}
              <div className="relative">
                <button
                  className={`
                    w-10 h-10 flex items-center justify-center rounded-full
                    transition-all duration-300 cursor-pointer
                    ${showLogoutConfirm ? "scale-110" : ""}
                    shadow-lg
                  `}
                  aria-label="Cerrar sesión"
                  onClick={() => setShowLogoutConfirm(!showLogoutConfirm)}
                >
                  <svg
                    className={`w-5 h-5 transition-transform ${
                      showLogoutConfirm ? "rotate-90" : ""
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
                  <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-xl z-10 overflow-hidden border border-red-500">
                    <div className="p-4">
                      <p className="text-sm text-gray-300 mb-2">
                        ¿Cerrar sesión?
                      </p>
                      <div className="flex justify-end gap-2">
                        <button
                          className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded transition"
                          onClick={() => setShowLogoutConfirm(false)}
                        >
                          Cancelar
                        </button>
                        <button
                          className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 rounded transition"
                          onClick={handleLogout}
                        >
                          Sí
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <nav className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Link
                to="/appointments/my-appointments"
                className="px-4 py-4 sm:py-2 bg-blue-700 hover:bg-blue-800 text-white uppercase text-sm text-center font-semibold rounded-lg transition"
              >
                Mis Citas
              </Link>
              <Link
                to="/appointments/new"
                className="px-4 py-4 sm:py-2 bg-blue-700 hover:bg-blue-800 text-white uppercase text-sm text-center font-semibold rounded-lg transition"
              >
                Nueva Cita
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
    </div>
  );
}
