/**
 * Combina clases CSS de forma condicional
 * @param {...any} classes - Lista de clases a combinar
 * @returns {string} - Cadena con las clases combinadas
 */
export const classNames = (...classes) => {
  return classes.filter(Boolean).join(" ");
};

/**
 * Formatea un número como moneda
 * @param {number} amount - Cantidad a formatear
 * @param {string} currency - Código de moneda (ej: 'EUR', 'USD')
 * @param {number} decimals - Número de decimales a mostrar
 * @returns {string} - Cadena formateada como moneda
 */
export const formatCurrency = (amount, currency = "EUR", decimals = 2) => {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
};

/**
 * Formatea una duración en minutos a un string legible
 * @param {number} minutes - Duración en minutos
 * @returns {string} - Duración formateada (ej: "1h 30min")
 */
export const formatDuration = (minutes) => {
  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}min`;
};

/**
 * Capitaliza la primera letra de un string
 * @param {string} str - String a capitalizar
 * @returns {string} - String capitalizado
 */
export const capitalize = (str) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Recorta un texto si excede una longitud máxima
 * @param {string} text - Texto a recortar
 * @param {number} maxLength - Longitud máxima permitida
 * @param {string} [ellipsis='...'] - Caracteres a añadir al final si se recorta
 * @returns {string} - Texto recortado si es necesario
 */
export const truncateText = (text, maxLength, ellipsis = "...") => {
  if (!text) return "";
  if (text.length <= maxLength) return text;

  return text.substring(0, maxLength) + ellipsis;
};

/**
 * Genera un ID único
 * @returns {string} - ID único
 */
export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

/**
 * Verifica si un objeto está vacío
 * @param {object} obj - Objeto a verificar
 * @returns {boolean} - True si el objeto está vacío, false en caso contrario
 */
export const isEmptyObject = (obj) => {
  return Object.keys(obj).length === 0 && obj.constructor === Object;
};
