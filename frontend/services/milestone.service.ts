import api from "@/api/axiosInstance";
import { Milestone } from "../types";

export const milestoneService = {
  async getByProject(projectId: number): Promise<Milestone[]> {
    const res = await api.get(`/milestones/?project=${projectId}`);
    return res.data.results ?? res.data;
  },

  async create(data: Partial<Milestone>) {
    const res = await api.post("/milestones/", data);
    return res.data;
  },

  async update(id: number, data: Partial<Milestone>) {
    const res = await api.patch(`/milestones/${id}/`, data);
    return res.data;
  },

  async delete(id: number) {
    await api.delete(`/milestones/${id}/`);
  }
};