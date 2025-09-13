// src/hooks/useAppointmentsData.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createAppointment as createAppointmentAPI,
  getAppointments as getAppointmentsAPI,
  getAppointmentById,
  updateAppointment as updateAppointmentAPI,
  cancelAppointment as cancelAppointmentAPI,
} from "@/services/appointmentsAPI";

export function useAppointmentsData(filters = {}) {
  const queryClient = useQueryClient();

  // Trae la lista y normaliza la respuesta (array o { appointments: [] })
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["appointments", filters],
    queryFn: () => getAppointmentsAPI(filters),
  });

  const appointments = Array.isArray(data) ? data : data?.appointments ?? [];

  // Crear
  const createMutation = useMutation({
    mutationFn: createAppointmentAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });

  // Cancelar
  const cancelMutation = useMutation({
    mutationFn: cancelAppointmentAPI, // debe aceptar (id)
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });

  // Actualizar
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateAppointmentAPI(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });

  // Obtener una cita por ID (lectura puntual)
  const getAppointment = async (id) => getAppointmentById(id);

  return {
    // datos
    appointments,
    isLoading,
    isError,
    error,

    // crear
    createAppointment: (vars, options) => createMutation.mutate(vars, options),
    createAppointmentAsync: createMutation.mutateAsync,

    // cancelar
    cancelAppointment: (id, options) => cancelMutation.mutate(id, options),
    cancelAppointmentAsync: cancelMutation.mutateAsync,

    // actualizar
    updateAppointment: (vars, options) => updateMutation.mutate(vars, options),
    updateAppointmentAsync: updateMutation.mutateAsync,

    // lectura puntual
    getAppointment,
  };
}
