// src/components/settingsComponents/BrandSettingsPage.jsx
import { useEffect, useMemo, useState } from "react";
import {
  getBrandSettings,
  updateBrandSettings,
  uploadBrandLogo,
  deleteBrandLogo,
  toAbsoluteUrl,
} from "@/services/brandApi";
import { toast } from "react-toastify";

// Lista corta de zonas horarias comunes (amplíala si quieres)
const TIMEZONES = [
  "Europe/Madrid",
  "Europe/Lisbon",
  "Europe/Paris",
  "Europe/Berlin",
  "UTC",
];

export default function BrandSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingLogo, setDeletingLogo] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showDeleteLogoModal, setShowDeleteLogoModal] = useState(false);

  const [brand, setBrand] = useState({
    brandName: "",
    brandDomain: "",
    contactEmail: "",
    timezone: "Europe/Madrid",
    frontendUrl: "",
    logo: null, // { url, filename, mimetype, size }
  });

  // Cargar datos
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await getBrandSettings();
        if (data) {
          setBrand({
            brandName: data.brandName || "",
            brandDomain: data.brandDomain || "",
            contactEmail: data.contactEmail || "",
            timezone: data.timezone || "Europe/Madrid",
            frontendUrl: data.frontendUrl || "",
            logo: data.logo || null,
          });
        }
      } catch (e) {
        console.error(e);
        toast("No se pudo cargar la configuración de marca");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const hasLogo = useMemo(() => !!brand.logo?.url, [brand.logo]);

  // Guardar campos de texto
  const onSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = {
        brandName: brand.brandName?.trim() || "",
        brandDomain: brand.brandDomain?.trim() || "",
        contactEmail: brand.contactEmail?.trim() || "",
        timezone: brand.timezone || "Europe/Madrid",
        frontendUrl: brand.frontendUrl?.trim() || "",
      };
      const updated = await updateBrandSettings(payload);
      setBrand((prev) => ({ ...prev, ...updated }));
      toast("Configuración de marca guardada");
    } catch (e) {
      console.error(e);
      toast(e?.response?.data?.message || "No se pudo guardar");
    } finally {
      setSaving(false);
    }
  };

  // Subir nuevo logo
  const onLogoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!/^image\/(png|jpeg|jpg|webp)$/.test(file.type)) {
      toast("Formato inválido. Usa PNG/JPG/WEBP");
      e.target.value = "";
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      toast("El logo no debe superar 3MB");
      e.target.value = "";
      return;
    }
    try {
      setUploading(true);
      const uploaded = await uploadBrandLogo(file);
      setBrand((prev) => ({ ...prev, logo: uploaded }));
      toast("Logo actualizado");
      e.target.value = "";
    } catch (err) {
      console.error(err);
      toast(err?.response?.data?.message || "No se pudo subir el logo");
    } finally {
      setUploading(false);
    }
  };

  // Abrir modal
  const requestDeleteLogo = () => setShowDeleteLogoModal(true);

  // Confirmar borrado (acción real)
  const confirmDeleteLogo = async () => {
    try {
      setDeletingLogo(true);
      await deleteBrandLogo();
      setBrand((prev) => ({ ...prev, logo: null }));
      toast("Logo eliminado");
    } catch (err) {
      console.error(err);
      toast(err?.response?.data?.message || "No se pudo eliminar el logo");
    } finally {
      setDeletingLogo(false);
      setShowDeleteLogoModal(false);
    }
  };

  // Cancelar (cerrar modal)
  const cancelDeleteLogo = () => setShowDeleteLogoModal(false);

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Configuración de Marca
        </h1>
        <p className="text-gray-700">Cargando…</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Configuración de Marca
        </h1>
      </div>

      {/* Formulario */}
      <form onSubmit={onSave} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Nombre de marca
            </label>
            <input
              type="text"
              className="w-full p-2 bg-white border border-gray-300 rounded-md text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={brand.brandName}
              onChange={(e) =>
                setBrand((p) => ({ ...p, brandName: e.target.value }))
              }
              placeholder="Ej. BarberShop"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Dominio
            </label>
            <input
              type="text"
              className="w-full p-2 bg-white border border-gray-300 rounded-md text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={brand.brandDomain}
              onChange={(e) =>
                setBrand((p) => ({ ...p, brandDomain: e.target.value }))
              }
              placeholder="barbershop.com"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Email de contacto
            </label>
            <input
              type="email"
              className="w-full p-2 bg-white border border-gray-300 rounded-md text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={brand.contactEmail}
              onChange={(e) =>
                setBrand((p) => ({ ...p, contactEmail: e.target.value }))
              }
              placeholder="citas@barbershop.com"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Zona horaria
            </label>
            <select
              className="w-full p-2 bg-white border border-gray-300 rounded-md text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={brand.timezone}
              onChange={(e) =>
                setBrand((p) => ({ ...p, timezone: e.target.value }))
              }
            >
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Frontend URL
            </label>
            <input
              type="url"
              className="w-full p-2 bg-white border border-gray-300 rounded-md text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={brand.frontendUrl}
              onChange={(e) =>
                setBrand((p) => ({ ...p, frontendUrl: e.target.value }))
              }
              placeholder="https://tusitio.com"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg transition-colors font-bold cursor-pointer uppercase disabled:opacity-70"
          >
            {saving ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Guardando...
              </span>
            ) : (
              "Guardar cambios"
            )}
          </button>
        </div>
      </form>

      {/* Logo */}
      <div className="mt-10 pt-6 border-t border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Imagen del Negocio
        </h2>

        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="w-40 h-40 border border-gray-300 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
            {hasLogo ? (
              <img
                src={toAbsoluteUrl(brand.logo?.url)}
                alt="Logo actual"
                className="object-contain w-full h-full"
              />
            ) : (
              <span className="text-sm text-gray-500">Sin imagen</span>
            )}
          </div>

          <div className="flex-1 space-y-4">
            <div className="space-y-2">
              <label className="inline-block">
                <span
                  className={`px-4 py-2.5 rounded-lg ${
                    uploading
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer"
                  } transition-colors font-medium`}
                >
                  {uploading ? "Subiendo…" : "Subir / Reemplazar imagen"}
                </span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={onLogoChange}
                  className="hidden"
                  disabled={uploading}
                />
              </label>

              {hasLogo && (
                <button
                  onClick={requestDeleteLogo}
                  disabled={deletingLogo}
                  className="ml-3 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-lg transition-colors font-medium disabled:opacity-70"
                >
                  {deletingLogo ? "Eliminando…" : "Eliminar imagen"}
                </button>
              )}
            </div>

            <p className="text-sm text-gray-500">
              Formatos permitidos: PNG, JPG, WEBP. Tamaño máximo: 3MB.
            </p>
          </div>
        </div>
      </div>
      {showDeleteLogoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* overlay */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={cancelDeleteLogo}
            aria-hidden="true"
          />
          {/* modal */}
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-logo-title"
            className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6"
          >
            <h3
              id="delete-logo-title"
              className="text-lg font-semibold text-gray-900 dark:text-gray-100"
            >
              Eliminar logo
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              ¿Seguro que deseas eliminar el logo actual? Esta acción no se
              puede deshacer.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={cancelDeleteLogo}
                disabled={deletingLogo}
                className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteLogo}
                disabled={deletingLogo}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-70"
              >
                {deletingLogo ? "Eliminando…" : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
