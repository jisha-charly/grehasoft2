import api from "@/api/axiosInstance";
import { ActivityLog } from "../types";

export const activityService = {
  async getByProject(projectId: number): Promise<ActivityLog[]> {
    const res = await api.get(`/activity/?project=${projectId}`);
    return res.data.results ?? res.data;
  }
};