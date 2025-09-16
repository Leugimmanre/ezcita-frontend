// src/components/modals/FAQModal.jsx
import Modal from "@/components/ui/Modal";

const faqItems = [
  {
    question: "¿Cómo configurar los horarios de atención?",
    answer:
      "Ve a la sección 'Horarios' y establece tus horarios laborales. El sistema automáticamente bloqueará las horas no laborables.",
  },
  {
    question: "¿Cómo agregar nuevos servicios?",
    answer:
      "En la sección 'Servicios', haz clic en 'Agregar Servicio' y completa la información requerida incluyendo nombre, duración y precio.",
  },
  {
    question: "¿Cómo restablecer mi contraseña?",
    answer:
      "Ve a 'Ver Perfil' > 'Seguridad' y selecciona 'Cambiar Contraseña'. Recibirás un correo con instrucciones.",
  },
  {
    question: "¿Cómo gestionar mis usuarios?",
    answer:
      "En la sección 'Usuarios' puedes agregar, editar o desactivar usuarios, y asignarles permisos específicos.",
  },
  {
    question: "¿Cómo ver reportes de mi negocio?",
    answer:
      "Ve a la sección 'Dashboard' donde encontrarás análisis de ingresos, citas y desempeño de usuarios.",
  },
];

export default function FAQModal({ isOpen, onClose }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Preguntas Frecuentes"
      size="2xl"
    >
      <div className="space-y-6">
        {faqItems.map((item, index) => (
          <div
            key={index}
            className="border-b border-gray-200 pb-4 last:border-0"
          >
            <h3 className="font-medium text-gray-900 mb-2">{item.question}</h3>
            <p className="text-gray-600">{item.answer}</p>
          </div>
        ))}

        <div className="mt-8 bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">
            ¿No encuentras tu pregunta?
          </h4>
          <p className="text-blue-700">
            Contacta a nuestro equipo de soporte para ayuda personalizada.
          </p>
        </div>
      </div>
    </Modal>
  );
}
