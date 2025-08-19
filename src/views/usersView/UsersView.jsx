import React from "react";
import { useUsersData } from "@/hooks/useUsersData";

export default function UsersView() {
  const { users, isLoading, deleteUser } = useUsersData();

  if (isLoading) return <p>Cargando usuarios...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Usuarios</h1>
      <table className="min-w-full bg-white border">
        <thead>
          <tr>
            <th className="px-4 py-2">Nombre</th>
            <th className="px-4 py-2">Email</th>
            <th className="px-4 py-2">Rol</th>
            <th className="px-4 py-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id}>
              <td className="border px-4 py-2">{u.name}</td>
              <td className="border px-4 py-2">{u.email}</td>
              <td className="border px-4 py-2">{u.role}</td>
              <td className="border px-4 py-2">
                <button
                  className="text-red-500"
                  onClick={() => deleteUser(u._id)}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
