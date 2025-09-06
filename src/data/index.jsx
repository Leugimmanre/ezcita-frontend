// src/data/index.js
import {
  CogIcon,
  ClockIcon,
  BeakerIcon,
  UserGroupIcon,
  UserIcon,
  CreditCardIcon,
  CalendarIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  BellIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";

// tenantId de  la aplicación
export const APP_NAME = "Mi Empresa";

// Cambia este valor para ajustar el límite de selección de servicios
export const MAX_SERVICES_SELECTION = 2;
// Días de la semana con sus valores numéricos
export const daysOfWeek = [
  { id: 0, name: "Domingo" },
  { id: 1, name: "Lunes" },
  { id: 2, name: "Martes" },
  { id: 3, name: "Miércoles" },
  { id: 4, name: "Jueves" },
  { id: 5, name: "Viernes" },
  { id: 6, name: "Sábado" },
];
// Iconos de navegación sidebar
export const navigation = [
  {
    name: "Dashboard",
    href: "/settings",
    icon: CogIcon,
    // current: location.pathname === "/settings",
  },
  {
    name: "Horarios",
    href: "/settings/generate-time-slots",
    icon: ClockIcon,
    // current: location.pathname.includes("/settings/generate-time-slots"),
  },
  {
    name: "Servicios",
    href: "/settings/services",
    icon: BeakerIcon,
    // current: location.pathname.includes("/settings/services"),
  },
  {
    name: "Personal",
    href: "/settings/staff",
    icon: UserGroupIcon,
    // current: location.pathname.includes("/settings/staff"),
  },
  {
    name: "Reservas",
    href: "/settings/appointments",
    icon: CalendarIcon,
    // current: location.pathname.includes("/settings/appointments "),
  },
  {
    name: "Usuarios",
    href: "/settings/users",
    icon: UserIcon,
    // current: location.pathname.includes("/settings/users "),
  },
  {
    name: "Empresa",
    href: "/settings/brand",
    icon: BuildingOfficeIcon,
    // current: location.pathname.includes("/settings/brand"),
  },
  {
    name: "Pagos",
    href: "/settings",
    icon: CreditCardIcon,
    // current: location.pathname.includes("/settings/payments"),
  },
  {
    name: "Reportes",
    href: "/settings",
    icon: ChartBarIcon,
    // current: location.pathname.includes("/settings/reports"),
  },
  {
    name: "Seguridad",
    href: "/settings",
    icon: ShieldCheckIcon,
    // current: location.pathname.includes("/settings/security"),
  },
  {
    name: "Notificaciones",
    href: "/settings",
    icon: BellIcon,
    // current: location.pathname.includes("/settings/notifications"),
  },
];

// Categorías de configuración para el panel de administración
export const settingCategories = [
  {
    id: "horarios",
    title: "Horarios",
    description: "Configura horarios de atención, intervalos y descansos",
    icon: <ClockIcon className="h-8 w-8 text-blue-500" />,
    path: "/settings/generate-time-slots",
    color: "bg-blue-50 text-blue-700 hover:bg-blue-100",
  },
  {
    id: "servicios",
    title: "Servicios",
    description: "Gestiona tus servicios, precios y duraciones",
    icon: <BeakerIcon className="h-8 w-8 text-purple-500" />,
    path: "/settings/services",
    color: "bg-purple-50 text-purple-700 hover:bg-purple-100",
  },
  {
    id: "personal",
    title: "Personal",
    description: "Administra tu equipo y permisos",
    icon: <UserGroupIcon className="h-8 w-8 text-green-500" />,
    path: "/settings/staff",
    color: "bg-green-50 text-green-700 hover:bg-green-100",
  },
  {
    id: "reservas",
    title: "Reservas",
    description: "Personaliza reglas de reservas y recordatorios",
    icon: <CalendarIcon className="h-8 w-8 text-red-500" />,
    path: "/settings/appointments",
    color: "bg-red-50 text-red-700 hover:bg-red-100",
  },
  {
    id: "usuarios",
    title: "Usuarios",
    description: "Personaliza reglas de reservas y recordatorios",
    icon: <UserIcon className="h-8 w-8 text-blue-500" />,
    path: "/settings/users",
    color: "bg-blue-50 text-blue-700 hover:bg-blue-100",
  },
  {
    id: "empresa",
    title: "Empresa",
    description:
      "Gestiona la información de tu empresa, logo y detalles de marca",
    icon: <BuildingOfficeIcon className="h-8 w-8 text-purple-500" />,
    path: "/settings/brand",
    color: "bg-purple-50 text-purple-700 hover:bg-purple-100",
  },
  {
    id: "pagos",
    title: "Pagos",
    description: "Configura métodos de pago y facturación",
    icon: <CreditCardIcon className="h-8 w-8 text-yellow-500" />,
    path: "/settings",
    color: "bg-yellow-50 text-yellow-700 hover:bg-yellow-100",
  },
  {
    id: "reportes",
    title: "Reportes",
    description: "Configura informes y análisis de negocio",
    icon: <ChartBarIcon className="h-8 w-8 text-indigo-500" />,
    path: "/settings/reports",
    color: "bg-indigo-50 text-indigo-700 hover:bg-indigo-100",
  },
  {
    id: "seguridad",
    title: "Seguridad",
    description: "Gestiona contraseñas y accesos",
    icon: <ShieldCheckIcon className="h-8 w-8 text-gray-500" />,
    path: "/settings",
    color: "bg-gray-50 text-gray-700 hover:bg-gray-100",
  },
  {
    id: "notificaciones",
    title: "Notificaciones",
    description: "Personaliza alertas y mensajes",
    icon: <BellIcon className="h-8 w-8 text-pink-500" />,
    path: "/settings",
    color: "bg-pink-50 text-pink-700 hover:bg-pink-100",
  },
];

// Datos de ejemplo para los cambios recientes en la configuración
export const recentSettings = [
  {
    id: 1,
    category: "Horarios",
    action: "Actualizó intervalo de citas",
    time: "Hace 2 horas",
  },
  {
    id: 2,
    category: "Servicios",
    action: "Agregó nuevo servicio",
    time: "Ayer",
  },
  {
    id: 3,
    category: "Pagos",
    action: "Configuró nuevo método de pago",
    time: "Hace 3 días",
  },
];
