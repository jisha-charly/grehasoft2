import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";

import {
  Project,
  Task,
  User,
  Department,
  TaskFile,
  TaskReview,
  TaskStatus,
} from "../../types";

import { projectService } from "@/services/project.service";
import { taskService } from "@/services/task.service";
import { departmentService } from "@/services/department.service";
import { userService } from "@/services/user.service";
import { fileService } from "@/services/file.service";
import { reviewService } from "@/services/review.service";

import TaskDetailsModal from "../../components/TaskDetailsModal";

const ProjectDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [files, setFiles] = useState<TaskFile[]>([]);
  const [reviews, setReviews] = useState<TaskReview[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [
        proj,
        taskRes,
        deptRes,
        userRes,
        fileRes,
        reviewRes,
      ] = await Promise.all([
        projectService.getById(Number(id)),
        taskService.getByProject(Number(id)),
        departmentService.getAll(),
        userService.getAll(),
        fileService.getByProject(Number(id)),
        reviewService.getByProject(Number(id)),
      ]);

      setProject(proj);
      setTasks(taskRes);
      setDepartments(deptRes);
      setUsers(userRes);
      setFiles(fileRes);
      setReviews(reviewRes);

      // Example: first user as logged in user (replace with auth context later)
      setCurrentUser(userRes[0] || null);
    } catch {
      toast.error("Failed to load project details");
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      await taskService.delete(taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));
      toast.success("Task deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  if (!project) return <div className="p-4">Loading...</div>;

  return (
    <div className="container-fluid p-4">
      <h3 className="fw-bold mb-3">{project.name}</h3>

      <p className="text-muted">
        Department:{" "}
        {departments.find(d => d.id === project.departmentId)?.name || "N/A"}
      </p>

      <p className="text-muted">
        Manager:{" "}
        {users.find(u => u.id === project.projectManagerId)?.name || "N/A"}
      </p>

      <hr />

      <h5 className="mb-3">Tasks</h5>

      <table className="table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map(task => (
            <tr key={task.id}>
              <td
                style={{ cursor: "pointer" }}
                onClick={() => setSelectedTask(task)}
              >
                {task.title}
              </td>
              <td>{task.status}</td>
              <td>{task.priority}</td>
              <td>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDeleteTask(task.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedTask && currentUser && (
        <TaskDetailsModal
          task={selectedTask}
          users={users}
          files={files.filter(f => f.taskId === selectedTask.id)}
reviews={reviews.filter(r => r.taskId === selectedTask.id)}
          currentUser={currentUser}
          onClose={() => setSelectedTask(null)}
          onAddFile={async (data: Partial<TaskFile>) => {
            await reviewService.create(data);
            fetchData();
          }}
          onAddReview={async (data: Partial<TaskReview>) => {
            await reviewService.create(data);
            fetchData();
          }}
       onUpdateStatus={async (id: number, updates: Partial<Task>) => {
  await taskService.update(id, updates);
  fetchData();
}}
        />
      )}
    </div>
  );
};

export default ProjectDetailsPage;