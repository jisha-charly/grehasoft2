import React, { useEffect, useState, useMemo } from "react";
import { Department } from "../../../types";
import { departmentService } from "../../../services/department.service";

const ITEMS_PER_PAGE = 6;

const DepartmentsPage: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [isModalOpen, setModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [deleteDeptId, setDeleteDeptId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    parentId: ""
  });

  
const [errors, setErrors] = useState<any>({});
  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    const data = await departmentService.getAll();
    setDepartments(data);
  };

  const filteredDepartments = useMemo(() => {
    return departments.filter(d =>
      d.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [departments, search]);

  const totalPages = Math.ceil(filteredDepartments.length / ITEMS_PER_PAGE);

  const paginatedDepartments = filteredDepartments.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const validateForm = () => {
    const newErrors: any = {};
    if (!formData.name.trim())
      newErrors.name = "Department name is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!validateForm()) return;

  const payload = {
    name: formData.name,
    parent: formData.parentId ? Number(formData.parentId) : null
  };

  try {
    if (editingDept) {
      await departmentService.update(editingDept.id, payload);
    } else {
      await departmentService.create(payload);
    }

    fetchDepartments();
    setModalOpen(false);
    resetForm();
    setErrors({});

  } catch (err: any) {
    if (err.response?.data) {
      setErrors(err.response.data);
    } else {
      setErrors({ name: "Something went wrong. Please try again." });
    }
  }
};
  const resetForm = () => {
    setFormData({
      name: "",
      parentId: ""
    });
    setErrors({});
  };

  const openEdit = (dept: Department) => {
    setEditingDept(dept);
    setFormData({
      name: dept.name,
      parentId: dept.parentId ? String(dept.parentId) : ""
    });
    setModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteDeptId) return;
    await departmentService.delete(deleteDeptId);
    setDeleteDeptId(null);
    fetchDepartments();
  };

  const getParentName = (parentId?: number) => {
    if (!parentId) return null;
    return departments.find(d => d.id === parentId)?.name;
  };

  return (
    <div className="container-fluid p-4">

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1">Departments</h3>
          <p className="text-muted small">Manage organizational structure</p>
        </div>

        <button
          className="btn btn-dark"
          onClick={() => {
            setEditingDept(null);
            resetForm();
            setModalOpen(true);
          }}
        >
          + New Department
        </button>
      </div>

      {/* SEARCH */}
      <input
        className="form-control mb-4"
        placeholder="Search departments..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setCurrentPage(1);
        }}
      />

      {/* CARDS */}
      <div className="row">
        {paginatedDepartments.map(dept => {
          const parentName = getParentName(dept.parentId);

          return (
            <div className="col-md-4 mb-4" key={dept.id}>
              <div className="card shadow-sm h-100 p-3">

                <h6 className="fw-bold">{dept.name}</h6>

                <p className="small text-muted mb-2">
                  {parentName
                    ? `Sub Department of ${parentName}`
                    : "Primary Department"}
                </p>

                <p className="small text-muted">
                  Created: {dept.createdAt || "N/A"}
                </p>

                <div className="d-flex justify-content-between mt-auto">
                  <button
                    className="btn btn-light w-100 me-2"
                    onClick={() => openEdit(dept)}
                  >
                    Edit
                  </button>

                  <button
                    className="btn btn-outline-danger btn-sm"
                    style={{ width: "40px" }}
                    onClick={() => setDeleteDeptId(dept.id)}
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </div>

              </div>
            </div>
          );
        })}
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
                  {editingDept ? "Edit Department" : "Create Department"}
                </h5>
                <button className="btn-close" onClick={() => setModalOpen(false)}></button>
              </div>

              <form onSubmit={handleSubmit} noValidate>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Department Name</label>
                  <input
                    className={`form-control ${errors.name ? "is-invalid" : ""}`}
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                 {errors.name && (
  <div className="invalid-feedback">
    {Array.isArray(errors.name) ? errors.name[0] : errors.name}
  </div>
)}
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold">Parent Department</label>
                  <select
                    className="form-select"
                    value={formData.parentId}
                    onChange={(e) =>
                      setFormData({ ...formData, parentId: e.target.value })
                    }
                  >
                    <option value="">None (Primary)</option>
                    {departments
                      .filter(d => d.id !== editingDept?.id)
                      .map(d => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                  </select>
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
                    {editingDept ? "Update" : "Create"}
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteDeptId && (
        <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content p-4 text-center">

              <h5 className="fw-bold mb-3">Delete Department?</h5>
              <p className="text-muted small">
                This action cannot be undone.
              </p>

              <div className="d-flex justify-content-center gap-3 mt-3">
                <button
                  className="btn btn-light"
                  onClick={() => setDeleteDeptId(null)}
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

export default DepartmentsPage;