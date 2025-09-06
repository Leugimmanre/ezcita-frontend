// src/hooks/useUsersData.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getUsers,
  createUser as createUserAPI,
  updateUser as updateUserAPI,
  deleteUser as deleteUserAPI,
  changePassword as changePasswordAPI,
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

  // Mutación para cambiar contraseña
  const updatePasswordMutation = useMutation({
    mutationFn: ({ id, currentPassword, newPassword }) =>
      changePasswordAPI(id, { currentPassword, newPassword }),
    // No invalido lista completa por seguridad; si quieres, puedes refetch ["me"]
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
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
    // Crear usuario
    createUser: createMutation.mutate,
    createUserAsync: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    // Actualizar usuario
    updateUser: updateMutation.mutate,
    updateUserAsync: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    //  Eliminar usuario
    deleteUser: deleteMutation.mutate,
    deleteUserAsync: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    // Cambiar contraseña
    updatePassword: updatePasswordMutation.mutate,
    updatePasswordAsync: updatePasswordMutation.mutateAsync,
    isUpdatingPassword: updatePasswordMutation.isPending,
  };
};
