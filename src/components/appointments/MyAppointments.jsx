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

  const handleEditClick = (apptId) => {
    navigate(`/appointments/edit/${apptId}`);
  };

  // Solo ocultar canceladas con >30min
  const now = new Date();
  const visibleAppointments = appointments.filter((appt) => {
    if (appt.status === "cancelled") {
      const cancelledAt = new Date(appt.updatedAt);
      const diffMinutes = (now - cancelledAt) / (1000 * 60);
      return diffMinutes < 30;
    }
    return true;
  });

  // === Clases (estructura fija, colores por tema) ===
  const containerClass = "mt-10 max-w-6xl mx-auto px-4"; // mismo en ambos temas

  const headerClass = "text-center sm:text-left mb-8"; // misma separación en ambos

  const titleClass =
    "text-4xl font-extrabold text-[var(--color-text)] dark:text-white mb-3";

  const subtitleClass =
    "text-lg text-[color:color-mix(in_oklab,var(--color-text)_80%,transparent_20%)] dark:text-white";

  const cardClass =
    "p-5 rounded-xl border shadow-sm " +
    // claro (tokens)
    "bg-[var(--color-secondary)] border-[var(--color-secondary-light)] " +
    // oscuro (tus colores)
    "dark:bg-gradient-to-r dark:from-blue-900/50 dark:to-indigo-900/50 dark:border-blue-700/50";

  const dateClass =
    "text-xl font-bold text-[var(--color-text)] dark:text-white";

  const serviceItemClass =
    "flex justify-between items-center rounded-lg " +
    "p-3 border bg-[color-mix(in_oklab,var(--color-primary)_8%,var(--color-secondary)_92%)] " +
    "border-[color-mix(in_oklab,var(--color-primary)_35%,var(--color-secondary-light)_65%)] " +
    "dark:bg-blue-800/30 dark:border-transparent";

  const serviceTextClass =
    "font-medium text-[var(--color-text)] dark:text-white";

  const durationPriceClass =
    "text-sm text-[var(--color-muted)] dark:text-blue-300";

  const totalLabelClass =
    "text-sm text-[var(--color-muted)] dark:text-blue-300";

  const totalValueClass = "font-bold text-[var(--color-text)] dark:text-white";

  const dividerClass =
    "mt-3 pt-3 border-t " +
    "border-[var(--color-secondary-light)] dark:border-blue-700/30";

  // Badges de estado (borde siempre presente para que no cambie la caja)
  const statusStyles = {
    pending:
      "border px-2 py-1 text-xs font-semibold rounded-full " +
      "bg-[color-mix(in_oklab,#f59e0b_18%,var(--color-secondary)_82%)] " + // amber
      "text-[#92400e] " +
      "border-[color-mix(in_oklab,#f59e0b_35%,var(--color-secondary-light)_65%)] " +
      "dark:bg-yellow-500/20 dark:text-yellow-400 dark:border-transparent",
    confirmed:
      "border px-2 py-1 text-xs font-semibold rounded-full " +
      "bg-[color-mix(in_oklab,#10b981_18%,var(--color-secondary)_82%)] " + // emerald
      "text-[#065f46] " +
      "border-[color-mix(in_oklab,#10b981_35%,var(--color-secondary-light)_65%)] " +
      "dark:bg-green-500/20 dark:text-green-400 dark:border-transparent",
    cancelled:
      "border px-2 py-1 text-xs font-semibold rounded-full " +
      "bg-[color-mix(in_oklab,#ef4444_18%,var(--color-secondary)_82%)] " + // red
      "text-[#991b1b] " +
      "border-[color-mix(in_oklab,#ef4444_35%,var(--color-secondary-light)_65%)] " +
      "dark:bg-red-500/20 dark:text-red-400 dark:border-transparent",
    completed:
      "border px-2 py-1 text-xs font-semibold rounded-full " +
      "bg-[color-mix(in_oklab,#3b82f6_18%,var(--color-secondary)_82%)] " + // blue
      "text-[#1e40af] " +
      "border-[color-mix(in_oklab,#3b82f6_35%,var(--color-secondary-light)_65%)] " +
      "dark:bg-blue-500/20 dark:text-blue-400 dark:border-transparent",
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-[var(--color-primary)] border-t-transparent dark:border-blue-500 dark:border-t-transparent" />
      </div>
    );
  }

  return (
    <div className={containerClass}>
      {/* Encabezado */}
      <header className={headerClass}>
        <h1 className={titleClass}>Mis Citas Programadas</h1>
        <p className={subtitleClass}>
          Revisa, gestiona o cancela tus próximas citas
        </p>
      </header>

      {/* Lista */}
      {visibleAppointments.length > 0 ? (
        <ul className="space-y-4">
          {visibleAppointments.map((appt) => {
            const apptDate = new Date(appt.date);
            const isUpcoming = apptDate > new Date();
            const badgeClass =
              statusStyles[appt.status] ?? statusStyles.pending;

            return (
              <li key={appt._id} className={cardClass}>
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className={dateClass}>
                        {apptDate.toLocaleDateString("es-ES", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </h2>
                      <span className={badgeClass}>
                        {appt.status === "pending" && "Pendiente"}
                        {appt.status === "confirmed" && "Confirmada"}
                        {appt.status === "cancelled" &&
                          "Cancelada, espera 30 min."}
                        {appt.status === "completed" && "Completada"}
                      </span>
                    </div>

                    <ul className="space-y-2">
                      {appt.services.map((service) => (
                        <li key={service._id} className={serviceItemClass}>
                          <span className={serviceTextClass}>
                            {service.name}
                          </span>
                          <div className="flex gap-4">
                            <span className={durationPriceClass}>
                              {service.duration} min.
                            </span>
                            <span className="font-bold text-[var(--color-text)] dark:text-blue-300">
                              {service.price}€
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>

                    <div className={`${dividerClass} flex justify-between`}>
                      <span className={totalLabelClass}>Duración total:</span>
                      <span className={totalValueClass}>
                        {appt.services.reduce((sum, s) => sum + s.duration, 0)}{" "}
                        min.
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={totalLabelClass}>Precio total:</span>
                      <span className={totalValueClass}>
                        {appt.services.reduce((sum, s) => sum + s.price, 0)}€
                      </span>
                    </div>
                  </div>

                  {isUpcoming &&
                    ["pending", "confirmed"].includes(appt.status) && (
                      <div className="flex flex-col sm:flex-row gap-2 justify-end">
                        <button
                          onClick={() => handleEditClick(appt._id)}
                          className="px-4 py-2 rounded-lg transition flex items-center gap-2 text-white
                                     bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)]
                                     dark:bg-blue-600 dark:hover:bg-blue-700"
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
                          className="px-4 py-2 rounded-lg transition flex items-center gap-2 text-white disabled:opacity-50
                                     bg-[var(--color-danger)] hover:bg-[var(--color-danger-hover)]
                                     dark:bg-red-600 dark:hover:bg-red-700"
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
                                />
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
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

                  {appt.status === "cancelled" && (
                    <button
                      onClick={() => handleReactivate(appt._id)}
                      className="px-4 py-2 rounded-lg transition text-white
                                 bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700"
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
        <section
          className="mt-8 p-8 rounded-xl border text-center
                     bg-[var(--color-secondary)] border-[var(--color-secondary-light)] text-[var(--color-text)]
                     dark:bg-blue-900/30 dark:border-blue-700/50 dark:text-blue-200"
        >
          <div
            className="text-[var(--color-primary)] dark:text-blue-300 mb-4"
            aria-hidden="true"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mx-auto"
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
          <h2 className="text-2xl font-bold text-[var(--color-text)] dark:text-white mb-3">
            No tienes citas programadas
          </h2>
          <p className="text-[var(--color-muted)] dark:text-blue-200 mb-6">
            Cuando reserves una cita, aparecerá aquí para que puedas gestionarla
          </p>
          <Link
            to="/appointments/new"
            className="inline-block px-4 py-2 rounded-lg transition font-medium text-white
                       bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)]
                       dark:bg-blue-600 dark:hover:bg-blue-700"
            aria-label="Reservar nueva cita"
          >
            Reservar nueva cita
          </Link>
        </section>
      )}
    </div>
  );
}
