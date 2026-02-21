import api from "@/api/axiosInstance";

export const taskTypeService = {
  getAll: async () => {
    const res = await api.get("task-types/");
    return res.data;
  },

  create: async (data: any) => {
    return await api.post("task-types/", data);
  },

  update: async (id: number, data: any) => {
    return await api.put(`task-types/${id}/`, data);
  },

  delete: async (id: number) => {
    return await api.delete(`task-types/${id}/`);
  }
};