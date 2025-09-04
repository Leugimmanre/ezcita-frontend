// src/hooks/useUsersData.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getUsers,
  createUser as createUserAPI,
  updateUser as updateUserAPI,
  deleteUser as deleteUserAPI,
} from "@/services/userAPI";

const USERS_KEY = ["users"];

export const useUsersData = () => {
  const queryClient = useQueryClient();

  const {
    data: users = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: USERS_KEY,
    queryFn: getUsers,
  });

  const createMutation = useMutation({
    mutationFn: (payload) => createUserAPI(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: USERS_KEY }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateUserAPI(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: USERS_KEY }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteUserAPI(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: USERS_KEY }),
  });

  return {
    // datos
    users,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,

    // acciones
    createUser: createMutation.mutate,
    createUserAsync: createMutation.mutateAsync,
    isCreating: createMutation.isPending,

    updateUser: updateMutation.mutate,
    updateUserAsync: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,

    deleteUser: deleteMutation.mutate,
    deleteUserAsync: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
};
