import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getUsers,
//   getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "@/services/userAPI";

export const useUsersData = () => {
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => queryClient.invalidateQueries(["users"]),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...userData }) => updateUser(id, userData),
    onSuccess: () => queryClient.invalidateQueries(["users"]),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => queryClient.invalidateQueries(["users"]),
  });

  return {
    users,
    isLoading,
    createUser: createMutation.mutate,
    updateUser: updateMutation.mutate,
    deleteUser: deleteMutation.mutate,
  };
};
