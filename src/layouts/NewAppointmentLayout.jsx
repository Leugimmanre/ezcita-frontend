
// src/layouts/NewAppointmentLayout.jsx
import { NavLink, Outlet } from "react-router-dom";

export default function NewAppointmentLayout() {
//   const location = useLocation();

  return (
    <>
      <nav className="my-5 flex gap-3">
        <NavLink
          to="/appointments/new"
          end
          className={({ isActive }) =>
            `flex-1 text-center p-3 uppercase font-extrabold ${
              isActive
                ? "bg-blue-500 text-white"
                : "bg-white text-blue-500 hover:bg-blue-600 hover:text-white"
            }`
          }
        >
          Servicios
        </NavLink>
        <NavLink
          to="/appointments/new/details"
          className={({ isActive }) =>
            `flex-1 text-center p-3 uppercase font-extrabold ${
              isActive
                ? "bg-blue-500 text-white"
                : "bg-white text-blue-500 hover:bg-blue-600 hover:text-white"
            }`
          }
        >
          Cita y Resumen
        </NavLink>
      </nav>

      <Outlet />
    </>
  );
}

