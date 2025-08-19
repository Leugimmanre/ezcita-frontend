// src/views/settingsViews/SettingsServicesView.jsx
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { getServices, deleteService } from "@/services/servicesAPI";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { PlusIcon } from "@heroicons/react/24/outline";
import EditServiceForm from "@/components/settingsComponents/forms/EditServiceForm";
import CreateServiceForm from "@/components/settingsComponents/forms/CreateServiceForm";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import Alert from "@/components/ui/Alert";
import SettingsServiceItems from "@/components/settingsComponents/SettingsServiceItems";

export default function SettingsServices() {

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [deletingService, setDeletingService] = useState(null);

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
      <div className="flex justify-between items-center mb-6">
        <div className="flex flex-col justify-startmb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Gestión de Servicios
          </h1>
          <p className="mt-1 text-gray-600">
            Administra los servicios de tu negocio
          </p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          variant="primary"
          icon={<PlusIcon className="h-5 w-5" />}
        >
          Nuevo Servicio
        </Button>
      </div>

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
      {!isLoading && !isError && services.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {services.map((service) => (
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
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay servicios creados
          </h3>
          <p className="text-gray-500 mb-4">
            Comienza creando tu primer servicio
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
