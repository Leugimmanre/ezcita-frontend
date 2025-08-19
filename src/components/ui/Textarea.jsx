// src/components/ui/Textarea.jsx
import React from "react";

const Textarea = ({ label, error, className = "", ...props }) => {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <textarea
        className={`block w-full rounded-md border ${
          error
            ? "border-red-300 text-red-900 focus:border-red-500 focus:ring-red-500"
            : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
        } shadow-sm py-2 px-3 focus:outline-none sm:text-sm`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default Textarea;
