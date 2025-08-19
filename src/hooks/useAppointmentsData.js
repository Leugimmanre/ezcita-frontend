// src/hooks/useAppointmentsData.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  cancelAppointment,
} from "@/services/appointmentsAPI";

export function useAppointmentsData(filters = {}) {
  const queryClient = useQueryClient();

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ["appointments", filters],
    queryFn: () => getAppointments(filters),
  });

  const createMutation = useMutation({
    mutationFn: createAppointment,
    onSuccess: () => queryClient.invalidateQueries(["appointments"]),
  });

  const cancelMutation = useMutation({
    mutationFn: cancelAppointment,
    onSuccess: () => queryClient.invalidateQueries(["appointments"]),
  });

  // Nueva mutación para actualizar citas
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateAppointment(id, data),
    onSuccess: () => queryClient.invalidateQueries(["appointments"]),
  });

  // Nueva función para obtener una cita por ID
  const getAppointment = async (id) => {
    return getAppointmentById(id);
  };

  return {
    appointments,
    isLoading,
    createAppointment: createMutation.mutate,
    cancelAppointment: cancelMutation.mutate,
    updateAppointment: updateMutation.mutate,
    getAppointment,
  };
}