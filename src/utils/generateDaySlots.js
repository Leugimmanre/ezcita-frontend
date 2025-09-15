// src/utils/generateDaySlots.js
// Convierte "HH:mm" a minutos desde medianoche
function toMinutes(hhmm) {
  const [h, m] = String(hhmm).split(":").map(Number);
  return h * 60 + m;
}

// Convierte minutos a "HH:mm"
function fromMinutes(total) {
  const h = Math.floor(total / 60);
  const m = total % 60;
  const pad = (x) => String(x).padStart(2, "0");
  return `${pad(h)}:${pad(m)}`;
}

// Obtiene la clave del día para dayBlocks a partir de una fecha
function dayKeyOf(date) {
  const keys = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  return keys[new Date(date).getDay()];
}

// Genera slots "HH:mm" para una fecha concreta usando dayBlocks + interval
export function generateSlotsFromDayBlocks(date, settings) {
  if (!settings) return [];
  const interval = Number(settings.interval || 30);
  const db = settings.dayBlocks || {};
  const key = dayKeyOf(date);
  const blocks = Array.isArray(db[key]) ? db[key] : [];

  if (!blocks.length) return [];

  const all = [];
  for (const b of blocks) {
    const startMin = toMinutes(b.start);
    const endMin = toMinutes(b.end);

    for (let t = startMin; t + interval <= endMin; t += interval) {
      all.push(fromMinutes(t));
    }
  }
  return all;
}

// Indica si una hora "HH:mm" cabe completamente dentro de algún bloque del día según duración
export function fitsAnyDayBlock(date, hhmm, durationMin, settings) {
  if (!settings) return false;
  const db = settings.dayBlocks || {};
  const key = dayKeyOf(date);
  const blocks = Array.isArray(db[key]) ? db[key] : [];
  if (!blocks.length) return false;

  const [h, m] = hhmm.split(":").map(Number);
  const startMin = h * 60 + m;
  const endMin = startMin + Number(durationMin || 0);

  return blocks.some((b) => {
    const bS = toMinutes(b.start);
    const bE = toMinutes(b.end);
    return startMin >= bS && endMin <= bE;
  });
}
