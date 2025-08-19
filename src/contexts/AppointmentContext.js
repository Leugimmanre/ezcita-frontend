// src/contexts/AppointmentContext.jsx
import { createContext } from "react";

export const AppointmentContext = createContext();

/* ¿Qué hace?
Crea el contexto usando createContext.
No contiene lógica ni componentes, solo define el contexto.

¿Por qué separarlo?
Esto permite que otros archivos puedan importar el contexto directamente (como hooks personalizados) sin importar también el proveedor completo.
Mejora la compatibilidad con Fast Refresh y mantiene una arquitectura limpia y modular.
*/