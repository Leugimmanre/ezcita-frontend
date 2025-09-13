// src/utils/timeAgo.js
// 🇪🇸 Convierte una fecha a "Hace X"
export function timeAgo(dateInput) {
  const date = new Date(dateInput);
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  const units = [
    ["año", 365 * 24 * 60 * 60],
    ["mes", 30 * 24 * 60 * 60],
    ["día", 24 * 60 * 60],
    ["hora", 60 * 60],
    ["minuto", 60],
    ["segundo", 1],
  ];
  for (const [name, secs] of units) {
    const val = Math.floor(diff / secs);
    if (val >= 1) return `Hace ${val} ${name}${val > 1 ? "s" : ""}`;
  }
  return "Justo ahora";
}
