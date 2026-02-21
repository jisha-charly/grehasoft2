import React from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import Layout from "./components/layout/Layout";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import LoginPage from "./pages/auth/LoginPage";
import Dashboard from "./pages/dashboard/Dashboard";
import ProjectsPage from "./pages/projects/ProjectsPage";
import ProjectDetailsPage from "./pages/projects/ProjectDetailsPage";
import ProjectKanbanPage from "./pages/projects/ProjectKanbanPage";
import TasksPage from "./pages/tasks/TasksPage";
import LeadsPage from "./pages/crm/LeadsPage";
import ClientsPage from "./pages/clients/ClientsPage";
import SEOPage from "./pages/seo/SEOPage";
import UsersPage from "./pages/admin/users/UsersPage";
import RolesPage from "./pages/admin/roles/RolesPage";
import DepartmentsPage from "./pages/admin/departments/DepartmentsPage";
import TaskTypesPage from "./pages/admin/task-types/TaskTypesPage";

import { UserRole } from "./types";

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>

        {/* ✅ Global Toaster */}
        <ToastContainer position="top-right" autoClose={3000} />

        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/projects"
            element={
              <ProtectedRoute>
                <Layout>
                  <ProjectsPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/projects/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <ProjectDetailsPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/projects/:id/kanban"
            element={
              <ProtectedRoute>
                <Layout>
                  <ProjectKanbanPage/>
                </Layout>
              </ProtectedRoute>
            }
          />

         // <Route
           // path="/tasks"
          //  element={
             // <ProtectedRoute>
               // <Layout>
               //   <TasksPage />
               // </Layout>
              //</ProtectedRoute>
         //   }
          />

          <Route
            path="/clients"
            element={
              <ProtectedRoute
                allowedRoles={[
                  UserRole.SUPER_ADMIN,
                  UserRole.PROJECT_MANAGER,
                  UserRole.SALES_MANAGER,
                ]}
              >
                <Layout>
                  <ClientsPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/crm"
            element={
              <ProtectedRoute>
                <Layout>
                  <LeadsPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/seo"
            element={
              <ProtectedRoute>
                <Layout>
                  <SEOPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
                <Layout>
                  <UsersPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/roles"
            element={
              <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
                <Layout>
                  <RolesPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/departments"
            element={
              <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
                <Layout>
                  <DepartmentsPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/task-types"
            element={
              <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
                <Layout>
                  <TaskTypesPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;