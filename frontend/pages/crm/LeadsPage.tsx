import { useEffect, useState } from "react";
import api from "@/api/axiosInstance";
import {
  getLeads,
  createLead,
  assignLead,
  convertLead,
} from "@/services/crm.service";
import { getSalesExecutives } from "@/services/crm.service";
interface Lead {
  id: number;
  name: string;
  email: string;
  phone: string;
  source: string;
  status: string;
}

interface User {
  id: number;
  name: string;
}

const LeadsPage = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [salesUsers, setSalesUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [newLead, setNewLead] = useState({
    name: "",
    email: "",
    phone: "",
    source: "",
  });

  useEffect(() => {
    fetchLeads();
    fetchSalesUsers();
  }, []);

  const fetchLeads = async () => {
  try {
    const leadsData = await getLeads();
    setLeads(leadsData);
  } catch (error) {
    console.error("Error fetching leads", error);
  } finally {
    setLoading(false);
  }
};

const fetchSalesUsers = async () => {
  try {
    const users = await getSalesExecutives();
    setSalesUsers(users);
  } catch (err) {
    console.error("Error fetching sales users", err);
  }
};

  const handleCreateLead = async () => {
    try {
      await createLead(newLead);
      setNewLead({ name: "", email: "", phone: "", source: "" });
      fetchLeads();
      (window as any).bootstrap.Modal.getInstance(
        document.getElementById("addLeadModal")
      )?.hide();
    } catch (err) {
      console.error("Error creating lead", err);
    }
  };

  const handleAssign = async (leadId: number, userId: number) => {
    try {
      await assignLead({
        lead: leadId,
        sales_exec: userId,
      });
      fetchLeads();
    } catch (err) {
      console.error("Error assigning lead", err);
    }
  };

  const handleConvert = async (leadId: number) => {
    try {
      await convertLead(leadId, {
        client_id: 1, // replace with real client selection later
        department_id: 1,
        manager_id: 1,
        start_date: "2026-01-01",
        end_date: "2026-12-31",
      });
      fetchLeads();
    } catch (err) {
      console.error("Error converting lead", err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "secondary";
      case "contacted":
        return "info";
      case "qualified":
        return "primary";
      case "converted":
        return "success";
      case "lost":
        return "danger";
      default:
        return "light";
    }
  };

  if (loading) return <p>Loading leads...</p>;

  return (
    <div className="card shadow-sm border-0">
      <div className="card-header bg-white py-4 px-4 d-flex justify-content-between align-items-center">
        <div>
          <h4 className="fw-bold mb-0 text-dark">Sales Pipeline</h4>
          <small className="text-muted">
            Tracking prospects and conversion rates
          </small>
        </div>

        <button
          className="btn btn-primary"
          data-bs-toggle="modal"
          data-bs-target="#addLeadModal"
        >
          + New Lead
        </button>
      </div>

      <div className="card-body p-0">
        <table className="table mb-0">
          <thead>
            <tr>
              <th>Prospect</th>
              <th>Contact Info</th>
              <th>Source</th>
              <th>Status</th>
              <th>Assign</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id}>
                <td>{lead.name}</td>
                <td>
                  {lead.email}
                  <br />
                  {lead.phone}
                </td>
                <td>{lead.source}</td>
                <td>
                  <span
                    className={`badge bg-${getStatusColor(lead.status)}`}
                  >
                    {lead.status}
                  </span>
                </td>

                <td>
                  <select
                    className="form-select form-select-sm"
                    onChange={(e) =>
                      handleAssign(lead.id, Number(e.target.value))
                    }
                  >
                    <option>Select User</option>
                    {salesUsers.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                </td>

                <td>
                  {lead.status !== "converted" && (
                    <button
                      className="btn btn-sm btn-success"
                      onClick={() => handleConvert(lead.id)}
                    >
                      Convert
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ADD LEAD MODAL */}
      <div
        className="modal fade"
        id="addLeadModal"
        tabIndex={-1}
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">New Lead</h5>
              <button className="btn-close" data-bs-dismiss="modal"></button>
            </div>

            <div className="modal-body">
              <input
                className="form-control mb-3"
                placeholder="Name"
                value={newLead.name}
                onChange={(e) =>
                  setNewLead({ ...newLead, name: e.target.value })
                }
              />
              <input
                className="form-control mb-3"
                placeholder="Email"
                value={newLead.email}
                onChange={(e) =>
                  setNewLead({ ...newLead, email: e.target.value })
                }
              />
              <input
                className="form-control mb-3"
                placeholder="Phone"
                value={newLead.phone}
                onChange={(e) =>
                  setNewLead({ ...newLead, phone: e.target.value })
                }
              />
              <input
                className="form-control"
                placeholder="Source"
                value={newLead.source}
                onChange={(e) =>
                  setNewLead({ ...newLead, source: e.target.value })
                }
              />
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-primary"
                onClick={handleCreateLead}
              >
                Create Lead
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadsPage;