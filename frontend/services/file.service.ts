import api from "@/api/axiosInstance";
import { TaskFile } from "../types";

export const fileService = {
  async getByProject(projectId: number): Promise<TaskFile[]> {
    const res = await api.get(`/task-files/?project=${projectId}`);
    return res.data.results ?? res.data;
  },

  async create(data: Partial<TaskFile>): Promise<TaskFile> {
    const res = await api.post("/task-files/", data);
    return res.data;
  },
};