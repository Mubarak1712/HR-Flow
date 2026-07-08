import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import Tasks from "./pages/Tasks";
import Departments from "./pages/Departments";
import Attendance from "./pages/Attendance";
import Leaves from "./pages/Leaves";
import Salary from "./pages/Salary";
import Settings from "./pages/Settings";
import Notifications from "./pages/Notifications";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Routes */}
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
            <Employees />
          </ProtectedRoute>
        }
      />

      <Route
        path="/tasks"
        element={
          <ProtectedRoute>
            <Tasks />
          </ProtectedRoute>
        }
      />

      <Route
        path="/departments"
        element={
          <ProtectedRoute>
            <Departments />
          </ProtectedRoute>
        }
      />

      <Route
        path="/attendance"
        element={
          <ProtectedRoute>
            <Attendance />
          </ProtectedRoute>
        }
      />

      <Route
        path="/leaves"
        element={
          <ProtectedRoute>
            <Leaves />
          </ProtectedRoute>
        }
      />

      <Route
        path="/salary"
        element={
          <ProtectedRoute>
            <Salary />
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />

      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;