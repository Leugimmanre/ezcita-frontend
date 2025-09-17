// src/components/stats/AdminStatsDashboard.jsx
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllAppointmentsInRange } from "@/services/appointmentsAPI";
import { toast } from "react-toastify";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const COLORS = [
  "#6366F1",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#14B8A6",
  "#8B5CF6",
  "#0EA5E9",
  "#84CC16",
];

// Función para obtener un color claro basado en el color principal
const getLightColor = (color) => {
  const colorMap = {
    "#6366F1": "#EEF2FF",
    "#10B981": "#ECFDF5",
    "#F59E0B": "#FFFBEB",
    "#EF4444": "#FEF2F2",
    "#14B8A6": "#F0FDFA",
    "#8B5CF6": "#F5F3FF",
    "#0EA5E9": "#F0F9FF",
    "#84CC16": "#F7FEE7",
  };
  return colorMap[color] || "#F3F4F6";
};

function startOfMonth(d) {
  const x = new Date(d);
  x.setDate(1);
  x.setHours(0, 0, 0, 0);
  return x;
}
function addMonths(d, m) {
  const x = new Date(d);
  x.setMonth(x.getMonth() + m);
  return x;
}
function ymKey(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
function fmtEUR(n) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(Number(n || 0));
}

export default function AdminStatsDashboard() {
  // Rango por defecto: últimos 12 meses
  const [range, setRange] = useState(() => {
    const end = startOfMonth(new Date());
    const start = addMonths(end, -11);
    return { start, end: addMonths(end, 1) }; // end exclusivo (mes siguiente)
  });

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: [
      "admin-stats",
      range.start.toISOString(),
      range.end.toISOString(),
    ],
    queryFn: () =>
      getAllAppointmentsInRange({
        startDate: range.start.toISOString(),
        endDate: range.end.toISOString(),
      }),
  });

  useEffect(() => {
    if (isError)
      toast.error("No se pudo cargar el histórico para estadísticas");
  }, [isError]);

  const { kpis, byMonth, topServices, worstServices, statusDist } =
    useMemo(() => {
      const appts = Array.isArray(data) ? data : [];

      // KPIs
      const completed = appts.filter((a) => a.status === "completed");
      const cancelled = appts.filter((a) => a.status === "cancelled");
      const confirmed = appts.filter((a) => a.status === "confirmed");
      const pending = appts.filter((a) => a.status === "pending");

      const totalRevenue = completed.reduce(
        (s, a) => s + Number(a.totalPrice || 0),
        0
      );

      const uniqueUsers = new Set(appts.map((a) => a.user?._id || a.user)).size;
      const userCountMap = new Map();
      appts.forEach((a) => {
        const uid = String(a.user?._id || a.user || "");
        if (!uid) return;
        userCountMap.set(uid, (userCountMap.get(uid) || 0) + 1);
      });
      const repeatUsers = [...userCountMap.values()].filter(
        (n) => n > 1
      ).length;
      const repeatRate = uniqueUsers ? (repeatUsers / uniqueUsers) * 100 : 0;

      const kpis = {
        totalAppointments: appts.length,
        totalRevenue,
        uniqueClients: uniqueUsers,
        repeatRate: Math.round(repeatRate * 10) / 10,
        completed: completed.length,
        cancelled: cancelled.length,
        confirmed: confirmed.length,
        pending: pending.length,
        avgTicket: completed.length ? totalRevenue / completed.length : 0,
      };

      // Por mes
      const monthMap = new Map();
      // Inicializa 12 meses del rango para que salgan aunque estén vacíos
      for (let d = new Date(range.start); d < range.end; d = addMonths(d, 1)) {
        monthMap.set(ymKey(d), { ym: ymKey(d), citas: 0, ingresos: 0 });
      }
      appts.forEach((a) => {
        const key = ymKey(a.date);
        if (!monthMap.has(key))
          monthMap.set(key, { ym: key, citas: 0, ingresos: 0 });
        const rec = monthMap.get(key);
        rec.citas += 1;
        if (a.status === "completed") rec.ingresos += Number(a.totalPrice || 0);
      });
      const byMonth = [...monthMap.values()].sort((a, b) =>
        a.ym.localeCompare(b.ym)
      );

      // Servicios top/peor (por nº de veces en citas completadas)
      const serviceCount = new Map();
      const serviceRevenue = new Map();
      completed.forEach((a) => {
        (a.services || []).forEach((s) => {
          const id = String(s?._id || s);
          const name = s?.name || "Servicio";
          const key = `${id}|${name}`;
          serviceCount.set(key, (serviceCount.get(key) || 0) + 1);
          serviceRevenue.set(
            key,
            (serviceRevenue.get(key) || 0) + Number(s?.price || 0)
          );
        });
      });

      const serviceRows = [...serviceCount.entries()].map(([key, count]) => {
        const [id, name] = key.split("|");
        return { id, name, count, revenue: serviceRevenue.get(key) || 0 };
      });

      const topServices = serviceRows
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);
      const worstServices = [...serviceRows]
        .sort((a, b) => a.count - b.count)
        .slice(0, 8);

      // Distribución por estado
      const statusDist = [
        { name: "Completadas", value: kpis.completed },
        { name: "Confirmadas", value: kpis.confirmed },
        { name: "Pendientes", value: kpis.pending },
        { name: "Canceladas", value: kpis.cancelled },
      ];

      return { kpis, byMonth, topServices, worstServices, statusDist };
    }, [data, range.start, range.end]);

  const onSetMonths = (months) => {
    const end = startOfMonth(new Date());
    const start = addMonths(end, -(months - 1));
    setRange({ start, end: addMonths(end, 1) });
  };

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      {/* Controles */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 bg-white rounded-2xl shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Panel de Estadísticas
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Visualiza el rendimiento de tu negocio
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onSetMonths(3)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              range.start.getTime() ===
              addMonths(startOfMonth(new Date()), -2).getTime()
                ? "bg-indigo-600 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Últ. 3 meses
          </button>
          <button
            onClick={() => onSetMonths(6)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              range.start.getTime() ===
              addMonths(startOfMonth(new Date()), -5).getTime()
                ? "bg-indigo-600 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Últ. 6 meses
          </button>
          <button
            onClick={() => onSetMonths(12)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              range.start.getTime() ===
              addMonths(startOfMonth(new Date()), -11).getTime()
                ? "bg-indigo-600 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Últ. 12 meses
          </button>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="px-4 py-2 rounded-lg bg-indigo-100 text-indigo-700 hover:bg-indigo-200 text-sm font-medium transition-all duration-200 flex items-center gap-2"
          >
            {isFetching ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-indigo-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Actualizando...
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Actualizar
              </>
            )}
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard
          title="Citas totales"
          value={kpis.totalAppointments}
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          }
          color="#6366F1"
        />
        <KpiCard
          title="Ingresos"
          value={fmtEUR(kpis.totalRevenue)}
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
          color="#10B981"
        />
        <KpiCard
          title="Clientes únicos"
          value={kpis.uniqueClients}
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          }
          color="#F59E0B"
        />
        <KpiCard
          title="Tasa repetición"
          value={`${kpis.repeatRate}%`}
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          }
          color="#8B5CF6"
        />
      </div>

      {/* Segunda fila de KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard
          title="Completadas"
          value={kpis.completed}
          color="#10B981"
          small
        />
        <KpiCard
          title="Canceladas"
          value={kpis.cancelled}
          color="#EF4444"
          small
        />
        <KpiCard
          title="Pendientes"
          value={kpis.pending}
          color="#F59E0B"
          small
        />
        <KpiCard
          title="Ticket medio"
          value={fmtEUR(kpis.avgTicket)}
          color="#6366F1"
          small
        />
      </div>

      {/* Series mensuales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Citas por mes">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={byMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="ym"
                tick={{ fill: "#6B7280", fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: "#E5E7EB" }}
              />
              <YAxis
                tick={{ fill: "#6B7280", fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: "#E5E7EB" }}
              />
              <Tooltip
                cursor={{ fill: "#F3F4F6" }}
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #E5E7EB",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  background: "#FFF",
                }}
              />
              <Bar dataKey="citas" fill="#6366F1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Ingresos por mes">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={byMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="ym"
                tick={{ fill: "#6B7280", fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: "#E5E7EB" }}
              />
              <YAxis
                tick={{ fill: "#6B7280", fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: "#E5E7EB" }}
                tickFormatter={(value) => `€${value}`}
              />
              <Tooltip
                formatter={(v) => fmtEUR(v)}
                cursor={{ stroke: "#E5E7EB", strokeWidth: 1 }}
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #E5E7EB",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  background: "#FFF",
                }}
              />
              <Line
                type="monotone"
                dataKey="ingresos"
                stroke="#10B981"
                strokeWidth={3}
                dot={{ fill: "#10B981", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: "#10B981" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Distribución estados y Top/Worst Services */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="lg:col-span-1">
          <ChartCard title="Distribución por estado">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusDist}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={70}
                  outerRadius={100}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {statusDist.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${value} citas`, "Cantidad"]}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #E5E7EB",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    background: "#FFF",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TableCard title="Servicios más demandados" rows={topServices} />
            <TableCard
              title="Servicios menos demandados"
              rows={worstServices}
            />
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
          <span className="ml-3 text-gray-600">Cargando datos...</span>
        </div>
      )}
    </div>
  );
}

function KpiCard({ title, value, icon, color, small = false }) {
  const bgColor = color ? getLightColor(color) : "#F3F4F6";
  const textColor = color || "#6366F1";

  return (
    <div
      className={`rounded-2xl bg-white p-5 shadow-sm border border-gray-100 transition-all duration-200 hover:shadow-md ${
        small ? "pt-4" : ""
      }`}
    >
      <div className="flex justify-between items-start">
        <div
          className={`rounded-lg p-2 ${small ? "p-1.5" : "p-3"}`}
          style={{ backgroundColor: bgColor }}
        >
          {icon ? (
            <div style={{ color: textColor }}>{icon}</div>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`${small ? "h-5 w-5" : "h-6 w-6"}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              style={{ color: textColor }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
          )}
        </div>

        {!small && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
            />
          </svg>
        )}
      </div>

      <p className={`text-gray-500 mt-4 ${small ? "text-xs" : "text-sm"}`}>
        {title}
      </p>
      <p
        className={`font-bold mt-1 ${small ? "text-xl" : "text-2xl"}`}
        style={{ color: textColor }}
      >
        {value}
      </p>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      {children}
    </div>
  );
}

function TableCard({ title, rows }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100 h-full">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Servicio
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Veces
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ingresos
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {rows.map((r) => (
              <tr
                key={r.id}
                className="hover:bg-gray-50 transition-colors duration-150"
              >
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  {r.name}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">{r.count}</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  {fmtEUR(r.revenue)}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td
                  className="px-4 py-4 text-sm text-gray-500 text-center"
                  colSpan={3}
                >
                  Sin datos en el rango seleccionado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
