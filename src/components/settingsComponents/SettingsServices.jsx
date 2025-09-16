// src/components/settingsComponents/SettingsServices.jsx
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { getServices, deleteService } from "@/services/servicesAPI";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { PlusIcon, MagnifyingGlassIcon, FunnelIcon } from "@heroicons/react/24/outline";
import EditServiceForm from "@/components/settingsComponents/forms/EditServiceForm";
import CreateServiceForm from "@/components/settingsComponents/forms/CreateServiceForm";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import Alert from "@/components/ui/Alert";
import SettingsServiceItems from "@/components/settingsComponents/SettingsServiceItems";

export default function SettingsServices() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [deletingService, setDeletingService] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("name");

  // Consulta de servicios
  const {
    data: services = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["services"],
    queryFn: getServices,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  // Función para normalizar texto (eliminar acentos y caracteres especiales)
  const normalizeText = (text) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  };

  // Filtrar y ordenar servicios
  const filteredServices = useMemo(() => {
    let result = [...services];
    
    // Filtrar por término de búsqueda (soporte para caracteres latinos)
    if (searchTerm) {
      const normalizedSearch = normalizeText(searchTerm);
      result = result.filter(service => 
        normalizeText(service.name).includes(normalizedSearch) ||
        (service.description && normalizeText(service.description).includes(normalizedSearch))
      );
    }
    
    // Ordenar servicios
    result.sort((a, b) => {
      switch (sortOption) {
        case "name":
          return a.name.localeCompare(b.name);
        case "price-high":
          return b.price - a.price;
        case "price-low":
          return a.price - b.price;
        case "duration":
          return a.duration - b.duration;
        default:
          return 0;
      }
    });
    
    return result;
  }, [services, searchTerm, sortOption]);

  // Manejar eliminación de servicio
  const handleDeleteService = async () => {
    if (!deletingService) return;

    try {
      await deleteService(deletingService._id);
      refetch();
      setDeletingService(null);
      toast.success(
        `Servicio "${deletingService.name}" eliminado correctamente`
      );
    } catch (error) {
      console.error("Error deleting service:", error);
      toast.error("Error al eliminar el servicio");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Gestión de Servicios
          </h1>
          <p className="mt-1 text-gray-600">
            Administra los servicios de tu negocio
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar servicios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex gap-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FunnelIcon className="h-5 w-5 text-gray-400" />
              </div>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
              >
                <option value="name">Ordenar por nombre</option>
                <option value="price-high">Precio: mayor a menor</option>
                <option value="price-low">Precio: menor a mayor</option>
                <option value="duration">Duración</option>
              </select>
            </div>
            
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              variant="primary"
              icon={<PlusIcon className="h-5 w-5" />}
            >
              Nuevo Servicio
            </Button>
          </div>
        </div>
      </div>

      {/* Información de resultados */}
      {!isLoading && !isError && (
        <div className="mb-4 flex justify-between items-center">
          <p className="text-sm text-gray-600">
            {filteredServices.length} de {services.length} servicios
            {searchTerm && (
              <span>
                {" "}para "<strong>{searchTerm}</strong>"
              </span>
            )}
          </p>
          {(searchTerm || sortOption !== "name") && (
            <button
              onClick={() => {
                setSearchTerm("");
                setSortOption("name");
              }}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      )}

      {/* Estados de carga/error */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 border-b border-gray-200">
              <LoadingSkeleton height={80} />
            </div>
          ))}
        </div>
      )}

      {isError && (
        <Alert
          type="error"
          title="Error de conexión"
          message="No pudimos cargar los servicios. Por favor intenta nuevamente."
          actions={
            <Button variant="primary" onClick={refetch}>
              Reintentar
            </Button>
          }
        />
      )}

      {/* Lista de servicios */}
      {!isLoading && !isError && filteredServices.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          {filteredServices.map((service) => (
            <SettingsServiceItems
              key={service._id}
              service={service}
              onEdit={setEditingService}
              onDelete={setDeletingService}
            />
          ))}
        </div>
      )}

      {/* Sin servicios disponibles */}
      {!isLoading && !isError && services.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center shadow-sm">
          <div className="mx-auto w-24 h-24 flex items-center justify-center rounded-full bg-gray-100 mb-4">
            <PlusIcon className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay servicios creados
          </h3>
          <p className="text-gray-500 mb-4">
            Comienza creando tu primer servicio para tu negocio
          </p>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            variant="primary"
            icon={<PlusIcon className="h-5 w-5" />}
          >
            Crear primer servicio
          </Button>
        </div>
      )}

      {/* Sin resultados de búsqueda */}
      {!isLoading && !isError && services.length > 0 && filteredServices.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center shadow-sm">
          <div className="mx-auto w-24 h-24 flex items-center justify-center rounded-full bg-gray-100 mb-4">
            <MagnifyingGlassIcon className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No se encontraron servicios
          </h3>
          <p className="text-gray-500 mb-4">
            No hay resultados para "<strong>{searchTerm}</strong>". Intenta con otros términos de búsqueda.
          </p>
          <Button
            onClick={() => setSearchTerm("")}
            variant="secondary"
          >
            Limpiar búsqueda
          </Button>
        </div>
      )}

      {/* Modales */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Crear Nuevo Servicio"
        size="lg"
      >
        <CreateServiceForm
          onSuccess={(serviceName) => {
            setIsCreateModalOpen(false);
            refetch();
            toast.success(`Servicio "${serviceName}" creado correctamente`);
          }}
          onError={() => {
            toast.error("Error al crear el servicio");
          }}
        />
      </Modal>

      <Modal
        isOpen={!!editingService}
        onClose={() => setEditingService(null)}
        title="Editar Servicio"
        size="lg"
      >
        {editingService && (
          <EditServiceForm
            service={editingService}
            onSuccess={(serviceName) => {
              setEditingService(null);
              refetch();
              toast.success(
                `Servicio "${serviceName}" actualizado correctamente`
              );
            }}
            onError={() => {
              toast.error("Error al actualizar  el servicio");
            }}
          />
        )}
      </Modal>

      <Modal
        isOpen={!!deletingService}
        onClose={() => setDeletingService(null)}
        title="Eliminar Servicio"
        size="md"
      >
        {deletingService && (
          <div className="p-4">
            <p className="text-gray-700 mb-4">
              ¿Estás seguro de que deseas eliminar el servicio{" "}
              <strong>"{deletingService.name}"</strong>? Esta acción no se puede
              deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => setDeletingService(null)}
              >
                Cancelar
              </Button>
              <Button variant="danger" onClick={handleDeleteService}>
                Eliminar
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}