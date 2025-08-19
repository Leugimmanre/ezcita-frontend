import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import DeleteServiceButton from "./DeleteServiceButton";
import Button from "@/components/ui/Button";

export default function ServiceCard({ service, onEdit }) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden transition-shadow hover:shadow-md">
      <div className="p-5">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {service.name}
            </h3>
            <p className="text-sm text-gray-500">{service.category}</p>
          </div>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            {service.price}€
          </span>
        </div>

        <div className="mt-4">
          <p className="text-gray-600 text-sm mb-2">
            {service.description || "Sin descripción"}
          </p>

          <div className="flex items-center text-sm text-gray-500">
            <span>Duración: </span>
            <span className="ml-1 font-medium">
              {service.duration} {service.durationUnit}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 px-5 py-3 flex justify-end space-x-2 border-t border-gray-200">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onEdit(service)}
          icon={<PencilIcon className="h-4 w-4" />}
        >
          Editar
        </Button>

        <Button
          variant="danger"
          size="sm"
          onClick={() => setShowDeleteConfirm(true)}
          icon={<TrashIcon className="h-4 w-4" />}
        >
          Eliminar
        </Button>
      </div>

      <DeleteServiceButton
        serviceId={service._id}
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}
