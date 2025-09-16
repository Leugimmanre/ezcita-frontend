// src/components/modals/LiveSupportModal.jsx
import Modal from "@/components/ui/Modal";
import { useState } from "react";

export default function LiveSupportModal({ isOpen, onClose }) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Lógica para enviar mensaje al soporte
    console.log("Mensaje enviado:", message);
    setMessage("");
    alert("Mensaje enviado. Te contactaremos pronto.");
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Soporte en Vivo" size="lg">
      <div className="space-y-6">
        <div className="flex items-start">
          <div className="bg-green-100 p-3 rounded-full mr-4">
            <svg
              className="w-6 h-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Chat de Soporte</h3>
            <p className="text-gray-600">
              Nuestro equipo está disponible 24/7 para ayudarte
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="message"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Describe tu consulta
            </label>
            <textarea
              id="message"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              <p>
                Tiempo de respuesta promedio:{" "}
                <span className="font-medium">5 minutos</span>
              </p>
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Iniciar Chat
            </button>
          </div>
        </form>

        <div className="border-t border-gray-200 pt-4">
          <h4 className="font-medium text-gray-900 mb-2">
            Otros medios de contacto
          </h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>📧 Email: soporte@ezcita.com</li>
            <li>📞 Teléfono: +1-800-123-4567</li>
            <li>🕐 Horario: Lunes a Viernes, 9:00 - 18:00</li>
          </ul>
        </div>
        <label
          htmlFor="message"
          className="block text-sm font-extralight text-gray-400 mb-1"
        >
          El módulo chat viene por separado, requiere contrato de mantenimiento.
        </label>
      </div>
    </Modal>
  );
}
