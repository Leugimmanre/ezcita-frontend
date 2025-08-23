// src/hooks/useAppointmentSettings.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAppointmentSettings,
  saveAppointmentSettings,
} from "@/services/appointmentSettingsAPI";
import { getToken } from "@/utils/authStorage";
import { getTenantId } from "@/utils/tenantStorage";

export const useAppointmentSettings = () => {
  const queryClient = useQueryClient();
  const token = getToken();
  const tenantId = getTenantId();

  const query = useQuery({
    queryKey: ["appointmentSettings"],
    queryFn: getAppointmentSettings,
    enabled: Boolean(token && tenantId),
    retry: false,
  });

  const mutation = useMutation({
    mutationFn: saveAppointmentSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointmentSettings", tenantId] });
    },
  });

  // Manejo elegante de error 403
  if (query.isError && query.error?.response?.status === 403) {
    return {
      ...query,
      data: null,
      errorMessage: "Acceso denegado. Solo administradores.",
      saveSettings: mutation.mutate,
      isSaving: mutation.isLoading,
    };
  }

  return {
    ...query,
    errorMessage: null,
    saveSettings: mutation.mutate,
    isSaving: mutation.isLoading,
  };
};
