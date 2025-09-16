// src/components/settingsComponents/AdminAppointmentsHistory.jsx
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { getAppointmentsHistory } from "@/services/appointmentsAPI";
import { toast } from "react-toastify";
import {
  ClockIcon,
  CurrencyEuroIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

export default function AdminAppointmentsHistory() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-appointments-history"],
    queryFn: () => getAppointmentsHistory({ page: 1, limit: 20 }),
  });

  // Estado para el texto de búsqueda
  const [q, setQ] = useState("");

  const { appointments = [] } = data || {};

  // Calcular métricas generales
  const totalAppointments = appointments.length;
  const totalRevenue = appointments.reduce((sum, appointment) => {
    return sum + (appointment.totalPrice || 0);
  }, 0);
  const uniqueClients = new Set(appointments.map((a) => a.user?._id)).size;

  // Función para normalizar y quitar diacríticos
  const normalize = (s) =>
    (s ?? "")
      .toString()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "") // quita tildes/diacríticos
      .toLowerCase()
      .trim();

  // Filtrado local insensible a acentos
  const filtered = useMemo(() => {
    const nq = normalize(q);
    if (!nq) return appointments;

    return appointments.filter((a) => {
      const userStr = normalize(
        `${a.user?.name ?? ""} ${a.user?.lastname ?? ""} ${a.user?.email ?? ""}`
      );
      const servicesStr = normalize(
        (a.services || [])
          .map((s) => `${s.name} ${s.duration} ${s.price}`)
          .join(" ")
      );
      const dateStr = normalize(
        new Date(a.date).toLocaleString("es-ES", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      );

      return (
        userStr.includes(nq) || servicesStr.includes(nq) || dateStr.includes(nq)
      );
    });
  }, [appointments, q]);

  // === Clases para modo claro/oscuro ===
  const containerClass = "my-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8";

  const titleClass =
    "text-2xl font-bold text-[var(--color-text)] dark:text-white";

  const subtitleClass =
    "mt-1 text-sm text-[var(--color-muted)] dark:text-gray-400";

  const summaryCardClass =
    "p-6 rounded-xl border shadow-sm mb-6 " +
    "bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-100 " +
    "dark:from-indigo-900/30 dark:to-blue-900/30 dark:border-indigo-700/50";

  const inputClass =
    "pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:w-80 transition-colors " +
    "dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-indigo-400 dark:focus:border-indigo-400";

  const buttonClass =
    "px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center justify-center transition-colors " +
    "dark:bg-indigo-700 dark:hover:bg-indigo-800";

  const counterClass =
    "mb-4 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg inline-flex items-center text-sm " +
    "dark:bg-blue-900/30 dark:text-blue-300";

  const tableContainerClass =
    "bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden " +
    "dark:bg-gray-800 dark:border-gray-700";

  const tableHeaderClass = "bg-gray-50 dark:bg-gray-700";

  const tableHeaderCellClass =
    "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider " +
    "dark:text-gray-300";

  const tableRowClass =
    "bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700";

  const tableCellClass =
    "px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300";

  const tableCellMutedClass =
    "px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400";

  if (isLoading)
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-[var(--color-primary)] border-t-transparent dark:border-blue-500 dark:border-t-transparent"></div>
      </div>
    );

  if (isError)
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded dark:bg-red-900/20 dark:border-red-700">
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
    );

  return (
    <div className={containerClass}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className={titleClass}>Histórico de Citas</h1>
          <p className={subtitleClass}>
            Listado de todas las citas completadas
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar (nombre, email, servicio, fecha)…"
              className={inputClass}
            />
          </div>
          <button
            onClick={async () => {
              try {
                await refetch();
                toast.success("Histórico actualizado");
              } catch {
                toast.error("No se pudo actualizar el histórico");
              }
            }}
            className={buttonClass}
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              ></path>
            </svg>
            Actualizar
          </button>
        </div>
      </div>

      {/* Resumen general */}
      {appointments.length > 0 && (
        <div className={summaryCardClass}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  Ingresos totales
                </p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {totalRevenue.toFixed(2)} €
                </p>
              </div>
            </div>

            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-full dark:bg-purple-800/50">
                <UserGroupIcon className="h-6 w-6 text-purple-600 dark:text-purple-300" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Clientes únicos
                </p>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                  {uniqueClients}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contador de resultados cuando hay búsqueda */}
      {q && (
        <div className={counterClass}>
          <svg
            className="w-4 h-4 mr-2"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
              clipRule="evenodd"
            ></path>
          </svg>
          Mostrando {filtered.length} de {appointments.length} resultados
        </div>
      )}

      <div className={tableContainerClass}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className={tableHeaderClass}>
              <tr>
                <th className={tableHeaderCellClass}>Fecha</th>
                <th className={tableHeaderCellClass}>Usuario</th>
                <th className={tableHeaderCellClass}>Servicios</th>
                <th className={tableHeaderCellClass}>Duración</th>
                <th className={tableHeaderCellClass}>Precio</th>
              </tr>
            </thead>
            <tbody className={tableRowClass}>
              {(filtered.length ? filtered : appointments).map((a) => {
                const d = new Date(a.date);
                return (
                  <tr
                    key={a._id}
                    className="hover:bg-gray-50 transition-colors dark:hover:bg-gray-700"
                  >
                    <td className={tableCellClass}>
                      <div className="font-medium">
                        {d.toLocaleDateString("es-ES")}
                      </div>
                      <div className={tableCellMutedClass}>
                        {d.toLocaleTimeString("es-ES", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </td>
                    <td className={tableCellClass}>
                      <div className="font-medium">
                        {a.user?.name} {a.user?.lastname}
                      </div>
                      <div className={tableCellMutedClass}>{a.user?.email}</div>
                    </td>
                    <td className={tableCellClass}>
                      {(a.services || []).map((s) => (
                        <div key={s._id} className="mb-1 last:mb-0">
                          <span className="font-medium">{s.name}</span> ·{" "}
                          {s.duration} min · {s.price}€
                        </div>
                      ))}
                    </td>
                    <td className={`${tableCellClass} text-center`}>
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full dark:bg-blue-900/30 dark:text-blue-300">
                        {a.duration} min
                      </span>
                    </td>
                    <td
                      className={`${tableCellClass} text-center font-bold text-green-600 dark:text-green-400`}
                    >
                      {a.totalPrice} €
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && q && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                      No se encontraron resultados
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      No hay citas que coincidan con "{q}"
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
