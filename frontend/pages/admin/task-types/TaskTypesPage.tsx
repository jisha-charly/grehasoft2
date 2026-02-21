import React, { useEffect, useState, useMemo } from "react";
import { TaskType } from "../../../types";
import { taskTypeService } from "../../../services/taskType.service";

const ITEMS_PER_PAGE = 6;

const TaskTypesPage: React.FC = () => {
  const [taskTypes, setTaskTypes] = useState<TaskType[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [isModalOpen, setModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<TaskType | null>(null);
  const [deleteTypeId, setDeleteTypeId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: ""
  });

  const [errors, setErrors] = useState<any>({});
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    fetchTaskTypes();
  }, []);

  const fetchTaskTypes = async () => {
    const data = await taskTypeService.getAll();
    setTaskTypes(data);
  };

  const filteredTypes = useMemo(() => {
    return taskTypes.filter(tt =>
      tt.name.toLowerCase().includes(search.toLowerCase()) ||
      (tt.description || "").toLowerCase().includes(search.toLowerCase())
    );
  }, [taskTypes, search]);

  const totalPages = Math.ceil(filteredTypes.length / ITEMS_PER_PAGE);

  const paginatedTypes = filteredTypes.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.name.trim())
      newErrors.name = "Task type name is required";

    if (!/^[A-Z_]+$/.test(formData.name))
      newErrors.name = "Use only uppercase letters and underscores";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
  setFormError(null);

  if (editingType) {
    await taskTypeService.update(editingType.id, formData);
  } else {
    await taskTypeService.create(formData);
  }

  fetchTaskTypes();
  setModalOpen(false);
  resetForm();
  setEditingType(null);

} catch (err: any) {
  console.error(err);

  const data = err.response?.data;

  if (data?.name) {
    if (Array.isArray(data.name)) {
      setFormError(data.name[0]);
    } else {
      setFormError(data.name);
    }
  } else {
    setFormError("Something went wrong. Please try again.");
  }
}};

  const resetForm = () => {
    setFormData({
      name: "",
      description: ""
    });
    setErrors({});
  };

  const openEdit = (tt: TaskType) => {
    setEditingType(tt);
    setFormData({
      name: tt.name,
      description: tt.description || ""
    });
    setModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTypeId) return;
    await taskTypeService.delete(deleteTypeId);
    setDeleteTypeId(null);
    fetchTaskTypes();
  };

  return (
    <div className="container-fluid p-4">

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1">Task Types</h3>
          <p className="text-muted small">
            Define and manage task classifications
          </p>
        </div>

        <button
          className="btn btn-dark"
          onClick={() => {
            setEditingType(null);
            resetForm();
            setModalOpen(true);
          }}
        >
          + New Task Type
        </button>
      </div>

      {/* SEARCH */}
      <input
        className="form-control mb-4"
        placeholder="Search task types..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setCurrentPage(1);
        }}
      />

      {/* CARDS */}
      <div className="row">
        {paginatedTypes.map(tt => (
          <div className="col-md-4 mb-4" key={tt.id}>
            <div className="card shadow-sm h-100 p-3">

              <span className="badge bg-light text-dark border font-monospace mb-2">
                {tt.name}
              </span>

              <p className="small text-muted mb-2">
                {tt.description || "No description provided"}
              </p>

              <p className="small text-muted">
                Created: {tt.createdAt || "N/A"}
              </p>

              <div className="d-flex justify-content-between mt-auto">
                <button
                  className="btn btn-light w-100 me-2"
                  onClick={() => openEdit(tt)}
                >
                  Edit
                </button>

                <button
                  className="btn btn-outline-danger btn-sm"
                  style={{ width: "40px" }}
                  onClick={() => setDeleteTypeId(tt.id)}
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
                  {editingType ? "Edit Task Type" : "Create Task Type"}
                </h5>
                <button className="btn-close" onClick={() => setModalOpen(false)}></button>
              </div>

              <form onSubmit={handleSubmit} noValidate>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Type Name</label>
                  <input
                    className={`form-control ${errors.name ? "is-invalid" : ""}`}
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        name: e.target.value.toUpperCase().replace(/\s+/g, "_")
                      })
                    }
                    placeholder="e.g. DEVELOPMENT"
                  />
                  {formError && (
  <div className="text-danger mt-2">
    {formError}
  </div>
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
                    {editingType ? "Update" : "Create"}
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteTypeId && (
        <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content p-4 text-center">

              <h5 className="fw-bold mb-3">Delete Task Type?</h5>
              <p className="text-muted small">
                This action cannot be undone.
              </p>

              <div className="d-flex justify-content-center gap-3 mt-3">
                <button
                  className="btn btn-light"
                  onClick={() => setDeleteTypeId(null)}
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

export default TaskTypesPage;