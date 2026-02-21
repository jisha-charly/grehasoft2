import api from "@/api/axiosInstance";

export const roleService = {
  getAll: async () => {
    const res = await api.get("roles/");
    return res.data;
  },

  create: async (data: any) => {
    return await api.post("roles/", data);
  },

  update: async (id: number, data: any) => {
    return await api.put(`roles/${id}/`, data);
  },

  delete: async (id: number) => {
    return await api.delete(`roles/${id}/`);
  }
};