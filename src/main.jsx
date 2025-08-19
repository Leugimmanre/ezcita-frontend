// src/main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/index.css";
import { router } from "@/router.jsx";
import { RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TenantProvider } from "@/contexts/TenantProvider.jsx";
import { AppointmentProvider } from "@/contexts/AppointmentProvider";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getTenantId, setTenantId } from "./utils/tenantStorage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Configura para que Toast muestre errores automáticamente
      onError: (error) => {
        toast.error(error.message);
      },
    },
  },
});

// Establecer el tenantId desde .env
const envTenantId = import.meta.env.VITE_TENANT_ID || "default";
if (!getTenantId()) setTenantId(envTenantId);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppointmentProvider>
        <TenantProvider>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
          <RouterProvider router={router} />
        </TenantProvider>
      </AppointmentProvider>
    </QueryClientProvider>
  </StrictMode>
);
