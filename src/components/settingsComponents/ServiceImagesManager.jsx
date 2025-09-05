// src/components/settingsComponents/ServiceImagesManager.jsx
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getServiceById,
  uploadServiceImage,
  deleteServiceImage,
} from "@/services/servicesAPI";
import Button from "@/components/ui/Button";
import { toast } from "react-toastify";

export default function ServiceImagesManager({ serviceId }) {
  // Estado para multiples archivos
  const [files, setFiles] = useState([]);
  const [alt, setAlt] = useState("");

  const queryClient = useQueryClient();

  // Traer la última versión del servicio (incluye images[])
  const { data: service, isLoading } = useQuery({
    queryKey: ["service", serviceId],
    queryFn: () => getServiceById(serviceId),
    enabled: !!serviceId,
  });

  // Subir 1..n archivos (el backend acepta 1 por request: iteramos)
  const uploadMutation = useMutation({
    mutationFn: async () => {
      for (const file of files) {
        await uploadServiceImage({ serviceId, file, alt });
      }
    },
    onSuccess: () => {
      toast.success("Imágenes subidas correctamente");
      setFiles([]);
      setAlt("");
      queryClient.invalidateQueries(["service", serviceId]);
      queryClient.invalidateQueries(["services"]);
    },
    onError: (error) => {
      console.error("Upload error:", error?.response?.data || error);
      const serverMsg =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        "Error";
      toast.error(serverMsg);
    },
  });

  // Eliminar imagen
  const deleteMutation = useMutation({
    mutationFn: ({ publicId }) => deleteServiceImage({ serviceId, publicId }),
    onSuccess: () => {
      toast.success("Imagen eliminada");
      queryClient.invalidateQueries(["service", serviceId]);
      queryClient.invalidateQueries(["services"]);
    },
    onError: () => toast.error("Error al eliminar la imagen"),
  });

  if (isLoading) {
    return <div className="text-sm text-gray-500">Cargando imágenes…</div>;
  }

  const images = service?.images || [];

  return (
    <div className="">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">
        Imágenes del servicio
      </h3>

      {/* Grid de imágenes */}
      {images.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {images.map((img) => (
            <div
              key={img.publicId}
              className="border rounded-lg overflow-hidden bg-white"
            >
              {/* Miniatura */}
              <div className="aspect-video bg-gray-100">
                <img
                  src={img.url}
                  alt={img.alt || service.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-2 text-xs text-gray-600 break-words">
                <div className="truncate">alt: {img.alt || "-"}</div>
                <div className="truncate">id: {img.publicId}</div>
                <div className="mt-2 flex justify-end">
                  <Button
                    size="xs"
                    variant="danger-outline"
                    onClick={() =>
                      deleteMutation.mutate({ publicId: img.publicId })
                    }
                    disabled={deleteMutation.isLoading}
                  >
                    {deleteMutation.isLoading ? "Eliminando…" : "Eliminar"}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 mb-4">No hay imágenes aún.</p>
      )}

      {/* Subida de imágenes */}
      <div className="rounded-lg border p-4 bg-gray-50">
        <div className="flex flex-col md:flex-row gap-3 items-start md:items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Selecciona imágenes
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setFiles(Array.from(e.target.files || []))}
              className="block w-full text-sm"
            />
            {files.length > 0 && (
              <div className="text-xs text-gray-500 mt-1">
                {files.length} archivo(s) seleccionados
              </div>
            )}
          </div>

          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Texto alternativo (opcional)
            </label>
            <input
              type="text"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              placeholder="Descripción de la imagen"
              className="w-full border rounded-md px-3 py-2 text-sm"
            />
          </div>

          <div>
            <Button
              variant="primary"
              onClick={() => uploadMutation.mutate()}
              disabled={files.length === 0 || uploadMutation.isLoading}
            >
              {uploadMutation.isLoading ? "Subiendo…" : "Subir imágenes"}
            </Button>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Formatos admitidos: imágenes. Tamaño máx: 8MB por archivo.
        </p>
      </div>
    </div>
  );
}
