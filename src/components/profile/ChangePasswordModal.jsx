// src/components/profile/ChangePasswordModal.jsx
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import Modal from "@/components/ui/Modal";
import { changePassword, getMe } from "@/services/userAPI";

export default function ChangePasswordModal({ isOpen, onClose }) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  useEffect(() => {
    if (!isOpen) reset();
  }, [isOpen, reset]);

  const getMyId = async () => {
    const stored = localStorage.getItem("user_EzCita");
    if (stored) {
      const u = JSON.parse(stored);
      return u?._id || u?.id || null;
    }
    const me = await getMe();
    return me?._id || me?.id || null;
  };

  const onSubmit = async (values) => {
    try {
      if (values.newPassword !== values.confirmNewPassword) {
        toast.error("Las nuevas contraseñas no coinciden");
        return;
      }

      const myId = await getMyId();
      if (!myId) {
        toast.error("No se pudo identificar al usuario autenticado");
        return;
      }

      await changePassword(myId, {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });

      toast.success("Contraseña actualizada correctamente");
      onClose?.();
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        "No se pudo cambiar la contraseña";
      toast.error(msg);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cambiar contraseña"
      size="md"
      overlayOpacity={75}
    >
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Contraseña actual
          </label>
          <input
            type="password"
            className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:outline-none transition-colors ${
              errors.currentPassword
                ? "border-red-500 focus:ring-red-200 dark:focus:ring-red-800"
                : "border-gray-300 focus:border-blue-500 focus:ring-blue-200 dark:focus:ring-blue-800"
            } bg-white dark:bg-gray-800 text-gray-900 dark:text-white`}
            placeholder="Ingresa tu contraseña actual"
            {...register("currentPassword", {
              required: "La contraseña actual es obligatoria",
              minLength: { value: 6, message: "Mínimo 6 caracteres" },
            })}
          />
          {errors.currentPassword && (
            <p className="text-red-600 text-xs mt-2 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {errors.currentPassword.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Nueva contraseña
          </label>
          <input
            type="password"
            className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:outline-none transition-colors ${
              errors.newPassword
                ? "border-red-500 focus:ring-red-200 dark:focus:ring-red-800"
                : "border-gray-300 focus:border-blue-500 focus:ring-blue-200 dark:focus:ring-blue-800"
            } bg-white dark:bg-gray-800 text-gray-900 dark:text-white`}
            placeholder="Crea una nueva contraseña"
            {...register("newPassword", {
              required: "La nueva contraseña es obligatoria",
              minLength: { value: 6, message: "Mínimo 6 caracteres" },
            })}
          />
          {errors.newPassword && (
            <p className="text-red-600 text-xs mt-2 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {errors.newPassword.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Confirmar nueva contraseña
          </label>
          <input
            type="password"
            className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:outline-none transition-colors ${
              errors.confirmNewPassword
                ? "border-red-500 focus:ring-red-200 dark:focus:ring-red-800"
                : "border-gray-300 focus:border-blue-500 focus:ring-blue-200 dark:focus:ring-blue-800"
            } bg-white dark:bg-gray-800 text-gray-900 dark:text-white`}
            placeholder="Repite tu nueva contraseña"
            {...register("confirmNewPassword", {
              required: "Debes confirmar la nueva contraseña",
              validate: (v) =>
                v === watch("newPassword") || "Las contraseñas no coinciden",
            })}
          />
          {errors.confirmNewPassword && (
            <p className="text-red-600 text-xs mt-2 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {errors.confirmNewPassword.message}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg font-medium text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Cancelar
          </button>
          <button
            disabled={isSubmitting}
            type="submit"
            className="px-5 py-2.5 rounded-lg font-medium text-sm bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                Guardando...
              </>
            ) : (
              "Guardar cambios"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
