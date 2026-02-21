import api from "@/api/axiosInstance";
import { Project } from "../types";

function mapProject(data: any): Project {
  return {
    id: data.id,
    name: data.name,
    clientId: data.client,
    clientName: data.client_name,
    departmentId: data.department,
    projectManagerId: data.project_manager,
    startDate: data.start_date,
    endDate: data.end_date,
    status: data.status,
    progress: data.progress ?? 0,
  };
}

export const projectService = {
  async getAll(): Promise<Project[]> {
    const response = await api.get("/projects/");

    const rawData = Array.isArray(response.data)
      ? response.data
      : response.data.results; // pagination safe

    return rawData.map(mapProject);
  },

  async create(data: Partial<Project>): Promise<Project> {
    const response = await api.post("/projects/", {
      name: data.name,
      client: data.clientId,
      department: data.departmentId,
      project_manager: data.projectManagerId,
      start_date: data.startDate,
      end_date: data.endDate,
      status: data.status,
      progress: data.progress,
    });

    return mapProject(response.data);
  },

  async update(id: number, data: Partial<Project>): Promise<Project> {
    const response = await api.patch(`/projects/${id}/`, {
      name: data.name,
      client: data.clientId,
      department: data.departmentId,
      project_manager: data.projectManagerId,
      start_date: data.startDate,
      end_date: data.endDate,
      status: data.status,
      progress: data.progress,
    });

    return mapProject(response.data);
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/projects/${id}/`);
  },
  async getById(id: number) {
  const res = await api.get(`/projects/${id}/`);
  return res.data;
},

};
