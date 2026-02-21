import api from "@/api/axiosInstance";

function extractResults(response: any) {
  return Array.isArray(response.data)
    ? response.data
    : response.data.results;
}

export const getLeads = async () => {
  const res = await api.get("leads/");
  return extractResults(res);
};

export const createLead = async (data: any) => {
  const res = await api.post("leads/", data);
  return res.data;
};

export const updateLead = async (id: number, data: any) => {
  const res = await api.patch(`leads/${id}/`, data);
  return res.data;
};

export const deleteLead = async (id: number) => {
  await api.delete(`leads/${id}/`);
};

export const convertLead = async (id: number, data: any) => {
  const res = await api.post(
    `leads/${id}/convert_to_project/`,
    data
  );
  return res.data;
};

export const assignLead = async (data: any) => {
  const res = await api.post("leadassignments/", data);
  return res.data;
};

export const getFollowups = async (leadId: number) => {
  const res = await api.get(
    `leadfollowups/?lead_id=${leadId}`
  );
  return extractResults(res);
};

export const getSalesExecutives = async () => {
  const res = await api.get("users/sales_executives/");
  return extractResults(res);
};