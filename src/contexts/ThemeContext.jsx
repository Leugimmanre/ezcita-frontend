// src/contexts/ThemeContext.jsx
import { createContext, useEffect, useMemo, useState } from "react";

const ThemeContext = createContext({
  isDarkMode: false,
  toggleTheme: () => {},
});

export function ThemeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("theme");
      const prefersDark = window.matchMedia?.(
        "(prefers-color-scheme: dark)"
      ).matches;
      const dark = saved ? saved === "dark" : !!prefersDark;
      setIsDarkMode(dark);
      document.documentElement.classList.toggle("dark", dark);
    } catch {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      try {
        localStorage.setItem("theme", next ? "dark" : "light");
      } catch {
        // Ignorar errores de localStorage
      }
      return next;
    });
  };

  const value = useMemo(() => ({ isDarkMode, toggleTheme }), [isDarkMode]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export default ThemeContext;
