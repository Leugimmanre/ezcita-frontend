// src/hooks/useAppointment.js
import { AppointmentContext } from "@/contexts/AppointmentContext";
import { useContext } from "react";

export function useAppointment() {
  return useContext(AppointmentContext);
}

/*
¿Qué hace?
Es un hook personalizado que simplifica el uso del contexto.
En lugar de escribir useContext(AppointmentContext) en cada componente, puedes usar directamente useAppointment().

¿Por qué crearlo?
Hace tu código más limpio, más fácil de usar y de testear.
Centraliza el acceso al contexto.
*/