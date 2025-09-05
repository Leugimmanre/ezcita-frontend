import api from "@/lib/axios";

// Obtener todos los usuarios
export const getUsers = async () => {
  const { data } = await api.get("/users");
  return data.data; // porque tu backend responde { success, data }
};

// Obtener un usuario por ID
export const getUserById = async (id) => {
  const { data } = await api.get(`/users/${id}`);
  return data.data;
};

// Obtener el usuario autenticado
export async function getMe() {
  const { data } = await api.get("/users/me");
  return data?.data ?? null;
}

// Crear usuario
export const createUser = async (userData) => {
  const { data } = await api.post("/users", userData);
  return data.data;
};

// Actualizar usuario
export const updateUser = async (id, userData) => {
  const { data } = await api.put(`/users/${id}`, userData);
  return data.data;
};

// Eliminar usuario
export const deleteUser = async (id) => {
  const { data } = await api.delete(`/users/${id}`);
  return data;
};

// Login de usuario
export const loginUser = async (credentials, tenantOverride) => {
  const tenant =
    tenantOverride ||
    credentials.tenantId ||
    localStorage.getItem("tenantId") ||
    import.meta.env.VITE_TENANT_ID ||
    "";

  const headers = {};
  const params = {};
  if (tenant) {
    headers["x-tenant-id"] = tenant;
    params.tenant = tenant;
  }

  const { data } = await api.post(
    "/auth/login",
    { email: credentials.email, password: credentials.password },
    { headers, params }
  );

  if (data.success && data.data.token) {
    localStorage.setItem("token", data.data.token);
    localStorage.setItem("tenantId", data.data.tenantId || tenant);
  }

  return data.data;
};
