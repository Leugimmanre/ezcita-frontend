// src/components/settingsComponents/SettingsAppointments.jsx
import { useEffect, useMemo, useState, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { getServices } from "@/services/servicesAPI";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { searchUsers } from "@/services/userAPI";
import {
  adminCreateAppointment,
  getAppointmentSettings,
} from "@/services/appointmentSettingsAPI";
import {
  completeAppointment,
  deleteAppointment,
  getAppointments2,
  getAvailability,
  updateAppointment,
} from "@/services/appointmentsAPI";
// Solo utilitarios avanzados
import {
  generateSlotsFromDayBlocks,
  fitsAnyDayBlock,
} from "@/utils/generateDaySlots";

const normalize = (s) =>
  (s ?? "")
    .toString()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

function toMinutes(d, u) {
  const n = Number(d) || 0;
  return String(u || "").toLowerCase() === "horas" ? n * 60 : n;
}

function addMinutes(date, min) {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() + min);
  return d;
}

function yyyy_mm_dd(date) {
  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// Modal Crear/Editar
function AppointmentFormModal({ isOpen, mode, initial, onClose, onSuccess }) {
  const queryClient = useQueryClient();

  const { data: settings } = useQuery({
    queryKey: ["appointment-settings"],
    queryFn: getAppointmentSettings,
    enabled: isOpen,
  });

  const { data: servicesList = [] } = useQuery({
    queryKey: ["services-all-for-appointments"],
    queryFn: getServices,
    enabled: isOpen,
  });

  const [userQuery, setUserQuery] = useState("");
  const [userOptions, setUserOptions] = useState([]);
  const [fetchingUsers, setFetchingUsers] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);
  const [status, setStatus] = useState("pending");
  const [notes, setNotes] = useState("");

  const [selectedDate, setSelectedDate] = useState(() => {
    const n = new Date();
    n.setMinutes(0, 0, 0);
    return n;
  });
  const [selectedTime, setSelectedTime] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  const excludeId = mode === "edit" ? initial?._id : undefined;
  const availDateStr = yyyy_mm_dd(selectedDate);

  const { data: availabilityData, isFetching: loadingAvail } = useQuery({
    queryKey: ["admin-availability", availDateStr, excludeId],
    enabled: isOpen && !!settings && !!availDateStr,
    queryFn: () => getAvailability(availDateStr, excludeId),
  });
  const busy = availabilityData?.busy || [];

  useEffect(() => {
    if (!isOpen) return;

    if (mode === "edit" && initial) {
      setSelectedUser(initial.user || null);
      setStatus(initial.status || "pending");
      setNotes(initial.notes || "");

      const d = new Date(initial.date);
      setSelectedDate(d);
      setSelectedTime(
        `${String(d.getHours()).padStart(2, "0")}:${String(
          d.getMinutes()
        ).padStart(2, "0")}`
      );
    } else {
      setSelectedUser(null);
      setSelectedServices([]);
      setStatus("pending");
      setNotes("");

      const n = new Date();
      n.setMinutes(0, 0, 0);
      setSelectedDate(n);
      setSelectedTime("");

      setUserQuery("");
      setUserOptions([]);
    }
  }, [isOpen, mode, initial]);

  useEffect(() => {
    if (!isOpen) return;
    if (mode !== "edit" || !initial) return;
    if (!Array.isArray(servicesList) || servicesList.length === 0) return;

    const mapped = (initial.services || [])
      .map((s) =>
        typeof s === "string" ? servicesList.find((x) => x._id === s) : s
      )
      .filter(Boolean);

    setSelectedServices(mapped);
  }, [isOpen, mode, initial, servicesList]);

  useEffect(() => {
    let active = true;
    const run = async () => {
      if (!userQuery || userQuery.trim().length < 2) {
        setUserOptions([]);
        return;
      }
      try {
        setFetchingUsers(true);
        const data = await searchUsers(userQuery.trim());
        if (!active) return;
        const nq = normalize(userQuery.trim());
        const filtered = (data || []).filter((u) => {
          const hay = normalize(
            `${u.name ?? ""} ${u.lastname ?? ""} ${u.phone ?? ""} ${
              u.email ?? ""
            }`
          ).includes(nq);
          return hay;
        });
        setUserOptions(filtered);
      } catch {
        if (!active) return;
        setUserOptions([]);
      } finally {
        if (active) setFetchingUsers(false);
      }
    };
    const t = setTimeout(run, 250);
    return () => {
      active = false;
      clearTimeout(t);
    };
  }, [userQuery]);

  const totals = useMemo(() => {
    const duration = selectedServices.reduce(
      (s, x) => s + toMinutes(x?.duration, x?.durationUnit),
      0
    );
    const price = selectedServices.reduce(
      (s, x) => s + Number(x?.price || 0),
      0
    );
    return { duration, price };
  }, [selectedServices]);

  // Slots solo con dayBlocks
  const slots = useMemo(() => {
    if (!settings?.dayBlocks) return [];
    return generateSlotsFromDayBlocks(selectedDate, {
      dayBlocks: settings.dayBlocks,
      interval: settings.interval,
    });
  }, [settings, selectedDate]);

  const staffCount = Number(settings?.staffCount) || 1;

  // Deshabilitado solo por reglas avanzadas
  const getSlotDisableInfo = (hhmm) => {
    if (!settings?.dayBlocks) return { disabled: true, reason: "no-settings" };

    const [h, m] = hhmm.split(":").map(Number);
    const candidate = new Date(selectedDate);
    candidate.setHours(h, m, 0, 0);

    if (candidate < new Date()) return { disabled: true, reason: "past" };
    if (!selectedServices.length)
      return { disabled: true, reason: "no-services" };

    const duration = totals.duration;
    const ok = fitsAnyDayBlock(candidate, hhmm, duration, {
      dayBlocks: settings.dayBlocks,
    });
    if (!ok) return { disabled: true, reason: "out-of-block" };

    const candidateEnd = addMinutes(candidate, duration);
    const overlapping = busy.filter((b) => {
      const bStart = new Date(b.start);
      const bEnd = addMinutes(bStart, Number(b.duration) || 0);
      return bStart < candidateEnd && bEnd > candidate;
    }).length;

    if (overlapping >= staffCount) return { disabled: true, reason: "busy" };

    return { disabled: false, reason: null };
  };

  const createMut = useMutation({
    mutationFn: adminCreateAppointment,
    onSuccess: (res) => {
      toast.success("Cita creada");
      queryClient.invalidateQueries(["admin-appointments"]);
      queryClient.invalidateQueries(["admin-appointments-day"]);
      queryClient.invalidateQueries(["admin-availability"]);
      onSuccess?.(res);
      onClose();
    },
    onError: (e) =>
      toast.error(e?.response?.data?.error || "Error al crear la cita"),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, payload }) => updateAppointment(id, payload),
    onSuccess: (res) => {
      toast.success("Cita actualizada");
      queryClient.invalidateQueries(["admin-appointments"]);
      queryClient.invalidateQueries(["admin-appointments-day"]);
      queryClient.invalidateQueries(["admin-availability"]);
      onSuccess?.(res);
      onClose();
    },
    onError: (e) =>
      toast.error(e?.response?.data?.error || "Error al actualizar la cita"),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!settings?.dayBlocks) return;
    if (!selectedServices.length)
      return toast.error("Selecciona al menos un servicio");
    if (!selectedTime) return toast.error("Selecciona una hora válida");

    const [h, m] = selectedTime.split(":").map(Number);
    const dt = new Date(selectedDate);
    dt.setHours(h, m, 0, 0);

    const iso = dt.toISOString();
    const servicesIds = selectedServices.map((s) => s._id);

    if (mode === "create") {
      if (!selectedUser?._id) return toast.error("Selecciona un usuario");
      createMut.mutate({
        userId: selectedUser._id,
        services: servicesIds,
        date: iso,
        notes,
        status,
      });
    } else {
      updateMut.mutate({
        id: initial._id,
        payload: { services: servicesIds, date: iso, status, notes },
      });
    }
  };

  if (!isOpen) return null;

  const minDateStr = yyyy_mm_dd(new Date());
  const maxDate = new Date();
  if (settings?.maxMonthsAhead != null) {
    maxDate.setMonth(maxDate.getMonth() + Number(settings.maxMonthsAhead || 0));
  }
  const maxDateStr = yyyy_mm_dd(maxDate);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 p-4 flex items-center justify-center overflow-y-auto"
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-xl flex flex-col max-h-[90vh] w-full max-w-2xl mx-auto">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {mode === "create" ? "Nueva cita" : "Editar cita"}
          </h2>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg text-sm bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            Cerrar
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {mode === "create" ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Usuario
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={userQuery}
                    onChange={(e) => setUserQuery(e.target.value)}
                    placeholder="Buscar por nombre, apellido o email…"
                    className="flex-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  />
                  {fetchingUsers && (
                    <span className="text-xs text-gray-500">Buscando…</span>
                  )}
                </div>

                {userOptions.length > 0 && (
                  <div className="mt-2 max-h-32 overflow-y-auto border rounded-lg shadow-sm">
                    {userOptions.map((u) => (
                      <button
                        type="button"
                        key={u._id}
                        onClick={() => {
                          setSelectedUser(u);
                          setUserQuery(
                            `${u.name ?? ""} ${u.lastname ?? ""} <${
                              u.email ?? ""
                            }> <${u.phone ?? ""}>`.trim()
                          );
                          setUserOptions([]);
                        }}
                        className={`w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors text-sm ${
                          selectedUser?._id === u._id
                            ? "bg-indigo-50 text-indigo-700"
                            : ""
                        }`}
                      >
                        <div className="font-medium">
                          {u.name} {u.lastname}
                        </div>
                        <div className="text-xs text-gray-600">{u.phone}</div>
                        <div className="text-xs text-gray-600">{u.email}</div>
                      </button>
                    ))}
                  </div>
                )}

                {selectedUser && (
                  <p className="mt-2 text-xs text-gray-700 p-2 bg-green-50 rounded-lg">
                    Seleccionado:{" "}
                    <b>
                      {selectedUser.name} {selectedUser.lastname}
                    </b>{" "}
                    — {selectedUser.phone}— {selectedUser.email}
                  </p>
                )}
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Usuario
                </label>
                <div className="px-3 py-2 border rounded-lg bg-gray-50 text-sm">
                  {initial?.user?.name} {initial?.user?.lastname} —{" "}
                  {initial?.user?.phone}
                  {initial?.user?.email}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Servicios
              </label>
              <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto p-1">
                {servicesList.map((s) => {
                  const checked = selectedServices.some((x) => x._id === s._id);
                  return (
                    <label
                      key={s._id}
                      className={`flex items-start gap-2 border rounded-lg p-2 hover:bg-gray-50 transition-colors cursor-pointer ${
                        checked ? "bg-indigo-50 border-indigo-200" : ""
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          if (e.target.checked)
                            setSelectedServices((arr) => [...arr, s]);
                          else
                            setSelectedServices((arr) =>
                              arr.filter((x) => x._id !== s._id)
                            );
                        }}
                        className="mt-1"
                      />
                      <div className="text-sm flex-1">
                        <div className="font-medium">{s.name}</div>
                        <div className="text-xs text-gray-600">
                          {s.duration} min · {s.price} €
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
              <div className="mt-2 text-xs text-gray-700 p-2 bg-blue-50 rounded-lg">
                <b>Duración total:</b> {totals.duration} min ·{" "}
                <b>Precio total:</b> {totals.price} €
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha
                </label>
                <input
                  type="date"
                  value={yyyy_mm_dd(selectedDate)}
                  min={minDateStr}
                  max={maxDateStr}
                  onChange={(e) => {
                    const [yy, mm, dd] = e.target.value.split("-").map(Number);
                    const d = new Date(selectedDate);
                    d.setFullYear(yy, mm - 1, dd);
                    setSelectedDate(d);
                    setSelectedTime("");
                  }}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                >
                  <option value="pending">Pendiente</option>
                  <option value="confirmed">Confirmada</option>
                  <option value="completed">Completada</option>
                  <option value="cancelled">Cancelada</option>
                </select>
              </div>
            </div>

            {/* NUEVO: Info compacta basada SOLO en avanzado */}
            {settings && (
              <div className="text-xs text-gray-600 p-2 bg-gray-50 rounded-lg">
                Intervalo: {settings.interval}′ · Capacidad:{" "}
                {settings.staffCount} · Zona horaria: {settings.timezone}
              </div>
            )}

            {settings && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Horarios disponibles
                </label>
                <div className="max-h-40 overflow-y-auto p-1 border rounded-lg">
                  <div className="grid grid-cols-3 md-grid-cols-4 gap-2">
                    {slots.map((hhmm) => {
                      const { disabled, reason } = loadingAvail
                        ? { disabled: true, reason: "loading" }
                        : getSlotDisableInfo(hhmm);

                      const cls =
                        "text-center text-xs font-medium p-2 rounded-lg transition " +
                        (selectedTime === hhmm
                          ? "bg-indigo-600 text-white ring-1 ring-indigo-300 "
                          : "bg-gray-100 text-gray-800 ") +
                        (disabled
                          ? "opacity-40 cursor-not-allowed pointer-events-none "
                          : "hover:bg-gray-200 cursor-pointer ");

                      return (
                        <button
                          key={hhmm}
                          type="button"
                          disabled={disabled}
                          className={cls}
                          onClick={() => {
                            if (disabled) {
                              const msg =
                                reason === "busy"
                                  ? "Franja ocupada"
                                  : reason === "past"
                                  ? "Hora en el pasado"
                                  : reason === "out-of-block"
                                  ? "No cabe dentro de los bloques del día"
                                  : reason === "no-services"
                                  ? "Selecciona al menos un servicio"
                                  : "Franja no disponible";
                              toast.info(msg);
                              return;
                            }
                            setSelectedTime(hhmm);
                          }}
                        >
                          {hhmm}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notas
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                placeholder="Notas internas…"
              />
            </div>
          </div>

          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={createMut.isLoading || updateMut.isLoading}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {mode === "create" ? "Crear cita" : "Guardar cambios"}
              {(createMut.isLoading || updateMut.isLoading) && (
                <span className="ml-2">...</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Menú de acciones
// ─────────────────────────────────────────────────────────────
function ActionMenu({ onEdit, onComplete, onDelete }) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuDirection, setMenuDirection] = useState("bottom");
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const calculateMenuDirection = () => {
    if (!buttonRef.current) return "bottom";
    const buttonRect = buttonRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - buttonRect.bottom;
    const menuHeight = 120;
    if (spaceBelow < menuHeight && buttonRect.top > menuHeight) {
      return "top";
    }
    return "bottom";
  };

  const handleButtonClick = () => {
    const direction = calculateMenuDirection();
    setMenuDirection(direction);
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative" ref={buttonRef}>
      <button
        onClick={handleButtonClick}
        className="p-1 rounded-md hover:bg-gray-100 transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-gray-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
          />
        </svg>
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          className={`absolute right-0 z-50 w-40 bg-white rounded-md shadow-lg border border-gray-200 py-1 ${
            menuDirection === "top" ? "bottom-full mb-1" : "top-full mt-1"
          }`}
        >
          <button
            onClick={() => {
              onEdit();
              setIsOpen(false);
            }}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Editar
          </button>
          <button
            onClick={() => {
              onComplete();
              setIsOpen(false);
            }}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Completar
          </button>
          <button
            onClick={() => {
              onDelete();
              setIsOpen(false);
            }}
            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition-colors"
          >
            Eliminar
          </button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Vista principal
// ─────────────────────────────────────────────────────────────
export default function SettingsAppointments() {
  const [page, setPage] = useState(1);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [editingAppt, setEditingAppt] = useState(null);

  const [q, setQ] = useState("");

  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-appointments", page],
    queryFn: () => getAppointments2({ page, limit: 10 }),
  });

  const refreshData = async () => {
    await refetch();
    toast.success("Datos actualizados");
  };

  const { mutateAsync: remove } = useMutation({
    mutationFn: (id) => deleteAppointment(id),
    onSuccess: () => {
      toast.success("Cita eliminada");
      queryClient.invalidateQueries(["admin-appointments"]);
    },
    onError: () => toast.error("Error al eliminar la cita"),
  });

  const { mutateAsync: complete } = useMutation({
    mutationFn: completeAppointment,
    onSuccess: () => {
      toast.success("Cita marcada como completada");
      queryClient.invalidateQueries(["admin-appointments"]);
    },
    onError: () => toast.error("Error al completar la cita"),
  });

  const handleConfirm = (action) => {
    setConfirmAction(() => action);
    setConfirmOpen(true);
  };

  const { appointments = [], total = 0 } = data || {};
  const PAGE_SIZE = 10;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const nq = normalize(q);
  const filtered = useMemo(() => {
    if (!nq) return appointments;
    return appointments.filter((a) => {
      const userStr = normalize(
        `${a.user?.name ?? ""} ${a.user?.lastname ?? ""} ${
          a.user?.phone ?? ""
        } ${a.user?.email ?? ""}`
      );
      const servicesStr = normalize(
        (a.services || []).map((s) => s.name).join(" ")
      );
      const dateStr = normalize(new Date(a.date).toLocaleString("es-ES"));
      return (
        userStr.includes(nq) || servicesStr.includes(nq) || dateStr.includes(nq)
      );
    });
  }, [appointments, nq]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500" />
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

  return (
    <div className="mt-10 max-w-7xl mx-auto px-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Citas</h1>
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar (nombre, email, servicio, fecha)…"
            className="px-3 py-2 border rounded-lg w-full sm:w-80 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <div className="flex gap-2">
            <button
              onClick={refreshData}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-800 text-sm font-medium transition-all"
            >
              Actualizar
            </button>
            <button
              onClick={() => {
                setModalMode("create");
                setEditingAppt(null);
                setModalOpen(true);
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white text-sm font-medium transition-all"
            >
              Nueva cita
            </button>
          </div>
        </div>
        {q && (
          <div className="text-sm text-gray-500">
            Mostrando {filtered.length} de {appointments.length} resultados
            (página {page})
          </div>
        )}
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
              {filtered.map((appt, index) => {
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
                    className="hover:bg-gray-50 transition-colors group"
                    style={{
                      minHeight: "80px",
                      height: index === filtered.length - 1 ? "100px" : "auto",
                    }}
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
                      <div className="text-sm text-gray-500">
                        {appt.user?.phone ?? ""}
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
                    <td className="px-6 py-4 text-center relative">
                      <div className="h-full flex items-center justify-center">
                        <ActionMenu
                          onEdit={() => {
                            setModalMode("edit");
                            setEditingAppt(appt);
                            setModalOpen(true);
                          }}
                          onComplete={() =>
                            handleConfirm(() => complete(appt._id))
                          }
                          onDelete={() => handleConfirm(() => remove(appt._id))}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between">
          <button
            disabled={page === 1}
            onClick={() => setPage((prev) => prev - 1)}
            className={`px-4 py-2 rounded-lg transition-colors ${
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
            className={`px-4 py-2 rounded-lg transition-colors ${
              page >= totalPages
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 text-white"
            }`}
          >
            Siguiente
          </button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Confirmar acción"
        message="¿Estás seguro de realizar esta acción?"
        confirmText="Sí, continuar"
        cancelText="Cancelar"
        onConfirm={() => {
          confirmAction?.();
          setConfirmOpen(false);
        }}
      />

      <AppointmentFormModal
        isOpen={modalOpen}
        mode={modalMode}
        initial={editingAppt}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {}}
      />
    </div>
  );
}
