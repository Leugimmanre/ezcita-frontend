// src/components/ui/LoadingSkeleton.jsx
import React from "react";

const LoadingSkeleton = ({
  width = "100%",
  height = "1.5rem",
  className = "",
  count = 1,
}) => {
  const skeletons = Array.from({ length: count }, (_, i) => (
    <div
      key={i}
      className={`animate-pulse bg-gray-200 rounded ${className}`}
      style={{
        width: typeof width === "number" ? `${width}px` : width,
        height: typeof height === "number" ? `${height}px` : height,
        marginBottom: i < count - 1 ? "0.5rem" : "0",
      }}
    />
  ));

  return <>{skeletons}</>;
};

export default LoadingSkeleton;
