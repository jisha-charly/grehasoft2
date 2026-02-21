import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import KanbanBoard from "../../components/KanbanBoard";
import TaskDetailsModal from "../../components/TaskDetailsModal";
import { useAuth } from "../../context/AuthContext";
import {
  Project,
  Task,
  User,
  Milestone,
  TaskType,
  TaskFile,
  TaskReview,
  TaskStatus,
} from "../../types";

import { projectService } from "../../services/project.service";
import { taskService } from "../../services/task.service";
import { userService } from "../../services/user.service";
import { milestoneService } from "../../services/milestone.service";
import { taskTypeService } from "../../services/taskType.service";
import { fileService } from "../../services/file.service";
import { reviewService } from "../../services/review.service";

const ProjectKanbanPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const projectId = Number(id);

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [taskTypes, setTaskTypes] = useState<TaskType[]>([]);
  const [taskFiles, setTaskFiles] = useState<TaskFile[]>([]);
  const [taskReviews, setTaskReviews] = useState<TaskReview[]>([]);

  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
 const { user } = useAuth();

const currentUser: User | null = user
  ? {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.username,      // map for UI
      departmentId: 0,
      status: "active",
      role: user.role as any,
    }
  : null;

  /* ---------------------- LOAD DATA ---------------------- */

  const fetchData = async () => {
    try {
      const [
        projectRes,
        tasksRes,
        usersRes,
        milestonesRes,
        taskTypesRes,
        filesRes,
        reviewsRes,
      ] = await Promise.all([
        projectService.getById(projectId),
        taskService.getByProject(projectId),
        userService.getAll(),
        milestoneService.getByProject(projectId),
        taskTypeService.getAll(),
        fileService.getByProject(projectId),
reviewService.getByProject(projectId),
      ]);

      setProject(projectRes);
      setTasks(tasksRes);
      setUsers(usersRes);
      setMilestones(milestonesRes);
      setTaskTypes(taskTypesRes);
      setTaskFiles(filesRes);
      setTaskReviews(reviewsRes);
    } catch (error) {
      console.error("Failed to load kanban data", error);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchData();
    }
  }, [projectId]);

  if (!project) {
    return (
      <div className="p-5 text-center">
        <h3>Project not found</h3>
        <Link to="/projects">Back to list</Link>
      </div>
    );
  }

  /* ---------------------- TASK CREATE ---------------------- */

  const handleNewTaskSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    const rawStatus = fd.get("status") as string;

    const statusMap: Record<string, TaskStatus> = {
      todo: TaskStatus.TODO,
      in_progress: TaskStatus.IN_PROGRESS,
      blocked: TaskStatus.BLOCKED,
      done: TaskStatus.DONE,
    };

    await taskService.create({
      projectId: projectId,
      milestoneId: fd.get("milestoneId")
        ? Number(fd.get("milestoneId"))
        : undefined,
      title: String(fd.get("title")),
      description: String(fd.get("description") || ""),
      priority: fd.get("priority") as "low" | "medium" | "high",
      status: statusMap[rawStatus] ?? TaskStatus.TODO,
      dueDate: String(fd.get("dueDate")),
      taskTypeId: Number(fd.get("taskTypeId")),
      assignees: fd.get("assignee")
        ? [Number(fd.get("assignee"))]
        : [],
      boardOrder: 0,
    });

    setModalOpen(false);
    fetchData();
  };

  /* ---------------------- TASK UPDATE ---------------------- */

  const handleTaskUpdate = async (
    id: number,
    data: Partial<Task>
  ) => {
    await taskService.update(id, data);
    fetchData();
  };

  const handleTasksReorder = (newTasks: Task[]) => {
    setTasks(newTasks);
  };

  /* ---------------------- UI ---------------------- */

  return (
    <div className="kanban-page-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1 text-dark">Work Board</h2>
          <p className="text-secondary small mb-0">
            Sprint management for <strong>{project.name}</strong>
          </p>
        </div>

        <div className="d-flex gap-2">
          <Link
            to={`/projects/${project.id}`}
            className="btn btn-outline-secondary btn-sm fw-bold px-3 shadow-sm bg-white border"
          >
            Back to Project
          </Link>

          <button
            className="btn btn-primary fw-bold btn-sm px-3 shadow-sm"
            onClick={() => setModalOpen(true)}
          >
            + New Task
          </button>
        </div>
      </div>

      <KanbanBoard
        tasks={tasks}
        onTaskUpdate={handleTaskUpdate}
        onTasksReorder={handleTasksReorder}
        onTaskClick={setSelectedTask}
      />

      {isModalOpen && (
        <div className="modal show d-block bg-dark bg-opacity-50">
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow-lg">
              <form onSubmit={handleNewTaskSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title">
                    Add Task to {project.name}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setModalOpen(false)}
                  />
                </div>

                <div className="modal-body">
                  <input
                    name="title"
                    className="form-control mb-3"
                    placeholder="Task title"
                    required
                  />
                  <textarea
                    name="description"
                    className="form-control mb-3"
                    placeholder="Description"
                  />
                  <input
                    name="dueDate"
                    type="date"
                    className="form-control mb-3"
                    required
                  />
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-light"
                    onClick={() => setModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Create Task
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

   {selectedTask && currentUser && (
  <TaskDetailsModal
    task={selectedTask}
    users={users}
    files={taskFiles}
    reviews={taskReviews}
    currentUser={currentUser}   // ✅ use mapped user
    onClose={() => setSelectedTask(null)}
    onAddFile={async (file) => {
      await fileService.create(file);
      fetchData();
    }}
    onAddReview={async (review) => {
      await reviewService.create(review);
      fetchData();
    }}
    onUpdateStatus={handleTaskUpdate}
  />
)}
    </div>
  );
};

export default ProjectKanbanPage; 