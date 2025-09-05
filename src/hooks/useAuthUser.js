// src/hooks/useAuthUser.js
import { getMe } from "@/services/userAPI";
import { useQuery } from "@tanstack/react-query";

export function useAuthUser() {
  const {
    data: user,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["me"],
    queryFn: getMe,
    staleTime: 5 * 60 * 1000,
  });

  return { user, isLoading, isError, error };
}
