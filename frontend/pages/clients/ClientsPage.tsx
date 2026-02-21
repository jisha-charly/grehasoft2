import React, { useEffect, useMemo, useState } from "react";
import { Client } from "../../types";
import { clientService } from "../../services/client.service";
import { toast } from "react-toastify";

const ITEMS_PER_PAGE = 8;

const ClientsPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [isModalOpen, setModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    companyName: "",
    gstNo: "",
    address: "",
  });

  /* =========================
     FETCH CLIENTS
  ========================= */

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const data = await clientService.getAll();
      setClients(data);
    } catch {
      toast.error("Failed to load clients");
    }
  };

  /* =========================
     SEARCH + PAGINATION
  ========================= */

  const filteredClients = useMemo(() => {
    const search = searchTerm.toLowerCase();

    return clients.filter((c) => {
      const name = c.name?.toLowerCase() || "";
      const company = c.companyName?.toLowerCase() || "";
      const email = c.email?.toLowerCase() || "";

      return (
        name.includes(search) ||
        company.includes(search) ||
        email.includes(search)
      );
    });
  }, [clients, searchTerm]);

  const totalPages = Math.ceil(filteredClients.length / ITEMS_PER_PAGE);

  const paginatedClients = filteredClients.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  /* =========================
     VALIDATION
  ========================= */

  const validateForm = () => {
    if (!formData.name.trim()) return "Client name is required";
    if (!formData.email.trim()) return "Email is required";
    if (!formData.companyName.trim()) return "Company name is required";
    return null;
  };

  /* =========================
     SUBMIT
  ========================= */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      if (editingClient) {
        await clientService.update(editingClient.id, formData);
        toast.success("Client updated successfully");
      } else {
        await clientService.create(formData);
        toast.success("Client created successfully");
      }

      setModalOpen(false);
      resetForm();
      fetchClients();
    } catch (err: any) {
      if (err.response?.data?.email) {
        setError(err.response.data.email[0]);
      } else {
        setError("Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     DELETE (MODERN CONFIRM)
  ========================= */

  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      await clientService.delete(deleteId);
      toast.success("Client deleted successfully");
      fetchClients();
    } catch {
      toast.error("Delete failed");
    }

    setDeleteId(null);
  };

  /* =========================
     EDIT
  ========================= */

  const openEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      email: client.email,
      phone: client.phone,
      companyName: client.companyName,
      gstNo: client.gstNo || "",
      address: client.address,
    });
    setModalOpen(true);
  };

  const resetForm = () => {
    setEditingClient(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      companyName: "",
      gstNo: "",
      address: "",
    });
    setError(null);
  };

  /* =========================
     UI
  ========================= */

  return (
    <div className="container-fluid p-4">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1">Client Management</h3>
          <p className="text-muted small">
            Manage business accounts and contact details
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => {
            resetForm();
            setModalOpen(true);
          }}
        >
          + Register Client
        </button>
      </div>

      {/* SEARCH */}
      <input
        className="form-control mb-4"
        placeholder="Search by name, company or email..."
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setCurrentPage(1);
        }}
      />

      {/* TABLE */}
      <div className="card shadow-sm">
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead>
              <tr>
                <th>Name</th>
                <th>Company</th>
                <th>Email</th>
                <th>Phone</th>
                <th>GST</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedClients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-muted">
                    No clients found
                  </td>
                </tr>
              ) : (
                paginatedClients.map((client) => (
                  <tr key={client.id}>
                    <td>{client.name}</td>
                    <td>{client.companyName}</td>
                    <td>{client.email}</td>
                    <td>{client.phone}</td>
                    <td>{client.gstNo || "—"}</td>
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-light me-2"
                        onClick={() => openEdit(client)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => setDeleteId(client.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-3">
          <ul className="pagination">
            {Array.from({ length: totalPages }, (_, i) => (
              <li
                key={i}
                className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
              >
                <button
                  className="page-link"
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* FORM MODAL */}
      {isModalOpen && (
        <div
          className="modal show d-block"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content p-4">

              <div className="d-flex justify-content-between mb-3">
                <h5 className="fw-bold">
                  {editingClient ? "Update Client" : "Register Client"}
                </h5>
                <button
                  className="btn-close"
                  onClick={() => setModalOpen(false)}
                />
              </div>

              {error && (
                <div className="alert alert-danger small py-2">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <div className="row g-3">
                  <div className="col-md-6">
                    <input
                      className="form-control"
                      placeholder="Client Name *"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>

                  <div className="col-md-6">
                    <input
                      type="email"
                      className="form-control"
                      placeholder="Email *"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>

                  <div className="col-md-6">
                    <input
                      className="form-control"
                      placeholder="Company Name *"
                      value={formData.companyName}
                      onChange={(e) =>
                        setFormData({ ...formData, companyName: e.target.value })
                      }
                    />
                  </div>

                  <div className="col-md-6">
                    <input
                      className="form-control"
                      placeholder="Phone"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                    />
                  </div>

                  <div className="col-md-12">
                    <input
                      className="form-control"
                      placeholder="GST No"
                      value={formData.gstNo}
                      onChange={(e) =>
                        setFormData({ ...formData, gstNo: e.target.value })
                      }
                    />
                  </div>

                  <div className="col-md-12">
                    <textarea
                      className="form-control"
                      rows={3}
                      placeholder="Address"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="text-end mt-4">
                  <button
                    type="button"
                    className="btn btn-light me-2"
                    onClick={() => setModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading
                      ? "Saving..."
                      : editingClient
                      ? "Update"
                      : "Create"}
                  </button>
                </div>
              </form>

            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      {deleteId && (
        <div
          className="modal show d-block"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content p-4 text-center">
              <h5 className="fw-bold mb-3">Delete Client?</h5>
              <p className="text-muted small">
                This client will be moved to trash.
              </p>

              <div className="d-flex justify-content-center gap-3 mt-3">
                <button
                  className="btn btn-light"
                  onClick={() => setDeleteId(null)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-danger"
                  onClick={confirmDelete}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ClientsPage;