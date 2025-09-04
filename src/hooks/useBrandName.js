// src/hooks/useBrandName.js
import { useQuery } from "@tanstack/react-query";
import { getBrandSettings } from "@/services/brandApi";

// defaultName: fallback si la API falla o aún no cargó
export function useBrandName(defaultName = "Default") {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["brandSettings"],
    queryFn: getBrandSettings,
    staleTime: 5 * 60 * 1000,
  });

  const brandName =
    (data?.brandName && String(data.brandName).trim()) || defaultName;

  return { brandName, isLoading, isError };
}
