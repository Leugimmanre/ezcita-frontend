// src/components/appointments/MyAppointmentsHistory.jsx
import { useQuery } from "@tanstack/react-query";
import { getAppointmentsHistory } from "@/services/appointmentsAPI";
import { ClockIcon, CurrencyEuroIcon } from "@heroicons/react/24/outline";

export default function MyAppointmentsHistory() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["my-appointments-history"],
    queryFn: () => getAppointmentsHistory({ page: 1, limit: 20 }),
  });

  // === Clases (estructura fija, colores por tema) ===
  const containerClass = "max-auto mx-auto px-4";

  const headerClass = "text-center sm:text-left mb-8";

  const titleClass =
    "text-4xl font-extrabold text-[var(--color-text)] dark:text-white mb-3";

  const subtitleClass =
    "text-lg text-[color:color-mix(in_oklab,var(--color-text)_80%,transparent_20%)] dark:text-gray-300";

  const cardClass =
    "p-5 rounded-xl border shadow-sm " +
    "bg-[var(--color-secondary)] border-[var(--color-secondary-light)] " +
    "dark:bg-gradient-to-r dark:from-blue-900/50 dark:to-indigo-900/50 dark:border-blue-700/50";

  const dateClass =
    "text-xl font-bold text-[var(--color-text)] dark:text-white";

  const serviceTextClass =
    "font-medium text-[var(--color-text)] dark:text-white";

  const emptyStateClass =
    "mt-8 p-8 rounded-xl border text-center " +
    "bg-[var(--color-secondary)] border-[var(--color-secondary-light)] text-[var(--color-text)] " +
    "dark:bg-blue-900/30 dark:border-blue-700/50 dark:text-blue-200";

  const summaryCardClass =
    "p-6 rounded-xl border shadow-sm mb-6 " +
    "bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-100 " +
    "dark:from-indigo-900/30 dark:to-blue-900/30 dark:border-indigo-700/50";

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-[var(--color-primary)] border-t-transparent dark:border-blue-500 dark:border-t-transparent" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className={containerClass}>
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded dark:bg-red-900/20 dark:border-red-700">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700 dark:text-red-300">
                Error al cargar el histórico de citas
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { appointments = [] } = data || {};

  // Calcular total general
  const totalAppointments = appointments.length;
  const totalAmount = appointments.reduce((sum, appointment) => {
    return sum + (appointment.totalPrice || 0);
  }, 0);

  return (
    <div className={containerClass}>
      {/* Encabezado */}
      <header className={headerClass}>
        <h1 className={titleClass}>Histórico de Mis Citas</h1>
        <p className={subtitleClass}>Revisa todas tus citas completadas</p>
      </header>

      {/* Resumen general */}
      {appointments.length > 0 && (
        <div className={summaryCardClass}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center">
              <div className="bg-indigo-100 p-3 rounded-full dark:bg-indigo-800/50">
                <ClockIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-300" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Total de citas
                </p>
                <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">
                  {totalAppointments}
                </p>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full dark:bg-green-800/50">
                <CurrencyEuroIcon className="h-6 w-6 text-green-600 dark:text-green-300" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Total gastado
                </p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {totalAmount.toFixed(2)} €
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lista de citas */}
      {appointments.length === 0 ? (
        <section className={emptyStateClass}>
          <div
            className="text-[var(--color-primary)] dark:text-blue-300 mb-4"
            aria-hidden="true"
          >
            <ClockIcon className="h-16 w-16 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-[var(--color-text)] dark:text-white mb-3">
            Aún no tienes citas completadas
          </h2>
          <p className="text-[var(--color-muted)] dark:text-blue-200">
            Tus citas completadas aparecerán aquí
          </p>
        </section>
      ) : (
        <ul className="space-y-4">
          {appointments.map((a) => {
            const d = new Date(a.date);
            return (
              <li key={a._id} className={cardClass}>
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <h2 className={dateClass}>
                        {d.toLocaleDateString("es-ES", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </h2>
                      <span className="text-sm text-[var(--color-muted)] dark:text-blue-300">
                        {d.toLocaleTimeString("es-ES", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <ul className="space-y-2 mb-4">
                      {a.services?.map((s) => (
                        <li
                          key={s._id}
                          className="flex justify-between items-center"
                        >
                          <span className={serviceTextClass}>{s.name}</span>
                          <div className="flex gap-4">
                            <span className="text-sm text-[var(--color-muted)] dark:text-blue-300">
                              {s.duration} min
                            </span>
                            <span className="text-sm font-semibold text-[var(--color-text)] dark:text-blue-300">
                              {s.price}€
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>

                    <div className="flex justify-between pt-3 border-t border-[var(--color-secondary-light)] dark:border-blue-700/30">
                      <span className="font-medium text-[var(--color-text)] dark:text-white">
                        Total:
                      </span>
                      <span className="font-bold text-[var(--color-primary)] dark:text-blue-300">
                        {a.totalPrice} €
                      </span>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}