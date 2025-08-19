// src/components/settingsComponents/forms/EditServiceForm.jsx
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateService } from "@/services/servicesAPI";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Select from "@/components/ui/Select";
import { toast } from "react-toastify";

export default function EditServiceForm({ service, onSuccess }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: service.name,
      price: service.price,
      category: service.category,
      description: service.description,
      duration: service.duration,
      durationUnit: service.durationUnit,
    },
  });

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data) => {
      return updateService(service._id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["services"]);
      toast.success("Servicio actualizado correctamente");
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(`Error al actualizar el servicio: ${error.message}`);
      console.error("Error detallado:", error);
    },
  });

  const onSubmit = (data) => {
    const formData = {
      ...data,
      price: parseFloat(data.price),
      duration: parseInt(data.duration, 10),
    };

    if (formData.category === "") {
      delete formData.category;
    }

    mutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Input
          label="Nombre del servicio"
          placeholder="Ej: Corte de cabello"
          {...register("name", { required: "El nombre es obligatorio" })}
          error={errors.name?.message}
        />

        <Input
          label="Categoría"
          placeholder="Ej: Peluquería"
          {...register("category")}
        />
      </div>

      <Textarea
        label="Descripción"
        placeholder="Describe el servicio..."
        {...register("description")}
        rows={3}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Input
          label="Precio (€)"
          type="number"
          step="0.01"
          placeholder="Ej: 15.00"
          {...register("price", {
            required: "El precio es obligatorio",
            min: { value: 0.01, message: "El precio debe ser mayor a 0" },
            valueAsNumber: true,
          })}
          error={errors.price?.message}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Duración"
            type="number"
            placeholder="Ej: 30"
            {...register("duration", {
              required: "La duración es obligatoria",
              min: { value: 1, message: "La duración mínima es 1 minuto" },
              valueAsNumber: true,
            })}
            error={errors.duration?.message}
          />

          <Select
            label="Unidad"
            {...register("durationUnit")}
            options={[
              { value: "min.", label: "minutos" },
              { value: "horas", label: "horas" },
            ]}
          />
        </div>
      </div>

      <div className="flex justify-end pt-4 space-x-3">
        <Button type="button" variant="secondary" onClick={onSuccess}>
          Cancelar
        </Button>

        <Button type="submit" variant="primary" loading={mutation.isLoading}>
          {mutation.isLoading ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </div>
    </form>
  );
}
