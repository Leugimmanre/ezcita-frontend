// src/components/settingsComponents/EditUserModal.jsx
import { useQuery } from "@tanstack/react-query";
import { getUserById } from "@/services/userAPI";
import { useUsersData } from "@/hooks/useUsersData";
import UserForm from "./forms/UserForm";
import { toast } from "react-toastify";

export default function EditUserModal({ id, onClose }) {
  const { updateUserAsync, isUpdating } = useUsersData();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["users", id],
    queryFn: () => getUserById(id),
    enabled: !!id,
  });

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div
        className="bg-white rounded-xl w-full max-w-lg p-6 shadow-2xl transform transition-all duration-300 scale-95 animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-blue-600"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800">
              Editar usuario
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            aria-label="Cerrar modal"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto pr-2">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-3"></div>
              <p className="text-gray-600">Cargando datos del usuario...</p>
            </div>
          )}

          {isError && (
            <div className="flex flex-col items-center justify-center py-8 text-red-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 mb-3"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="font-medium mb-2">Error cargando el usuario</p>
              <p className="text-sm text-gray-600 text-center">
                No se pudieron cargar los datos del usuario. Por favor, intente
                nuevamente.
              </p>
            </div>
          )}

          {data && (
            <UserForm
              mode="edit"
              defaultValues={{
                name: data.name,
                lastname: data.lastname,
                email: data.email,
                admin: data.admin,
                verified: data.verified,
              }}
              isSubmitting={isUpdating}
              onSubmit={async (values) => {
                try {
                  await updateUserAsync({ id, data: values });
                  onClose();
                  toast.success("Usuario actualizado correctamente");
                } catch (e) {
                  toast.error(
                    e?.response?.data?.message ||
                      e?.message ||
                      "Error al actualizar"
                  );
                }
              }}
            />
          )}
        </div>
      </div>

      <style>{`
        @keyframes scaleIn {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
