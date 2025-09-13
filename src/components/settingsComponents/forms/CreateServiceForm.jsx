// src/components/settingsComponents/forms/CreateServiceForm.jsx
import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createService, uploadServiceImage } from "@/services/servicesAPI";
import { useForm } from "react-hook-form";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Select from "@/components/ui/Select";
import { toast } from "react-toastify";

export default function CreateServiceForm({ onSuccess }) {
  // Estado para archivos y previews
  const [files, setFiles] = useState([]); // File[]
  const [previews, setPreviews] = useState([]); // object URLs

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    defaultValues: {
      name: "",
      category: "",
      description: "",
      price: "",
      duration: "",
      durationUnit: "minutes",
    },
  });

  const nameValue = watch("name");
  const queryClient = useQueryClient();

  // Generar y limpiar previews
  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [files]);

  // Mutación: crear servicio y luego subir imágenes (si hay)
  const mutation = useMutation({
    mutationFn: async (formData) => {
      // 1) Crear servicio (JSON)
      const created = await createService({
        ...formData,
        price: parseFloat(formData.price),
        duration: parseInt(formData.duration, 10),
      });

      const service = created?.data || created; // normaliza
      const serviceId = service?._id;

      if (!serviceId) {
        throw new Error("No se pudo obtener el ID del servicio creado.");
      }

      // 2) Subir imágenes (opcional)
      if (files.length > 0) {
        // Subimos de una en una (el backend acepta 1 por request)
        await Promise.all(
          files.map((file) =>
            uploadServiceImage({
              serviceId,
              file,
              // Usa el nombre del servicio como alt si no quieres otro campo
              alt: nameValue || file.name,
            })
          )
        );
      }

      return service;
    },
    onSuccess: (service) => {
      // Refrescar listado
      queryClient.invalidateQueries(["services"]);
      // 🧹 Limpiar formulario y archivos
      reset();
      setFiles([]);
      setPreviews([]);
      // Notificaciones + callback
      toast.success(
        `Servicio "${service?.name || "nuevo"}"${
          files.length ? " creado con imágenes" : " creado"
        } correctamente`
      );
      onSuccess?.(service?.name || "");
    },
    onError: (error) => {
      console.error(error);
      toast.error(
        error?.message || "Error al crear el servicio o subir imágenes"
      );
    },
  });

  // Manejo de selección de archivos
  const handleFilesChange = (e) => {
    const selected = Array.from(e.target.files || []);
    // Filtro simple (opcional): solo imágenes y < 8MB
    const valid = selected.filter(
      (f) => f.type.startsWith("image/") && f.size <= 8 * 1024 * 1024
    );
    if (valid.length < selected.length) {
      toast.warn("Se omitieron archivos no válidos (tipo o tamaño).");
    }
    setFiles((prev) => [...prev, ...valid]);
  };

  // Quitar un archivo antes de crear
  const removeFileAt = (idx) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  // Envío del formulario
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
              { value: "minutes", label: "minutos" },
              { value: "horas", label: "horas" },
            ]}
          />
        </div>
      </div>

      {/* Subir imágenes opcionales */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Imágenes del servicio (opcional)
        </label>

        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFilesChange}
          className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />

        {/* Previews */}
        {previews.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
            {previews.map((src, idx) => (
              <div
                key={src}
                className="relative border rounded-md overflow-hidden bg-gray-50"
              >
                <img
                  src={src}
                  alt={`preview-${idx + 1}`}
                  className="w-full h-28 object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeFileAt(idx)}
                  className="absolute top-1 right-1 text-xs bg-white/90 hover:bg-white rounded px-2 py-0.5 border"
                >
                  Quitar
                </button>
                <div className="p-2 text-[11px] text-gray-600 truncate">
                  {files[idx]?.name}
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-gray-500">
          Formatos admitidos: imágenes. Tamaño máx: 8MB por archivo.
        </p>
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" variant="primary" loading={mutation.isLoading}>
          {mutation.isLoading ? "Creando..." : "Crear Servicio"}
        </Button>
      </div>
    </form>
  );
}
