import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

import Login from "@/pages/Login";
import Setup from "@/pages/Setup";
import ChangePassword from "@/pages/ChangePassword";
import Unauthorized from "@/pages/Unauthorized";
import NotFound from "@/pages/NotFound";
import Placeholder from "@/pages/Placeholder";

import AdminLayout from "@/layouts/AdminLayout";
import HrLayout from "@/layouts/HrLayout";
import EmployeeLayout from "@/layouts/EmployeeLayout";

import AdminDashboard from "@/pages/admin/AdminDashboard";
import HrDashboard from "@/pages/hr/HrDashboard";
import EmployeeDashboard from "@/pages/employee/EmployeeDashboard";

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "admin") return <Navigate to="/admin" replace />;
  if (user.role === "hr") return <Navigate to="/hr" replace />;
  return <Navigate to="/employee" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <Toaster position="top-center" />
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/setup" element={<Setup />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        <Route element={<ProtectedRoute roles={["admin"]} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/organization" element={<Placeholder title="Organization Setup" />} />
            <Route path="/admin/employees" element={<Placeholder title="Employees" />} />
            <Route path="/admin/attendance" element={<Placeholder title="Attendance" />} />
            <Route path="/admin/leave" element={<Placeholder title="Leave" />} />
            <Route path="/admin/payroll" element={<Placeholder title="Payroll" />} />
            <Route path="/admin/ai" element={<Placeholder title="AI Assistant" />} />
            <Route path="/admin/comms" element={<Placeholder title="Announcements" />} />
            <Route path="/admin/audit" element={<Placeholder title="Audit Log" />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute roles={["hr"]} />}>
          <Route element={<HrLayout />}>
            <Route path="/hr" element={<HrDashboard />} />
            <Route path="/hr/employees" element={<Placeholder title="Employees" />} />
            <Route path="/hr/attendance" element={<Placeholder title="Attendance" />} />
            <Route path="/hr/leave" element={<Placeholder title="Leave Requests" />} />
            <Route path="/hr/payroll" element={<Placeholder title="Payroll" />} />
            <Route path="/hr/ai" element={<Placeholder title="AI Assistant" />} />
            <Route path="/hr/comms" element={<Placeholder title="Announcements" />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute roles={["employee"]} />}>
          <Route element={<EmployeeLayout />}>
            <Route path="/employee" element={<EmployeeDashboard />} />
            <Route path="/employee/attendance" element={<Placeholder title="My Attendance" />} />
            <Route path="/employee/leave" element={<Placeholder title="My Leave" />} />
            <Route path="/employee/payslips" element={<Placeholder title="Payslips" />} />
            <Route path="/employee/ai" element={<Placeholder title="AI Assistant" />} />
            <Route path="/employee/notifications" element={<Placeholder title="Notifications" />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}