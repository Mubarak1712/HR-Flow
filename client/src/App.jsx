import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Employees from "./pages/Employees";
import Tasks from "./pages/Tasks";
import Departments from "./pages/Departments";
import Attendance from "./pages/Attendance";
import Leaves from "./pages/Leaves";
import Salary from "./pages/Salary";
import Settings from "./pages/Settings";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import Reports from "./pages/Reports";
import ForgotPassword from "./pages/ForgotPassword";

import ProtectedRoute from "./components/ProtectedRoute";
import RoleProtectedRoute from "./components/RoleProtectedRoute";

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Protected Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute>
            <RoleProtectedRoute allowedRoles={["Admin"]}>
              <AdminDashboard />
            </RoleProtectedRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/employees"
        element={
          <ProtectedRoute>
            <RoleProtectedRoute allowedRoles={["Admin"]}>
              <Employees />
            </RoleProtectedRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/tasks"
        element={
          <ProtectedRoute>
            <RoleProtectedRoute allowedRoles={["Admin", "Employee"]}>
              <Tasks />
            </RoleProtectedRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/departments"
        element={
          <ProtectedRoute>
            <RoleProtectedRoute allowedRoles={["Admin"]}>
              <Departments />
            </RoleProtectedRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/attendance"
        element={
          <ProtectedRoute>
            <RoleProtectedRoute allowedRoles={["Admin", "Employee"]}>
              <Attendance />
            </RoleProtectedRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/leaves"
        element={
          <ProtectedRoute>
            <RoleProtectedRoute allowedRoles={["Admin", "Employee"]}>
              <Leaves />
            </RoleProtectedRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/salary"
        element={
          <ProtectedRoute>
            <RoleProtectedRoute allowedRoles={["Admin", "Employee"]}>
              <Salary />
            </RoleProtectedRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <RoleProtectedRoute allowedRoles={["Admin"]}>
              <Settings />
            </RoleProtectedRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <RoleProtectedRoute allowedRoles={["Admin", "Employee"]}>
              <Notifications />
            </RoleProtectedRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <RoleProtectedRoute allowedRoles={["Admin"]}>
              <Reports />
            </RoleProtectedRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <RoleProtectedRoute allowedRoles={["Admin", "Employee"]}>
              <Profile />
            </RoleProtectedRoute>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;