import { createContext, useContext, useEffect, useMemo, useState } from "react";

const ThemeContext = createContext({
  isDarkMode: false,
  toggleTheme: () => {},
});

export function ThemeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // 📌 Aplica tema al montar leyendo localStorage o preferencia del SO
  useEffect(() => {
    try {
      const saved = localStorage.getItem("theme");
      const prefersDark = window.matchMedia?.(
        "(prefers-color-scheme: dark)"
      ).matches;
      const dark = saved ? saved === "dark" : !!prefersDark;
      setIsDarkMode(dark);
      document.documentElement.classList.toggle("dark", dark); // <- clave
    } catch {
      // fallback seguro
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // Cambia tema + persiste + aplica clase en <html>
  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next); // <- clave
      try {
        localStorage.setItem("theme", next ? "dark" : "light");
      } catch {
        // Intentionally left blank: ignore localStorage errors
      }
      return next;
    });
  };

  const value = useMemo(() => ({ isDarkMode, toggleTheme }), [isDarkMode]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
