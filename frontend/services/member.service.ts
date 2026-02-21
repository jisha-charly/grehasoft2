import api from "@/api/axiosInstance";
import { ProjectMember } from "../types";

export const memberService = {
  async getByProject(projectId: number): Promise<ProjectMember[]> {
    const res = await api.get(`/project-members/?project=${projectId}`);
    return res.data.results ?? res.data;
  },

  async create(data: Partial<ProjectMember>) {
    const res = await api.post("/project-members/", data);
    return res.data;
  },

  async update(id: number, data: Partial<ProjectMember>) {
    const res = await api.patch(`/project-members/${id}/`, data);
    return res.data;
  },

  async delete(id: number) {
    await api.delete(`/project-members/${id}/`);
  }
};