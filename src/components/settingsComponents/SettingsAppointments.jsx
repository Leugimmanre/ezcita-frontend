// src/views/settingsViews/SettingsAppointmentsViews.jsx
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  completeAppointment,
  deleteAppointment,
  getAppointments2,
} from "@/services/appointmentsAPI";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

export default function SettingsAppointments() {
  const [page, setPage] = useState(1);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-appointments", page],
    queryFn: () => getAppointments2({ page, limit: 10 }),
  });

  const refreshData = async () => {
    await refetch();
    toast.success("Datos actualizados");
  };

  // Mutación para eliminar
  const { mutateAsync: remove } = useMutation({
    mutationFn: (id) => deleteAppointment(id),
    onSuccess: () => {
      toast.success("Cita eliminada");
      queryClient.invalidateQueries(["admin-appointments"]);
    },
    onError: () => toast.error("Error al eliminar la cita"),
  });

  // Mutación para completar
  const { mutateAsync: complete } = useMutation({
    mutationFn: completeAppointment,
    onSuccess: () => {
      toast.success("Cita marcada como completada");
      queryClient.invalidateQueries(["admin-appointments"]);
    },
    onError: () => toast.error("Error al completar la cita"),
  });

  // Abrir modal de confirmación
  const handleConfirm = (action) => {
    setConfirmAction(() => action);
    setConfirmOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-100 border border-red-300 rounded-xl p-6 text-center">
        <p className="text-red-700 font-medium mb-3">
          Error al cargar las citas
        </p>
        <button
          onClick={refreshData}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white text-sm font-medium transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  const { appointments = [], total = 0 } = data || {};
  const totalPages = Math.ceil(total / 10) || 1;

  return (
    <div className="mt-10 max-w-7xl mx-auto px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Citas</h1>
        <button
          onClick={refreshData}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white text-sm font-medium transition-all"
        >
          Actualizar
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                  Fecha
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                  Usuario
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                  Servicios
                </th>
                <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase">
                  Duración
                </th>
                <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase">
                  Precio
                </th>
                <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase">
                  Estado
                </th>
                <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {appointments.map((appt) => {
                const apptDate = new Date(appt.date);
                const statusColor = {
                  pending: "bg-yellow-100 text-yellow-800",
                  confirmed: "bg-green-100 text-green-800",
                  cancelled: "bg-red-100 text-red-800",
                  completed: "bg-blue-100 text-blue-800",
                }[appt.status];

                return (
                  <tr
                    key={appt._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {apptDate.toLocaleDateString("es-ES", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                      <div className="text-sm text-gray-500">
                        {apptDate.toLocaleTimeString("es-ES", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {appt.user?.name ?? "Usuario eliminado"}{" "}
                        {appt.user?.lastname ?? ""}
                      </div>
                      <div className="text-sm text-gray-500">
                        {appt.user?.email ?? ""}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {appt.services.map((s) => (
                        <div key={s._id} className="text-sm text-gray-700">
                          {s.name} · {s.duration} min · {s.price}€
                        </div>
                      ))}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {appt.duration} min
                    </td>
                    <td className="px-6 py-4 text-center font-bold">
                      {appt.totalPrice} €
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}
                      >
                        {appt.status === "pending" && "Pendiente"}
                        {appt.status === "confirmed" && "Confirmada"}
                        {appt.status === "cancelled" && "Cancelada"}
                        {appt.status === "completed" && "Completada"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center flex flex-col gap-2">
                      <button
                        onClick={() => handleConfirm(() => complete(appt._id))}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs"
                      >
                        Completar
                      </button>
                      <button
                        onClick={() => handleConfirm(() => remove(appt._id))}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between">
          <button
            disabled={page === 1}
            onClick={() => setPage((prev) => prev - 1)}
            className={`px-4 py-2 rounded-lg ${
              page === 1
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 text-white"
            }`}
          >
            Anterior
          </button>
          <span className="text-sm text-gray-700">
            Página <b>{page}</b> de <b>{totalPages}</b>
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((prev) => prev + 1)}
            className={`px-4 py-2 rounded-lg ${
              page >= totalPages
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 text-white"
            }`}
          >
            Siguiente
          </button>
        </div>
      </div>

      {/* Modal de confirmación */}
      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Confirmar acción"
        message="¿Estás seguro de realizar esta acción?"
        confirmText="Sí, continuar"
        cancelText="Cancelar"
        onConfirm={confirmAction}
      />
    </div>
  );
}
