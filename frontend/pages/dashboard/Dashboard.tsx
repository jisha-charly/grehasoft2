import React, { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import { projectService } from "../../services/project.service";
import { taskService } from "../../services/task.service";
import toast from "react-hot-toast";

const Dashboard: React.FC = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
  try {
    const [projectRes, taskRes] = await Promise.all([
  projectService.getAll(),
  taskService.getAll(),
]);

setProjects(projectRes);
setTasks(taskRes);
  } catch (error) {
    console.error(error);
    toast.error("Failed to load dashboard data");
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="p-4">Loading dashboard...</div>;
  }

  // ===== DYNAMIC CALCULATIONS =====

  const activeProjects = projects.filter(
    (p) => p.status === "in_progress"
  ).length;

  const delayedProjects = projects.filter(
    (p) => p.status === "delayed"
  ).length;

  const pendingProjects = projects.filter(
    (p) => p.status === "pending"
  ).length;

  const totalProjects = projects.length;

  const statusData = [
    {
      name: "Active",
      value: totalProjects ? Math.round((activeProjects / totalProjects) * 100) : 0,
      color: "#0d6efd",
    },
    {
      name: "Delayed",
      value: totalProjects ? Math.round((delayedProjects / totalProjects) * 100) : 0,
      color: "#dc3545",
    },
    {
      name: "Pending",
      value: totalProjects ? Math.round((pendingProjects / totalProjects) * 100) : 0,
      color: "#ffc107",
    },
  ];

  // Weekly mock logic (replace later with real API aggregation)
  const activityData = [
    { name: "Mon", tasks: tasks.length },
    { name: "Tue", tasks: Math.floor(tasks.length * 0.8) },
    { name: "Wed", tasks: Math.floor(tasks.length * 0.6) },
    { name: "Thu", tasks: Math.floor(tasks.length * 0.7) },
    { name: "Fri", tasks: Math.floor(tasks.length * 0.9) },
    { name: "Sat", tasks: Math.floor(tasks.length * 0.4) },
    { name: "Sun", tasks: Math.floor(tasks.length * 0.3) },
  ];

  return (
    <div className="container-fluid p-0">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1 text-dark">Company Overview</h3>
          <p className="text-secondary small">
            Real-time performance metrics across all departments
          </p>
        </div>
      </div>

      {/* ===== STATS ===== */}
      <div className="row g-4 mb-4">
        {[
          { label: "Active Projects", value: activeProjects, icon: "bi-briefcase", color: "primary" },
          { label: "Total Projects", value: totalProjects, icon: "bi-kanban", color: "success" },
          { label: "Total Tasks", value: tasks.length, icon: "bi-list-check", color: "warning" },
        ].map((stat, i) => (
          <div className="col-md-4" key={i}>
            <div className="card p-4 h-100 border-0 shadow-sm">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div className={`p-2 rounded-3 bg-${stat.color}-subtle text-${stat.color}`}>
                  <i className={`bi ${stat.icon} fs-4`}></i>
                </div>
                <span className="badge bg-light text-dark border fw-normal">Live</span>
              </div>
              <h3 className="fw-bold mb-1 text-dark">{stat.value}</h3>
              <p className="text-secondary small fw-bold mb-0 text-uppercase">
                {stat.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ===== CHARTS ===== */}
      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card p-4 border-0 shadow-sm">
            <h5 className="fw-bold mb-4 text-dark">Weekly Task Throughput</h5>
            <div style={{ minHeight: "300px" }}>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="tasks"
                    stroke="#0d6efd"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card p-4 border-0 shadow-sm">
            <h5 className="fw-bold mb-4 text-dark">Project Health</h5>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={statusData} innerRadius={60} outerRadius={80} dataKey="value">
                  {statusData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;