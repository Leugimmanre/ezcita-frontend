// src/components/settingsComponents/Users.jsx
import { useState, useMemo, useRef, useEffect } from "react";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [menuPosition, setMenuPosition] = useState("bottom");
  const navigate = useNavigate();
  const menuRefs = useRef({});
  const tableContainerRef = useRef();

  // Función para normalizar texto (eliminar acentos y convertir a minúsculas)
  const normalizeText = (text) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  };

  // Filtrar usuarios según el término de búsqueda
  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;
    
    const normalizedSearch = normalizeText(searchTerm);
    return users.filter(user => 
      normalizeText(user.name).includes(normalizedSearch) ||
      normalizeText(user.email).includes(normalizedSearch) ||
      (user.phone && normalizeText(user.phone).includes(normalizedSearch)) ||
      normalizeText(user.admin ? "admin" : "user").includes(normalizedSearch) ||
      normalizeText(user.verified ? "sí" : "no").includes(normalizedSearch)
    );
  }, [users, searchTerm]);

  // Efecto para cerrar menús al hacer scroll
  useEffect(() => {
    const handleScroll = () => {
      setOpenMenuId(null);
    };

    window.addEventListener('scroll', handleScroll, true);
    
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, []);

  // Efecto para cerrar menús al hacer clic fuera de ellos
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openMenuId) {
        const menuElement = menuRefs.current[openMenuId];
        if (menuElement && !menuElement.contains(event.target)) {
          setOpenMenuId(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenuId]);

  // Función para determinar la posición del menú
  const calculateMenuPosition = (userId, index) => {
    if (!tableContainerRef.current) return;
    
    const tableRect = tableContainerRef.current.getBoundingClientRect();
    const rowHeight = 70; // Altura aproximada de cada fila
    const menuHeight = 120; // Altura aproximada del menú
    
    // Calcular si el menú cabe debajo
    const spaceBelow = tableRect.bottom - (tableRect.top + (index + 1) * rowHeight);
    
    if (spaceBelow < menuHeight) {
      setMenuPosition("top");
    } else {
      setMenuPosition("bottom");
    }
    
    setOpenMenuId(openMenuId === userId ? null : userId);
  };

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
        setOpenMenuId(null); // Cerrar el menú después de eliminar
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

      {/* Barra de búsqueda */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Buscar usuarios (soporta caracteres latinos)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      <div 
        ref={tableContainerRef}
        className="bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Teléfono
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
              {filteredUsers.map((u, index) => (
                <tr 
                  key={u._id} 
                  className="hover:bg-gray-50 transition-colors"
                  style={{ 
                    minHeight: '80px',
                    height: index === filteredUsers.length - 1 ? '80px' : 'auto'
                  }}
                >
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {u.name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {u.phone || "-"}
                    </div>{" "}
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
                    <div className="flex justify-center">
                      <div className="relative">
                        <button
                          onClick={() => calculateMenuPosition(u._id, index)}
                          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                          </svg>
                        </button>
                        
                        {openMenuId === u._id && (
                          <div 
                            ref={el => menuRefs.current[u._id] = el}
                            className={`absolute right-0 z-50 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 ${
                              menuPosition === "top" 
                                ? "bottom-full mb-1" 
                                : "top-full mt-1"
                            }`}
                          >
                            <button
                              onClick={() => {
                                navigate(`/settings/users/${u._id}`);
                                setOpenMenuId(null);
                              }}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              Ver detalles
                            </button>
                            <button
                              onClick={() => {
                                setEditId(u._id);
                                setOpenMenuId(null);
                              }}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              Editar
                            </button>
                            <button
                              disabled={isDeleting}
                              onClick={() => handleDelete(u._id, u.name)}
                              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 disabled:text-gray-400"
                            >
                              {isDeleting ? "Eliminando..." : "Eliminar"}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredUsers.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-gray-500 text-sm"
                  >
                    {searchTerm ? "No se encontraron usuarios que coincidan con la búsqueda" : "No hay usuarios registrados"}
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