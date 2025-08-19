import { useAppointmentsData } from "@/hooks/useAppointmentsData";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { reactivateAppointment } from "@/services/appointmentsAPI";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";

export default function MyAppointments() {
  const { appointments, isLoading, cancelAppointment } = useAppointmentsData();
  const [cancellingId, setCancellingId] = useState(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleCancel = async (id) => {
    setCancellingId(id);
    try {
      await cancelAppointment(id);
      toast.success("Cita cancelada exitosamente");
    } finally {
      setCancellingId(null);
    }
  };

  // Función para manejar la reactivación de citas
  const handleReactivate = async (id) => {
    try {
      await reactivateAppointment(id);
      toast.success("Cita reactivada exitosamente");
      queryClient.invalidateQueries(["appointments"]);
    } catch (error) {
      console.error("Error al reactivar la cita:", error);
      toast.error("Error al reactivar la cita");
    }
  };

  // Función para manejar el clic en editar
  const handleEditClick = (apptId) => {
    navigate(`/appointments/edit/${apptId}`);
  };

  // Filtrar citas para mostrar solo las que no han sido canceladas hace más de 30 minutos
  const now = new Date();
  const visibleAppointments = appointments.filter((appt) => {
    if (appt.status === "cancelled") {
      const cancelledAt = new Date(appt.updatedAt); // usamos updatedAt de Mongo
      const diffMinutes = (now - cancelledAt) / (1000 * 60);
      return diffMinutes < 30; // mostrar solo si han pasado menos de 30 minutos
    }
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="mt-10 max-w-6xl mx-auto px-4">
      {/* Encabezado */}
      <header className="text-center sm:text-left mb-10">
        <h1 className="text-4xl font-extrabold text-white mb-3">
          Mis Citas Programadas
        </h1>
        <p className="text-lg text-white">
          Revisa, gestiona o cancela tus próximas citas
        </p>
      </header>

      {/* Lista de citas */}
      {visibleAppointments.length > 0 ? (
        <ul className="space-y-4">
          {visibleAppointments.map((appt) => {
            const apptDate = new Date(appt.date);
            const isUpcoming = apptDate > new Date();
            const statusColor = {
              pending: "bg-yellow-500/20 text-yellow-400",
              confirmed: "bg-green-500/20 text-green-400",
              cancelled: "bg-red-500/20 text-red-400",
              completed: "bg-blue-500/20 text-blue-400",
            }[appt.status];

            return (
              <li
                key={appt._id}
                className="p-5 bg-gradient-to-r from-blue-900/50 to-indigo-900/50 rounded-xl border border-blue-700/50"
              >
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-xl font-bold text-white">
                        {apptDate.toLocaleDateString("es-ES", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </h2>
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColor}`}
                      >
                        {appt.status === "pending" && "Pendiente"}
                        {appt.status === "confirmed" && "Confirmada"}
                        {appt.status === "cancelled" && "Cancelada, espera 30 min."}
                        {appt.status === "completed" && "Completada"}
                      </span>
                    </div>

                    <ul className="space-y-2">
                      {appt.services.map((service) => (
                        <li
                          key={service._id}
                          className="flex justify-between items-center p-2 bg-blue-800/30 rounded-lg"
                        >
                          <span className="font-medium text-white">
                            {service.name}
                          </span>
                          <div className="flex gap-4">
                            <span className="text-sm text-blue-300">
                              {service.duration} min.
                            </span>
                            <span className="font-bold text-blue-300">
                              {service.price}€
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-3 pt-3 border-t border-blue-700/30 flex justify-between">
                      <span className="text-sm text-blue-300">
                        Duración total:
                      </span>
                      <span className="font-bold text-white">
                        {appt.services.reduce((sum, s) => sum + s.duration, 0)}{" "}
                        min.
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-blue-300">
                        Precio total:
                      </span>
                      <span className="font-bold text-white">
                        {appt.services.reduce((sum, s) => sum + s.price, 0)}€
                      </span>
                    </div>
                  </div>

                  {isUpcoming &&
                    ["pending", "confirmed"].includes(appt.status) && (
                      <div className="flex flex-col sm:flex-row gap-2 justify-end">
                        <button
                          onClick={() => handleEditClick(appt._id)} // Pasamos solo el ID
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition flex items-center gap-2"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                          Editar
                        </button>
                        <button
                          onClick={() => handleCancel(appt._id)}
                          disabled={cancellingId === appt._id}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition flex items-center gap-2 disabled:opacity-50"
                        >
                          {cancellingId === appt._id ? (
                            <>
                              <svg
                                className="animate-spin h-4 w-4 text-white"
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
                              Cancelando...
                            </>
                          ) : (
                            <>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              Cancelar
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  {/* Botón para reactivar citas canceladas */}
                  {appt.status === "cancelled" && (
                    <button
                      onClick={() => handleReactivate(appt._id)}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
                    >
                      Reactivar
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <section className="mt-8 p-6 bg-blue-900/30 rounded-xl border border-blue-700/50 text-center">
          <div className="text-blue-300 mb-3" aria-hidden="true">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">
            No tienes citas programadas
          </h2>
          <p className="text-blue-200">
            Cuando reserves una cita, aparecerá aquí para que puedas gestionarla
          </p>
          <Link
            to="/appointments/new"
            className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            aria-label="Reservar nueva cita"
          >
            Reservar nueva cita
          </Link>
        </section>
      )}
    </div>
  );
}
