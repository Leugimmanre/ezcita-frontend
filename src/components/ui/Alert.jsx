// src/components/ui/Alert.jsx
import React from "react";
import {
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

const Alert = ({ type = "info", title, message, actions, className = "" }) => {
  const alertConfig = {
    info: {
      bg: "bg-blue-50",
      border: "border-blue-400",
      icon: <InformationCircleIcon className="h-5 w-5 text-blue-400" />,
      titleColor: "text-blue-800",
      textColor: "text-blue-700",
    },
    success: {
      bg: "bg-green-50",
      border: "border-green-400",
      icon: <CheckCircleIcon className="h-5 w-5 text-green-400" />,
      titleColor: "text-green-800",
      textColor: "text-green-700",
    },
    warning: {
      bg: "bg-yellow-50",
      border: "border-yellow-400",
      icon: <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />,
      titleColor: "text-yellow-800",
      textColor: "text-yellow-700",
    },
    error: {
      bg: "bg-red-50",
      border: "border-red-400",
      icon: <ExclamationCircleIcon className="h-5 w-5 text-red-400" />,
      titleColor: "text-red-800",
      textColor: "text-red-700",
    },
  };

  const config = alertConfig[type] || alertConfig.info;

  return (
    <div
      className={`rounded-md p-4 mb-6 border ${config.bg} ${config.border} ${className}`}
    >
      <div className="flex">
        <div className="flex-shrink-0">{config.icon}</div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className={`text-sm font-medium ${config.titleColor}`}>
              {title}
            </h3>
          )}
          {message && (
            <div className={`mt-2 text-sm ${config.textColor}`}>
              <p>{message}</p>
            </div>
          )}
          {actions && (
            <div className="mt-4">
              <div className="-mx-2 -my-1.5 flex">{actions}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Alert;
