// src/contexts/useAppointmentContext.js
import { useContext } from "react";
import { AppointmentContext } from "./AppointmentContext";

export function useAppointmentContext() {
  const context = useContext(AppointmentContext);
  if (!context) {
    throw new Error(
      "useAppointmentContext debe usarse dentro de AppointmentProvider"
    );
  }
  return context;
}
