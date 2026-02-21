import api from "@/api/axiosInstance";

export const departmentService = {
  getAll: async () => {
    const res = await api.get("departments/");
    return res.data;
  },

  create: async (data: any) => {
    return await api.post("departments/", data);
  },

  update: async (id: number, data: any) => {
    return await api.put(`departments/${id}/`, data);
  },

  delete: async (id: number) => {
    return await api.delete(`departments/${id}/`);
  }
};