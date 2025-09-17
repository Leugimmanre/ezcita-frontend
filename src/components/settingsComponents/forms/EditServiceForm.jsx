// src/components/settingsComponents/forms/EditServiceForm.jsx
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateService,
  uploadServiceImage,
  deleteServiceImage,
} from "@/services/servicesAPI";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Select from "@/components/ui/Select";
import { toast } from "react-toastify";

export default function EditServiceForm({
  service,
  onSuccess,
  onError,
  onCancel,
}) {
  const normalizeToAPIUnit = (u) => {
    const v = String(u || "").toLowerCase();
    if (["hour", "hours", "hora", "horas"].includes(v)) return "horas";
    return "minutes";
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: service.name,
      price: service.price,
      category: service.category,
      description: service.description,
      duration: service.duration,
      durationUnit: normalizeToAPIUnit(service.durationUnit),
    },
  });

  const qc = useQueryClient();

  // Estado: imágenes actuales del servicio
  const [images, setImages] = useState(service.images || []);

  // Estado: archivos nuevos + previews
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);

  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [files]);

  // Mutación: actualizar datos del servicio
  const updateMutation = useMutation({
    mutationFn: (data) => updateService(service._id, data),
    onSuccess: (updated) => {
      qc.invalidateQueries(["services"]);
      onSuccess?.(updated.name);
      toast.success("Servicio actualizado");
    },
    onError: (error) => {
      console.error("Error update:", error?.response?.data || error);
      toast.error(
        error?.response?.data?.error || "Error al actualizar el servicio"
      );
      onError?.(error);
    },
  });

  // Subir todas las imágenes nuevas
  const uploadAllNewImages = async () => {
    if (!files.length) return [];

    const uploaded = await Promise.all(
      files.map((file) =>
        uploadServiceImage({
          serviceId: service._id,
          file,
          alt: service.name || file.name,
        })
      )
    );

    // Actualiza la galería local
    setImages((prev) => [...prev, ...uploaded]);
    // Limpia selección
    setFiles([]);
    setPreviews([]);
    return uploaded;
  };

  // Eliminar una imagen existente
  const [deletingId, setDeletingId] = useState(null);
  const handleDeleteImage = async (publicId) => {
    try {
      setDeletingId(publicId);
      await deleteServiceImage({ serviceId: service._id, publicId });
      setImages((prev) => prev.filter((img) => img.publicId !== publicId));
      toast.success("Imagen eliminada");
      // Refrescar listado externo si quieres que se vea el cambio fuera
      qc.invalidateQueries(["services"]);
    } catch (error) {
      console.error("Delete image error:", error?.response?.data || error);
      toast.error(
        error?.response?.data?.error || "No se pudo eliminar la imagen"
      );
    } finally {
      setDeletingId(null);
    }
  };

  // Manejar selección de archivos
  const handleFilesChange = (e) => {
    const selected = Array.from(e.target.files || []);
    const valid = selected.filter(
      (f) => f.type.startsWith("image/") && f.size <= 8 * 1024 * 1024
    );
    if (valid.length < selected.length) {
      toast.warn("Algunos archivos fueron omitidos (tipo o tamaño inválido).");
    }
    setFiles((prev) => [...prev, ...valid]);
  };

  const removeFileAt = (idx) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  // Enviar formulario: actualiza datos y luego sube nuevas imágenes (si hay)
  const onSubmit = async (data) => {
    const payload = {
      ...data,
      price: parseFloat(data.price),
      duration: parseInt(data.duration, 10),
    };
    if (payload.category === "") delete payload.category;

    // 1) actualiza datos
    await updateMutation.mutateAsync(payload);

    // 2) sube imágenes nuevas (no cierra modal)
    if (files.length) {
      try {
        await uploadAllNewImages();
        toast.success("Imágenes nuevas subidas");
      } catch (err) {
        console.error("Upload images error:", err?.response?.data || err);
        toast.error("Algunas imágenes no pudieron subirse");
      }
    }
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
              { value: "minutos", label: "minutos" },
              { value: "horas", label: "horas" },
            ]}
          />
        </div>
      </div>

      {/* Galería de imágenes existentes (con eliminar) */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Imágenes actuales
        </label>

        {images.length === 0 ? (
          <p className="text-sm text-gray-500">
            Este servicio aún no tiene imágenes.
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {images.map((img) => (
              <div
                key={img.publicId}
                className="relative border rounded-md overflow-hidden bg-gray-50"
              >
                <img
                  src={img.url}
                  alt={img.alt || service.name}
                  className="w-full h-28 object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleDeleteImage(img.publicId)}
                  disabled={deletingId === img.publicId}
                  className="absolute top-1 right-1 text-xs bg-white/90 hover:bg-white rounded px-2 py-0.5 border"
                >
                  {deletingId === img.publicId ? "Eliminando..." : "Eliminar"}
                </button>
                {img.alt && (
                  <div className="p-2 text-[11px] text-gray-600 truncate">
                    {img.alt}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ⬆️ Añadir imágenes nuevas (igual que en crear) */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Añadir imágenes nuevas
        </label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFilesChange}
          className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />

        {previews.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
            {previews.map((src, idx) => (
              <div
                key={src}
                className="relative border rounded-md overflow-hidden bg-gray-50"
              >
                <img
                  src={src}
                  alt={`new-${idx}`}
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
          Formatos: imágenes. Tamaño máx: 8MB por archivo.
        </p>
      </div>

      <div className="flex justify-end pt-4 space-x-3">
        <Button type="button" variant="secondary" onClick={() => onCancel?.()}>
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="primary"
          loading={isSubmitting || updateMutation.isLoading}
        >
          {isSubmitting || updateMutation.isLoading
            ? "Guardando..."
            : "Guardar Cambios"}
        </Button>
      </div>
    </form>
  );
}
