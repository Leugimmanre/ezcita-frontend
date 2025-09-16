// src/contexts/IdleLogoutProvider.jsx
import { useEffect, useRef } from "react";
import { forceLogout, getSessionKeys } from "@/utils/authSession";
import { isTokenValid } from "@/utils/jwt";
import { toast } from "react-toastify";

// Componente que envuelve la app y gestiona el logout por inactividad.
export default function IdleLogoutProvider({
  timeoutMs = 60 * 60 * 1000, // 1h
  warnMs = 0, // ej. 60 * 1000 para aviso 60s antes (0 = sin aviso)
  children,
}) {
  const tickRef = useRef(null); // intervalo de 1s
  const warnToastIdRef = useRef(null); // id del toast de aviso
  const warnedRef = useRef(false); // si el aviso ya está visible

  const lastActivityRef = useRef(Date.now());
  const throttleRef = useRef(0);
  const bcRef = useRef(null);

  // Limpia el intervalo y el toast de aviso
  const clearAllTimers = () => {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
  };
  const dismissWarn = () => {
    if (warnToastIdRef.current) {
      toast.dismiss(warnToastIdRef.current);
      warnToastIdRef.current = null;
    }
    warnedRef.current = false;
  };

  // Marca actividad del usuario y reinicia la lógica
  const markActivity = () => {
    const now = Date.now();
    const { activityKey } = getSessionKeys();

    // Throttle escrituras de actividad (cada 5s)
    if (now - throttleRef.current > 5000) {
      try {
        localStorage.setItem(activityKey, String(now));
      } catch {
        // noop
      }
      if ("BroadcastChannel" in window && bcRef.current) {
        bcRef.current.postMessage({ type: "ACTIVITY", stamp: now });
      }
      throttleRef.current = now;
    }

    lastActivityRef.current = now;
    // Si había un aviso, lo quitamos al detectar actividad
    dismissWarn();
  };

  // Arranca el tick de 1s que gestiona aviso y logout
  const startTick = () => {
    clearAllTimers();

    tickRef.current = window.setInterval(() => {
      const now = Date.now();
      const deadline = lastActivityRef.current + timeoutMs;
      const remainingMs = deadline - now;

      // 1) Logout si terminó el tiempo
      if (remainingMs <= 0) {
        clearAllTimers();
        dismissWarn();
        forceLogout("idle");
        return;
      }

      // 2) Mostrar/actualizar aviso si estamos dentro de warnMs
      if (warnMs > 0 && remainingMs <= warnMs) {
        const secs = Math.max(1, Math.ceil(remainingMs / 1000));

        // Si aún no mostramos el aviso -> crear toast persistente
        if (!warnedRef.current) {
          warnedRef.current = true;
          const id = toast.warn(
            <WarnContent onStay={() => markActivity()} seconds={secs} />,
            { autoClose: false, closeOnClick: false, pauseOnHover: false }
          );
          warnToastIdRef.current = id;
        } else if (warnToastIdRef.current) {
          // Actualizar el contenido con los segundos restantes
          toast.update(warnToastIdRef.current, {
            render: (
              <WarnContent onStay={() => markActivity()} seconds={secs} />
            ),
          });
        }
      } else {
        // Fuera de la ventana de aviso -> asegurar que el aviso no esté visible
        if (warnedRef.current) dismissWarn();
      }
    }, 1000);
  };

  // Contenido del toast de aviso (JSX)
  const WarnContent = ({ seconds, onStay }) => (
    <div className="space-y-2">
      <p>
        Tu sesión se cerrará por inactividad en <b>{seconds}s</b>.
      </p>
      <button
        onClick={() => onStay()}
        className="px-3 py-1 rounded-md bg-indigo-600 text-white text-sm"
      >
        Seguir conectado
      </button>
    </div>
  );

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !isTokenValid(token)) return; // no montar si no hay sesión válida

    const { activityKey, logoutKey } = getSessionKeys();

    // Storage (claves de esta sesión)
    const onStorage = (e) => {
      if (e.key === activityKey && e.newValue) {
        lastActivityRef.current = Number(e.newValue) || Date.now();
        // Al haber actividad desde otra pestaña, retiramos aviso (si estaba)
        dismissWarn();
      }
      if (e.key === logoutKey && e.newValue) {
        clearAllTimers();
        dismissWarn();
        forceLogout("synced");
      }
    };
    window.addEventListener("storage", onStorage);

    // Canal por usuario
    if ("BroadcastChannel" in window) {
      const { channelName } = getSessionKeys();
      bcRef.current = new BroadcastChannel(channelName);
      bcRef.current.onmessage = (msg) => {
        if (msg?.data?.type === "LOGOUT") {
          clearAllTimers();
          dismissWarn();
          forceLogout("synced");
        }
        if (msg?.data?.type === "ACTIVITY" && msg?.data?.stamp) {
          lastActivityRef.current = Number(msg.data.stamp);
          dismissWarn();
        }
      };
    }

    // Eventos de actividad
    const events = [
      "click",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
      "wheel",
      "mousemove",
      "focus",
      "visibilitychange",
    ];
    const handler = (ev) => {
      if (
        ev.type === "visibilitychange" &&
        document.visibilityState !== "visible"
      )
        return;
      markActivity();
    };
    events.forEach((evt) =>
      window.addEventListener(evt, handler, { passive: true })
    );

    // Iniciar el tick
    startTick();

    return () => {
      clearAllTimers();
      dismissWarn();
      events.forEach((evt) => window.removeEventListener(evt, handler));
      window.removeEventListener("storage", onStorage);
      if (bcRef.current) {
        bcRef.current.close();
        bcRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeoutMs, warnMs]);

  return children;
}
