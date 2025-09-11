// src/layouts/AppointmentsLayout.jsx
import { Outlet } from "react-router-dom";

export default function AppointmentsLayout() {
  return (
    <div className="p-6">
      <Outlet />
    </div>
  );
}
