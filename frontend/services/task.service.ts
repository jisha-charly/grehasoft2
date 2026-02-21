import api from "@/api/axiosInstance";
import { Task } from "../types";

export const taskService = {
  async getByProject(projectId: number): Promise<Task[]> {
    const res = await api.get(`/tasks/?project=${projectId}`);
    return res.data.results ?? res.data;
  },

  async create(data: Partial<Task>): Promise<Task> {
    const res = await api.post("/tasks/", data);
    return res.data;
  },

  async update(id: number, data: Partial<Task>): Promise<Task> {
    const res = await api.patch(`/tasks/${id}/`, data);
    return res.data;
  },

  async delete(id: number) {
    await api.delete(`/tasks/${id}/`);
  },
 getAll: async () => {
  const res = await api.get("/tasks");
  return res.data;
},
};