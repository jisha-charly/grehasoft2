import React, { useEffect, useState, useMemo } from "react";
import api from "../../../api/axiosInstance";
import { User, Role, Department, UserRole } from "../../../types";

const ITEMS_PER_PAGE = 6;

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [isModalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);

  const [errors, setErrors] = useState<any>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState<any>({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    department: "",
    status: "active",
  });

  useEffect(() => {
    fetchUsers();
    fetchRoles();
    fetchDepartments();
  }, []);

  const fetchUsers = async () => {
    const res = await api.get("users/");
    const formatted: User[] = res.data.map((u: any) => ({
      id: u.id,
      name: u.name,
      username: u.username,
      email: u.email,
      role: u.role_name as UserRole,
      departmentId: u.department,
      status: u.status,
      createdAt: u.date_joined,
    }));
    setUsers(formatted);
  };

  const fetchRoles = async () => {
    const res = await api.get("roles/");
    setRoles(res.data);
  };

  const fetchDepartments = async () => {
    const res = await api.get("departments/");
    setDepartments(res.data);
  };

  const filteredUsers = useMemo(() => {
    return users.filter(
      u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.username.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );
  }, [users, search]);

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const isSuperAdmin = (user: User) =>
    user.role === UserRole.SUPER_ADMIN;

  const handleDelete = async () => {
    if (!deleteUser) return;
    try {
      await api.delete(`users/${deleteUser.id}/`);
      setDeleteUser(null);
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.name.trim())
      newErrors.name = "Full name is required";

    if (!formData.username.trim())
      newErrors.username = "Username is required";

    if (!formData.email.trim())
      newErrors.email = "Email is required";

    if (!editingUser) {
      if (!formData.password)
        newErrors.password = "Password is required";
      if (!formData.confirmPassword)
        newErrors.confirmPassword = "Confirm password is required";
      if (formData.password !== formData.confirmPassword)
        newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.role)
      newErrors.role = "Select role";

    if (!formData.department)
      newErrors.department = "Select department";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = { ...formData };
    delete payload.confirmPassword;

    try {
      if (editingUser) {
        await api.put(`users/${editingUser.id}/`, payload);
      } else {
        await api.post("users/", payload);
      }

      fetchUsers();
      setModalOpen(false);
      setEditingUser(null);
      resetForm();
      setErrors({});
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "",
      department: "",
      status: "active",
    });
  };

  const openEditModal = (user: User) => {
    if (isSuperAdmin(user)) return;

    setEditingUser(user);
    setFormData({
      name: user.name,
      username: user.username,
      email: user.email,
      password: "",
      confirmPassword: "",
      role: roles.find(r => r.name === user.role)?.id,
      department: user.departmentId,
      status: user.status,
    });
    setModalOpen(true);
  };

  return (
    <div className="container-fluid p-4">

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h3 className="fw-bold mb-1">Users Management</h3>
          <p className="text-muted small">Manage team members and access</p>
        </div>

        <button
          className="btn btn-dark"
          onClick={() => {
            setEditingUser(null);
            resetForm();
            setModalOpen(true);
          }}
        >
          + New User
        </button>
      </div>

      {/* SEARCH */}
      <input
        className="form-control mb-4"
        placeholder="Search users..."
        value={search}
        onChange={e => {
          setSearch(e.target.value);
          setCurrentPage(1);
        }}
      />

      {/* CARDS */}
      <div className="row">
        {paginatedUsers.map(user => (
          <div className="col-md-4 mb-4" key={user.id}>
            <div className="card shadow-sm h-100 p-3">

              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="fw-bold">{user.name}</h6>
                  <small className="text-muted">@{user.username}</small>
                </div>

                <span className={`badge ${
                  user.status === "active"
                    ? "bg-success-subtle text-success"
                    : "bg-danger-subtle text-danger"
                }`}>
                  {user.status}
                </span>
              </div>

              <hr />

              <p className="small">📧 {user.email}</p>

              <span className="badge bg-primary-subtle text-primary mb-2">
                {user.role.replace("_", " ")}
              </span>

              <p className="small text-muted">
                🏢 {departments.find(d => d.id === user.departmentId)?.name}
              </p>

              <p className="small text-muted">
                Created: {new Date(user.createdAt || "").toLocaleDateString()}
              </p>

              {!isSuperAdmin(user) && (
                <div className="d-flex justify-content-between mt-auto">
                  <button
                    className="btn btn-light w-100 me-2"
                    onClick={() => openEditModal(user)}
                  >
                    Edit
                  </button>

                  <button
                    className="btn btn-outline-danger"
                    style={{ width: "40px" }}
                    onClick={() => setDeleteUser(user)}
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </div>
              )}

            </div>
          </div>
        ))}
      </div>

      {/* DELETE MODAL */}
      {deleteUser && (
        <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content p-4">
              <h5 className="fw-bold mb-3">Confirm Delete</h5>
              <p>Delete <strong>{deleteUser.name}</strong>?</p>

              <div className="d-flex justify-content-end gap-2 mt-4">
                <button className="btn btn-light" onClick={() => setDeleteUser(null)}>
                  Cancel
                </button>
                <button className="btn btn-danger" onClick={handleDelete}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

      {/* MODAL */}
      {isModalOpen && (
        <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content p-4">

              <div className="d-flex justify-content-between mb-4">
                <h5 className="fw-bold">
                  {editingUser ? "Edit User" : "Create New User"}
                </h5>
                <button className="btn-close" onClick={() => setModalOpen(false)}></button>
              </div>

              <form onSubmit={handleSubmit} noValidate autoComplete="off">

                {/* ROW 1 */}
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Full Name</label>
                    <input
                      className={`form-control ${errors.name ? "is-invalid" : ""}`}
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                    {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Username</label>
                    <input
                      className={`form-control ${errors.username ? "is-invalid" : ""}`}
                      value={formData.username}
                      onChange={e => setFormData({ ...formData, username: e.target.value })}
                    />
                    {errors.username && <div className="invalid-feedback">{errors.username}</div>}
                  </div>
                </div>

                {/* ROW 2 */}
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Email</label>
                  <input
                    type="email"
                    className={`form-control ${errors.email ? "is-invalid" : ""}`}
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                  />
                  {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                </div>

                {/* ROW 3 */}
                {!editingUser && (
                  <div className="row mb-3">
                    <div className="col-md-6 position-relative">
                      <label className="form-label small fw-semibold">Password</label>
                      <input
                        type={showPassword ? "text" : "password"}
                        className={`form-control ${errors.password ? "is-invalid" : ""}`}
                        value={formData.password}
                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6 position-relative">
                      <label className="form-label small fw-semibold">Confirm Password</label>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        className={`form-control ${errors.confirmPassword ? "is-invalid" : ""}`}
                        value={formData.confirmPassword}
                        onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                {/* ROW 4 */}
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Role</label>
                    <select
                      className={`form-select ${errors.role ? "is-invalid" : ""}`}
                      value={formData.role}
                      onChange={e => setFormData({ ...formData, role: e.target.value })}
                    >
                      <option value="">Select Role</option>
                      {roles.map(r => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Department</label>
                    <select
                      className={`form-select ${errors.department ? "is-invalid" : ""}`}
                      value={formData.department}
                      onChange={e => setFormData({ ...formData, department: e.target.value })}
                    >
                      <option value="">Select Department</option>
                      {departments.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* STATUS */}
                <div className="mb-4">
                  <label className="form-label small fw-semibold">Status</label>
                  <select
                    className="form-select"
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="d-flex justify-content-end gap-2">
                  <button type="button" className="btn btn-light" onClick={() => setModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-dark">
                    {editingUser ? "Update" : "Create"}
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default UsersPage;