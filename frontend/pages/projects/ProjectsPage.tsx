import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { projectService } from "../../services/project.service";
import { userService } from "../../services/user.service";
import { departmentService } from "../../services/department.service";
import { clientService } from "../../services/client.service";
import toast from "react-hot-toast";
import { ProjectStatus } from "../../types";
const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any | null>(null);

 const fetchData = async () => {
  try {
    const [proj, usr, dept, cli] = await Promise.all([
      projectService.getAll(),
      userService.getAll(),
      departmentService.getAll(),
      clientService.getAll(),
    ]);

    setProjects(proj);
    setUsers(usr);
    setDepartments(dept);
    setClients(cli);
  } catch (error) {
    toast.error("Failed to load projects data");
  }
};

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

   const data = {
  name: fd.get("name") as string,
  clientId: Number(fd.get("clientId")),
  departmentId: Number(fd.get("departmentId")),
  projectManagerId: Number(fd.get("projectManagerId")),
  startDate: fd.get("startDate") as string,
  endDate: fd.get("endDate") as string,
  status: fd.get("status") as ProjectStatus, // ✅ FIXED
};

    try {
      if (editingProject) {
        await projectService.update(editingProject.id, data);
        toast.success("Project updated successfully");
      } else {
        await projectService.create(data);
        toast.success("Project created successfully");
      }

      fetchData();
      setModalOpen(false);
    } catch (error) {
      toast.error("Failed to save project");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this project?")) return;

    try {
      await projectService.delete(id);
      toast.success("Project deleted");
      fetchData();
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="container-fluid p-0">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1">Company Projects</h3>
          <p className="text-secondary small mb-0">
            Active enterprise initiatives
          </p>
        </div>
        <button
          className="btn btn-dark fw-bold px-4 shadow-sm"
          onClick={() => {
            setEditingProject(null);
            setModalOpen(true);
          }}
        >
          <i className="bi bi-plus-lg me-2"></i>New Project
        </button>
      </div>

      <div className="row g-4">
        {projects.map((p) => (
          <div className="col-lg-4 col-md-6" key={p.id}>
            <div className="card h-100 p-4 border-0 shadow-sm">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div className="fw-bold fs-5">{p.name}</div>
                <span className="badge bg-primary-subtle text-primary">
                  {p.status}
                </span>
              </div>

              <p className="text-secondary small mb-3">
                {p.clientName || "Internal"}
              </p>

              <div className="d-flex gap-2">
                <button
                  className="btn btn-light btn-sm flex-grow-1"
                  onClick={() => {
                    setEditingProject(p);
                    setModalOpen(true);
                  }}
                >
                  Edit
                </button>

                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(p.id)}
                >
                  Delete
                </button>

                <Link
                  to={`/projects/${p.id}`}
                  className="btn btn-dark btn-sm text-white"
                >
                  Details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="modal show d-block bg-dark bg-opacity-50">
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content p-4">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <input
                    name="name"
                    className="form-control"
                    placeholder="Project Name"
                    defaultValue={editingProject?.name}
                    required
                  />
                </div>

                <div className="row g-3">
                  <div className="col-md-6">
                    <select
                      name="clientId"
                      className="form-select"
                      defaultValue={editingProject?.clientId}
                    >
                      {clients.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.companyName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6">
                    <select
                      name="departmentId"
                      className="form-select"
                      defaultValue={editingProject?.departmentId}
                    >
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-3 text-end">
                  <button
                    type="button"
                    className="btn btn-light me-2"
                    onClick={() => setModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Save Project
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

export default ProjectsPage;