// utils/generateTimeSlots

/**
 * Genera una lista de horas en formato "HH:mm"
 * @param {number} startHour - Hora inicial (por defecto 9)
 * @param {number} endHour - Hora final (por defecto 18)
 * @param {number} intervalMinutes - Intervalo en minutos (por defecto 15)
 * @returns {string[]} Array de horas formateadas como "HH:mm"
 */
export function generateTimeSlots(start, end, interval = 30) {
  const slots = [];
  let current = start * 60; // en minutos
  const endInMinutes = end * 60;

  while (current < endInMinutes) {
    const hours = Math.floor(current / 60);
    const minutes = current % 60;
    slots.push(
      `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`
    );
    current += interval;
  }

  return slots;
}
