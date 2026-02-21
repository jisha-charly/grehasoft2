import api from "@/api/axiosInstance";
import { TaskReview } from "../types";

export const reviewService = {
  async getByProject(projectId: number): Promise<TaskReview[]> {
    const res = await api.get(`/task-reviews/?project=${projectId}`);
    return res.data.results ?? res.data;
  },

  async create(data: Partial<TaskReview>) {
    const res = await api.post("/task-reviews/", data);
    return res.data;
  }
};