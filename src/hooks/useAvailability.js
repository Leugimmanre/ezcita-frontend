// src/hooks/useAvailability.js (ejemplo)
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { toast } from "react-toastify";

export const useAvailability = (dateObj, excludeId) => {
  const date = dateObj ? dateObj.toISOString().slice(0, 10) : null;
  return useQuery({
    queryKey: ["availability", date, excludeId],
    enabled: Boolean(date),
    queryFn: async () => {
      const { data } = await api.get("/appointments/availability", {
        params: { date, excludeId },
      });
      return data.busy || [];
    },
    onError: (err) => {
      const msg =
        err?.response?.data?.error || "No se pudo cargar la disponibilidad";
      toast.error(msg);
    },
  });
};
