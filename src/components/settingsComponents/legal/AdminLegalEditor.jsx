// src/components/legal/AdminLegalEditor.jsx
// Editor simple para admin: permite editar términos o privacidad

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { getLegalDoc, updateLegalDoc } from "@/services/legalAPI";
import { toast } from "react-toastify";

const TYPES = [
  { value: "terms", label: "Términos y Condiciones" },
  { value: "privacy", label: "Política de Privacidad" },
];

export default function AdminLegalEditor({ defaultType = "terms" }) {
  // estado tipo seleccionado
  const [selectedType, setSelectedType] = useState(defaultType);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm({
    defaultValues: {
      type: defaultType,
      version: "1.0",
      effectiveDate: new Date().toISOString().slice(0, 10),
      content: "",
    },
  });

  // cargar doc cuando cambia tipo
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    (async () => {
      try {
        const data = await getLegalDoc(selectedType);
        if (!mounted) return;
        reset({
          type: selectedType,
          version: data.version || "1.0",
          effectiveDate: (data.effectiveDate || new Date().toISOString()).slice(
            0,
            10
          ),
          content: data.content || "",
        });
      } catch {
        // ya gestionado por servicio
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, [selectedType, reset]);

  const onSubmit = async (values) => {
    try {
      setSaving(true);
      await updateLegalDoc({
        type: selectedType,
        content: values.content,
        version: values.version,
        effectiveDate: values.effectiveDate,
      });
      toast.success("Documento legal actualizado");
      reset(values); // marca como no-dirty
    } catch (e) {
      toast.error(e?.response?.data?.message || "No se pudo actualizar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Selector de tipo */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-gray-700">Documento:</label>
        <select
          className="border rounded px-3 py-2"
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
        >
          {TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {/* Formulario */}
      {loading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-5 w-1/3 bg-gray-200 rounded" />
          <div className="h-10 w-full bg-gray-200 rounded" />
          <div className="h-96 w-full bg-gray-200 rounded" />
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Versión */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Versión
            </label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              {...register("version", { required: true })}
              placeholder="1.0"
            />
          </div>

          {/* Fecha de vigencia */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de vigencia
            </label>
            <input
              type="date"
              className="w-full border rounded px-3 py-2"
              {...register("effectiveDate", { required: true })}
            />
          </div>

          {/* Contenido */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contenido
            </label>
            <textarea
              rows={18}
              className="w-full border rounded px-3 py-2 font-mono"
              {...register("content")}
              placeholder="Redacta aquí el contenido del documento legal..."
            />
            <p className="mt-2 text-xs text-gray-500">
              Consejo: puedes guardar Markdown o texto plano. La vista pública
              lo mostrará como texto (whitespace-pre-wrap). Si quieres HTML,
              puedes cambiar a un renderer HTML con{" "}
              <code>dangerouslySetInnerHTML</code>
              (bajo tu responsabilidad).
            </p>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="submit"
              disabled={saving || !isDirty}
              className={`px-4 py-2 rounded text-white ${
                saving
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              {saving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
