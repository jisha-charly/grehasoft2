import React, { useState } from "react";
import {
  Task,
  TaskFile,
  TaskReview,
  User,
  UserRole,
  TaskStatus,
} from "../types";

interface TaskDetailsModalProps {
  task: Task;
  onClose: () => void;
  files: TaskFile[];
  reviews: TaskReview[];
  users: User[];
  currentUser: User;
  onAddFile: (file: Partial<TaskFile>) => Promise<void>;
  onAddReview: (review: Partial<TaskReview>) => Promise<void>;
  onUpdateStatus: (id: number, updates: Partial<Task>) => Promise<void>;
}

const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({
  task,
  onClose,
  files,
  reviews,
  users,
  currentUser,
  onAddFile,
  onAddReview,
  onUpdateStatus,
}) => {
  const [activeTab, setActiveTab] = useState<"info" | "files">("info");

  const [reviewForm, setReviewForm] = useState<{
    fileId: number | null;
    comments: string;
    status: "approved" | "rework";
  }>({
    fileId: null,
    comments: "",
    status: "approved",
  });

  const taskFiles = files.filter((f) => f.taskId === task.id);
  const getFileReviews = (fileId: number) =>
    reviews.filter((r) => r.taskFileId === fileId);

  const isReviewer =
    currentUser.role === UserRole.SUPER_ADMIN ||
    currentUser.role === UserRole.PROJECT_MANAGER;

  /* ---------------- FILE UPLOAD ---------------- */

  const handleFileUpload = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const file = fd.get("file") as File;

    if (!file) return;

    await onAddFile({
      taskId: task.id,
      uploadedBy: currentUser.id,
      filePath: file.name,
      fileType: file.type,
      revisionNo: taskFiles.length + 1,
    });

    e.currentTarget.reset();
  };

  /* ---------------- REVIEW SUBMIT ---------------- */

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewForm.fileId) return;

    await onAddReview({
      taskFileId: reviewForm.fileId,
      reviewerId: currentUser.id,
      reviewedByRole:
        currentUser.role === UserRole.SUPER_ADMIN ? "ADMIN" : "PM",
      reviewVersion:
        getFileReviews(reviewForm.fileId).length + 1,
      comments: reviewForm.comments,
      status: reviewForm.status,
    });

    setReviewForm({
      fileId: null,
      comments: "",
      status: "approved",
    });
  };

  /* ---------------- UI ---------------- */

  return (
    <div
      className="modal show d-block bg-dark bg-opacity-50"
      style={{ zIndex: 1060 }}
    >
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content border-0 rounded-4 shadow-lg">
          {/* HEADER */}
          <div className="modal-header border-0">
            <div>
              <h5 className="fw-bold">{task.title}</h5>
              <span className="badge bg-primary-subtle text-primary small">
                Task Execution Details
              </span>
            </div>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            />
          </div>

          <div className="modal-body">
            {/* TABS */}
            <ul className="nav nav-pills mb-4">
              <li className="nav-item">
                <button
                  className={`nav-link ${
                    activeTab === "info" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("info")}
                >
                  Overview
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${
                    activeTab === "files" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("files")}
                >
                  Files & Reviews ({taskFiles.length})
                </button>
              </li>
            </ul>

            {/* OVERVIEW TAB */}
            {activeTab === "info" && (
              <div className="row">
                <div className="col-md-8">
                  <p className="small text-muted">
                    {task.description || "No description provided."}
                  </p>
                </div>

                <div className="col-md-4">
                  <div className="mb-3">
                    <label className="small fw-bold">
                      Priority
                    </label>
                    <div>
                      <span className="badge bg-secondary">
                        {task.priority.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="small fw-bold">
                      Status
                    </label>
                    <select
                      className="form-select form-select-sm"
                      value={task.status}
                      onChange={(e) =>
                        onUpdateStatus(task.id, {
                          status:
                            e.target.value as TaskStatus,
                        })
                      }
                    >
                      <option value={TaskStatus.TODO}>
                        To Do
                      </option>
                      <option
                        value={TaskStatus.IN_PROGRESS}
                      >
                        In Progress
                      </option>
                      <option
                        value={TaskStatus.BLOCKED}
                      >
                        Blocked
                      </option>
                      <option value={TaskStatus.DONE}>
                        Completed
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="small fw-bold">
                      Due Date
                    </label>
                    <div className="small">
                      {task.dueDate}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* FILES TAB */}
            {activeTab === "files" && (
              <div className="row">
                {/* FILE LIST */}
                <div className="col-md-7">
                  {taskFiles.length === 0 ? (
                    <div className="text-muted small">
                      No files uploaded.
                    </div>
                  ) : (
                    taskFiles.map((file) => {
                      const fileReviews =
                        getFileReviews(file.id);
                      return (
                        <div
                          key={file.id}
                          className="border rounded p-2 mb-3"
                        >
                          <div className="fw-bold small">
                            {file.filePath}
                          </div>
                          <div className="small text-muted">
                            Version {file.revisionNo}
                          </div>

                          {fileReviews.map((review) => (
                            <div
                              key={review.id}
                              className="small mt-2 bg-light p-2 rounded"
                            >
                              <strong>
                                {
                                  users.find(
                                    (u) =>
                                      u.id ===
                                      review.reviewerId
                                  )?.name
                                }
                              </strong>
                              : {review.comments}
                            </div>
                          ))}

                          {isReviewer && (
                            <button
                              className="btn btn-sm btn-link mt-2"
                              onClick={() =>
                                setReviewForm({
                                  ...reviewForm,
                                  fileId: file.id,
                                })
                              }
                            >
                              Review
                            </button>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {/* UPLOAD + REVIEW FORM */}
                <div className="col-md-5">
                  <form
                    onSubmit={handleFileUpload}
                    className="mb-4"
                  >
                    <input
                      type="file"
                      name="file"
                      className="form-control form-control-sm mb-2"
                      required
                    />
                    <button
                      type="submit"
                      className="btn btn-primary btn-sm w-100"
                    >
                      Upload
                    </button>
                  </form>

                  {reviewForm.fileId && (
                    <form
                      onSubmit={handleReviewSubmit}
                    >
                      <textarea
                        className="form-control form-control-sm mb-2"
                        rows={3}
                        value={reviewForm.comments}
                        onChange={(e) =>
                          setReviewForm({
                            ...reviewForm,
                            comments:
                              e.target.value,
                          })
                        }
                        required
                      />

                      <div className="d-flex gap-2 mb-2">
                        <button
                          type="button"
                          className={`btn btn-sm ${
                            reviewForm.status ===
                            "approved"
                              ? "btn-success"
                              : "btn-outline-success"
                          }`}
                          onClick={() =>
                            setReviewForm({
                              ...reviewForm,
                              status: "approved",
                            })
                          }
                        >
                          Approve
                        </button>

                        <button
                          type="button"
                          className={`btn btn-sm ${
                            reviewForm.status ===
                            "rework"
                              ? "btn-danger"
                              : "btn-outline-danger"
                          }`}
                          onClick={() =>
                            setReviewForm({
                              ...reviewForm,
                              status: "rework",
                            })
                          }
                        >
                          Rework
                        </button>
                      </div>

                      <button
                        type="submit"
                        className="btn btn-dark btn-sm w-100"
                      >
                        Submit Review
                      </button>
                    </form>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer border-0">
            <button
              className="btn btn-light"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailsModal;