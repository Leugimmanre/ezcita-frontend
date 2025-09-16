// src/components/legal/LegalDocPublic.jsx
// Renderiza un documento legal público (solo lectura) con título
import { getLegalDoc } from "@/services/legalAPI";
import { useEffect, useState } from "react";
import {
  ScaleIcon,
  DocumentTextIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

export default function LegalDocPublic({ type, title }) {
  // state local
  const [loading, setLoading] = useState(true);
  const [doc, setDoc] = useState({
    content: "",
    version: "1.0",
    effectiveDate: new Date().toISOString(),
  });

  // cargar doc al montar
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getLegalDoc(type);
        if (mounted) setDoc(data);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, [type]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 lg:px-6 lg:py-10">
        <div className="animate-pulse space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
            <div className="h-8 w-1/2 bg-gray-200 rounded"></div>
          </div>
          <div className="h-4 w-1/3 bg-gray-200 rounded"></div>
          <div className="space-y-3 pt-4">
            <div className="h-4 w-full bg-gray-200 rounded"></div>
            <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
            <div className="h-4 w-4/6 bg-gray-200 rounded"></div>
            <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
            <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const eff = new Date(doc.effectiveDate || Date.now());
  const effStr = eff.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <article className="max-w-4xl mx-auto px-4 py-8 lg:px-6 lg:py-10">
      {/* Cabecera */}
      <header className="mb-8 pb-6 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-50 rounded-lg">
            <ScaleIcon className="h-6 w-6 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-white">{title}</h1>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm text-white">
          <div className="flex items-center gap-1.5">
            <DocumentTextIcon className="h-4 w-4" />
            <span>
              Versión: <strong className="text-white">{doc.version}</strong>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <ClockIcon className="h-4 w-4" />
            <span>
              Vigente desde:{" "}
              <time dateTime={eff.toISOString()} className="text-white">
                {effStr}
              </time>
            </span>
          </div>
        </div>
      </header>

      {/* Contenido */}
      <section className="prose prose-lg max-w-none">
        {doc.content ? (
          <div className="bg-white rounded-lg p-6 border border-gray-100 shadow-sm">
            <div className="legal-content text-gray-700 leading-relaxed">
              {doc.content.split("\n").map((paragraph, index) =>
                paragraph.trim() ? (
                  <p key={index} className="mb-5">
                    {paragraph}
                  </p>
                ) : null
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-700">
              Documento en preparación
            </h3>
            <p className="mt-2 text-gray-500 max-w-md mx-auto">
              Aún no hay contenido redactado por el administrador. Este
              documento estará disponible próximamente.
            </p>
          </div>
        )}
      </section>

      {/* Pie de documento */}
      <footer className="mt-8 pt-6 border-t border-gray-200 text-sm text-gray-500 text-center">
        <p>
          Para consultas sobre este documento, por favor contacte con nuestro
          equipo legal.
        </p>
      </footer>
    </article>
  );
}
