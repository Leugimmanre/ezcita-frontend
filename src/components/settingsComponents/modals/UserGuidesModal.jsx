// src/components/modals/UserGuidesModal.jsx
import { useState } from "react";
import Modal from "@/components/ui/Modal";

const guideCategories = [
  {
    title: "Configuración Inicial",
    guides: [
      {
        name: "Primeros pasos con EzCita",
        content:
          "Para comenzar a usar EzCita, primero debes crear una cuenta. Luego, configura tu perfil de negocio, añade tus servicios y establece tu disponibilidad horaria. Recomendamos comenzar con los ajustes básicos y luego personalizar las opciones avanzadas según tus necesidades.",
      },
      {
        name: "Configuración de horarios",
        content:
          "Puedes establecer tus horarios de trabajo por día de la semana. También es posible crear horarios especiales para días festivos o vacaciones. El sistema te permite establecer diferentes horarios para cada servicio si es necesario.",
      },
      {
        name: "Personalización de servicios",
        content:
          "Añade todos los servicios que ofrece tu negocio con sus respectivas duraciones, precios y descripciones. Puedes categorizar tus servicios para que los clientes los encuentren más fácilmente. También es posible establecer preparativos necesarios para cada servicio.",
      },
    ],
  },
  {
    title: "Gestión de Citas",
    guides: [
      {
        name: "Cómo programar citas",
        content:
          "Para programar una cita, ve al calendario y haz clic en el horario deseado. Selecciona el cliente (o añade uno nuevo), el servicio requerido y cualquier detalle adicional. El sistema enviará automáticamente un recordatorio al cliente según tus configuraciones.",
      },
      {
        name: "Gestionar cancelaciones",
        content:
          "Cuando un cliente cancela una cita, el sistema la marcará automáticamente como cancelada. Puedes configurar políticas de cancelación, como periodos de gracia o cargos por cancelaciones de último momento. Todas las cancelaciones quedan registradas en el historial.",
      },
      {
        name: "Gestionar las citas",
        content:
          "En el apartado Reservas encontraras un listado con las reservas realizadas por los clientes y el estado en el que se encuentra, desde ahí puedes gestionar su nuevo estado, incluso eliminar las reservas.",
      },
    ],
  },
  {
    title: "Reportes y Analytics",
    guides: [
      {
        name: "Reportes de ingresos",
        content:
          "En el apartado Dashboard encontraras reportes de varias categorias como citas totales, ingresos, estado de las reservas, etc. por periodos de tiempo específicos.",
      },
      {
        name: "Métricas de rendimiento",
        content:
          "Analiza el rendimiento de tu negocio con métricas como tasa de ocupación, clientes recurrentes vs. nuevos, servicios más populares y comparativas entre periodos. Estas métricas te ayudarán a identificar oportunidades de crecimiento.",
      },
      {
        name: "Exportar datos",
        content:
          "Puedes adquirir el módulo que viene por separado para exportar datos. Exporta todos tus datos (citas, clientes, transacciones) en formatos CSV o Excel para análisis externos o respaldo. Puedes programar exportaciones automáticas o realizarlas manualmente cuando lo necesites.",
      },
    ],
  },
];

export default function UserGuidesModal({ isOpen, onClose }) {
  const [activeGuide, setActiveGuide] = useState(null);

  const toggleGuide = (categoryIndex, guideIndex) => {
    const guideKey = `${categoryIndex}-${guideIndex}`;
    setActiveGuide(activeGuide === guideKey ? null : guideKey);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Guías de Usuario"
      size="2xl"
    >
      <div className="space-y-8">
        {guideCategories.map((category, categoryIndex) => (
          <div key={categoryIndex}>
            <h3 className="font-semibold text-gray-900 mb-4 text-lg">
              {category.title}
            </h3>
            <ul className="space-y-3">
              {category.guides.map((guide, guideIndex) => {
                const guideKey = `${categoryIndex}-${guideIndex}`;
                const isActive = activeGuide === guideKey;

                return (
                  <li
                    key={guideIndex}
                    className="border rounded-lg overflow-hidden"
                  >
                    <button
                      onClick={() => toggleGuide(categoryIndex, guideIndex)}
                      className="flex items-center justify-between w-full p-4 text-left hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center">
                        <svg
                          className="w-5 h-5 text-gray-400 mr-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        <span className="text-gray-700 font-medium">
                          {guide.name}
                        </span>
                      </div>
                      <svg
                        className={`w-5 h-5 text-gray-400 transform transition-transform ${
                          isActive ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                    {isActive && (
                      <div className="px-4 pb-4">
                        <div className="pl-8 border-l-2 border-purple-200">
                          <p className="text-gray-600">{guide.content}</p>
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

        <div className="bg-purple-50 p-4 rounded-lg">
          <h4 className="font-medium text-purple-800 mb-2">
            ¿Necesitas ayuda específica?
          </h4>
          <p className="text-purple-700 mb-3">
            Nuestro centro de ayuda tiene más de 50 guías detalladas paso a
            paso.
          </p>
          <a
            href="#"
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm"
          >
            Ver Centro de Ayuda Completo
          </a>
        </div>
      </div>
    </Modal>
  );
}
