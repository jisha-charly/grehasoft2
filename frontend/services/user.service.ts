import api from "@/api/axiosInstance";
import { User } from "../types";

function mapUser(data: any): User {
  return {
    id: data.id,
    name: data.name,
    username: data.username,
    email: data.email,
    role: data.role,
    departmentId: data.department,
    status: data.status,
  };
}

export const userService = {
  async getAll(): Promise<User[]> {
    const response = await api.get("/users/");

    const rawData = Array.isArray(response.data)
      ? response.data
      : response.data.results; // handle pagination

    return rawData.map(mapUser);
  },

  async create(data: Partial<User>): Promise<User> {
    const response = await api.post("/users/", data);
    return mapUser(response.data);
  },

  async update(id: number, data: Partial<User>): Promise<User> {
    const response = await api.patch(`/users/${id}/`, data);
    return mapUser(response.data);
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/users/${id}/`);
  },
};