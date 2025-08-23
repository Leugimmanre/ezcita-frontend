// src/utils/userStorage.js
export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem("user_EzCita");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const clearStoredUser = () => {
  localStorage.removeItem("user_EzCita");
};
