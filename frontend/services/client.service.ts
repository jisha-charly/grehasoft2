import api from "@/api/axiosInstance";
import { Client } from "../types";

function mapClient(data: any): Client {
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    phone: data.phone,
    companyName: data.company_name,
    gstNo: data.gst_no,
    address: data.address,
    createdAt: data.created_at,
  };
}

export const clientService = {

 async getAll(): Promise<Client[]> {
  const response = await api.get("/clients/");

  const rawData = Array.isArray(response.data)
    ? response.data
    : response.data.results;   // ✅ handle pagination

  return rawData.map((c: any) => ({
    id: c.id,
    name: c.name,
    email: c.email,
    phone: c.phone,
    companyName: c.company_name,
    gstNo: c.gst_no,
    address: c.address,
    createdAt: c.created_at,
  }));
},

  async create(data: Partial<Client>): Promise<Client> {
    const response = await api.post("/clients/", {
      name: data.name,
      email: data.email,
      phone: data.phone,
      company_name: data.companyName,
      gst_no: data.gstNo,
      address: data.address,
    });
    return mapClient(response.data);
  },

  async update(id: number, data: Partial<Client>): Promise<Client> {
    const response = await api.put(`/clients/${id}/`, {
      name: data.name,
      email: data.email,
      phone: data.phone,
      company_name: data.companyName,
      gst_no: data.gstNo,
      address: data.address,
    });
    return mapClient(response.data);
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/clients/${id}/`);
  },

};