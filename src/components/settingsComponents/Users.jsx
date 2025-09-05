// src/components/settingsComponents/Users.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUsersData } from "@/hooks/useUsersData";
import CreateUserModal from "../settingsComponents/CreateUserModal";
import EditUserModal from "./EditUserModal";
import { toast } from "react-toastify";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

export default function Users() {
  const { users, isLoading, isError, deleteUser, isDeleting, refetch } =
    useUsersData();

  const [showCreate, setShowCreate] = useState(false);
  const [editId, setEditId] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const navigate = useNavigate();

  const refreshData = async () => {
    try {
      await refetch();
      toast.success("Datos de usuarios actualizados");
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ??
          error?.message ??
          "Error al actualizar los datos"
      );
    }
  };

  const handleDelete = async (userId, userName) => {
    setUserToDelete({ id: userId, name: userName });
    setConfirmAction(() => async () => {
      try {
        await deleteUser(userId);
        toast.success(`Usuario "${userName}" eliminado correctamente`);
      } catch (e) {
        toast.error(
          e?.response?.data?.message ||
            e?.message ||
            "Error al eliminar el usuario"
        );
      }
    });
    setConfirmOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-100 border border-red-300 rounded-xl p-6 text-center">
        <p className="text-red-700 font-medium mb-3">
          Error al cargar los usuarios
        </p>
        <button
          onClick={refreshData}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white text-sm font-medium transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="my-10 max-w-7xl mx-auto px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Gestión de Usuarios
        </h1>
        <div className="flex gap-3">
          <button
            onClick={refreshData}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white text-sm font-medium transition-all"
          >
            Actualizar
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white text-sm font-medium transition-all"
            onClick={() => setShowCreate(true)}
          >
            Nuevo Usuario
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Verificado
                </th>
                <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {u.name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{u.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                        u.admin
                          ? "bg-purple-100 text-purple-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {u.admin ? "Admin" : "User"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                        u.verified
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {u.verified ? "Sí" : "No"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => navigate(`/settings/users/${u._id}`)}
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs transition-colors"
                      >
                        Detalles
                      </button>
                      <button
                        onClick={() => setEditId(u._id)}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        disabled={isDeleting}
                        onClick={() => handleDelete(u._id, u.name)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg text-xs transition-colors"
                      >
                        {isDeleting ? "Eliminando..." : "Eliminar"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {users.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-gray-500 text-sm"
                  >
                    No hay usuarios registrados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de creación */}
      {showCreate && (
        <CreateUserModal
          onClose={() => setShowCreate(false)}
          onSuccess={() => {
            toast.success("Usuario creado correctamente");
            refetch();
          }}
          onError={(error) => {
            toast.error(
              error?.response?.data?.message ||
                error?.message ||
                "Error al crear el usuario"
            );
          }}
        />
      )}

      {/* Modal de edición */}
      {editId && (
        <EditUserModal
          id={editId}
          onClose={() => setEditId(null)}
          onSuccess={() => {
            toast.success("Usuario actualizado correctamente");
            refetch();
          }}
          onError={(error) => {
            toast.error(
              error?.response?.data?.message ||
                error?.message ||
                "Error al actualizar el usuario"
            );
          }}
        />
      )}

      {/* Modal de confirmación */}
      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Confirmar eliminación"
        message={`¿Estás seguro de que deseas eliminar al usuario "${userToDelete?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        onConfirm={confirmAction}
      />
    </div>
  );
}
