import React, { useEffect, useState, useMemo } from "react";
import { roleService } from "../../../services/role.service";
import { Role } from "../../../types";

const ITEMS_PER_PAGE = 6;

const RolesPage: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [isModalOpen, setModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [deleteRoleId, setDeleteRoleId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: ""
  });

  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    const data = await roleService.getAll();
    setRoles(data);
  };

  const filteredRoles = useMemo(() => {
    return roles.filter(r =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      (r.description || "").toLowerCase().includes(search.toLowerCase())
    );
  }, [roles, search]);

  const totalPages = Math.ceil(filteredRoles.length / ITEMS_PER_PAGE);

  const paginatedRoles = filteredRoles.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.name.trim())
      newErrors.name = "Role name is required";

    if (!/^[A-Z_]+$/.test(formData.name))
      newErrors.name = "Use only uppercase letters and underscores";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (editingRole) {
        await roleService.update(editingRole.id, formData);
      } else {
        await roleService.create(formData);
      }

      fetchRoles();
      setModalOpen(false);
      setEditingRole(null);
      resetForm();
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: ""
    });
    setErrors({});
  };

  const openEdit = (role: Role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description || ""
    });
    setModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteRoleId) return;

    await roleService.delete(deleteRoleId);
    setDeleteRoleId(null);
    fetchRoles();
  };

  const getCardColor = (name: string) => {
    if (name === "ADMIN") return "border-danger";
    if (name.includes("MANAGER")) return "border-primary";
    if (name === "CLIENT") return "border-success";
    return "border-secondary";
  };

  return (
    <div className="container-fluid p-4">

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1">Roles Management</h3>
          <p className="text-muted small">Define and manage system roles</p>
        </div>

        <button
          className="btn btn-dark"
          onClick={() => {
            setEditingRole(null);
            resetForm();
            setModalOpen(true);
          }}
        >
          + New Role
        </button>
      </div>

      {/* SEARCH */}
      <input
        className="form-control mb-4"
        placeholder="Search roles..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setCurrentPage(1);
        }}
      />

      {/* CARDS */}
      <div className="row">
        {paginatedRoles.map(role => (
          <div className="col-md-4 mb-4" key={role.id}>
            <div className={`card shadow-sm h-100 p-3 ${getCardColor(role.name)}`}>

              <h6 className="fw-bold">{role.name}</h6>

              <p className="small text-muted mb-2">
                {role.description || "No description"}
              </p>

              <p className="small text-muted">
                Created: {role.createdAt || "N/A"}
              </p>

              <div className="d-flex justify-content-between mt-auto">
                <button
                  className="btn btn-light w-100 me-2"
                  onClick={() => openEdit(role)}
                >
                  Edit
                </button>

                <button
                  className="btn btn-outline-danger btn-sm"
                  style={{ width: "40px" }}
                  onClick={() => setDeleteRoleId(role.id)}
                >
                  <i className="bi bi-trash"></i>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-3">
          <ul className="pagination">
            {Array.from({ length: totalPages }, (_, i) => (
              <li key={i} className={`page-item ${currentPage === i + 1 ? "active" : ""}`}>
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

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content p-4">

              <div className="d-flex justify-content-between mb-4">
                <h5 className="fw-bold">
                  {editingRole ? "Edit Role" : "Create New Role"}
                </h5>
                <button className="btn-close" onClick={() => setModalOpen(false)}></button>
              </div>

              <form onSubmit={handleSubmit} noValidate>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Role Name</label>
                  <input
                    className={`form-control ${errors.name ? "is-invalid" : ""}`}
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        name: e.target.value.toUpperCase().replace(/\s+/g, "_")
                      })
                    }
                    placeholder="e.g. PROJECT_MANAGER"
                  />
                  {errors.name && (
                    <div className="invalid-feedback">{errors.name}</div>
                  )}
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold">Description</label>
                  <textarea
                    className="form-control"
                    rows={4}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>

                <div className="d-flex justify-content-end gap-2">
                  <button
                    type="button"
                    className="btn btn-light"
                    onClick={() => setModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-dark">
                    {editingRole ? "Update" : "Create"}
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteRoleId && (
        <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content p-4 text-center">

              <h5 className="fw-bold mb-3">Delete Role?</h5>
              <p className="text-muted small">
                This action cannot be undone.
              </p>

              <div className="d-flex justify-content-center gap-3 mt-3">
                <button
                  className="btn btn-light"
                  onClick={() => setDeleteRoleId(null)}
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

export default RolesPage;