import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createService } from "@/services/servicesAPI";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Select from "@/components/ui/Select";
import { toast } from "react-toastify";

export default function CreateServiceForm({ onSuccess }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm();

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createService,
    onSuccess: () => {
      queryClient.invalidateQueries(["services"]);
      toast.success("Servicio creado correctamente");
      reset();
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(`Error al crear el servicio: ${error.message}`);
    },
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Input
          label="Nombre del servicio"
          placeholder="Corte de cabello"
          {...register("name", { required: "El nombre es obligatorio" })}
          error={errors.name?.message}
        />

        <Input
          label="Categoría"
          placeholder="Peluquería"
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
          placeholder="15"
          {...register("price", {
            required: "El precio es obligatorio",
            min: { value: 0.01, message: "El precio debe ser mayor a 0" },
          })}
          error={errors.price?.message}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Duración"
            type="number"
            placeholder="30"
            {...register("duration", {
              required: "La duración es obligatoria",
              min: { value: 1, message: "La duración mínima es 1 minuto" },
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

      <div className="flex justify-end pt-4">
        <Button type="submit" variant="primary" loading={isSubmitting}>
          {isSubmitting ? "Creando..." : "Crear Servicio"}
        </Button>
      </div>
    </form>
  );
}
