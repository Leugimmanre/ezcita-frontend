import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteService } from "@/services/servicesAPI";
import { toast } from "react-toastify";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

export default function DeleteServiceButton({ serviceId, isOpen, onClose }) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => deleteService(serviceId),
    onSuccess: () => {
      queryClient.invalidateQueries(["services"]);
      toast.success("Servicio eliminado correctamente");
      onClose();
    },
    onError: (error) => {
      toast.error(`Error al eliminar el servicio: ${error.message}`);
    },
  });

  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      title="Eliminar servicio"
      message="¿Estás seguro de que deseas eliminar este servicio? Esta acción no se puede deshacer."
      confirmText="Eliminar"
      onConfirm={mutation.mutate}
    />
  );
}
