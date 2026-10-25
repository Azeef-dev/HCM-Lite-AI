import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

import Login from "@/pages/Login";
import Setup from "@/pages/Setup";
import ChangePassword from "@/pages/ChangePassword";
import Unauthorized from "@/pages/Unauthorized";
import NotFound from "@/pages/NotFound";

import AdminLayout from "@/layouts/AdminLayout";
import HrLayout from "@/layouts/HrLayout";
import EmployeeLayout from "@/layouts/EmployeeLayout";

import AdminDashboard from "@/pages/admin/AdminDashboard";
import HrDashboard from "@/pages/hr/HrDashboard";
import EmployeeDashboard from "@/pages/employee/EmployeeDashboard";

import EmployeeList from "@/pages/employee/EmployeeList";
import EmployeeCreate from "@/pages/employee/EmployeeCreate";
import EmployeeDetail from "@/pages/employee/EmployeeDetail";
import EmployeeImport from "@/pages/employee/EmployeeImport";

import MyAttendance from "@/pages/employee/MyAttendance";
import AttendanceBoard from "@/pages/attendance/AttendanceBoard";
import CorrectionRequests from "@/pages/attendance/CorrectionRequests";

import MyLeave from "@/pages/employee/MyLeave";
import LeaveInbox from "@/pages/leave/LeaveInbox";

import PayrollRuns from "@/pages/payroll/PayrollRuns";
import PayrollRunDetail from "@/pages/payroll/PayrollRunDetail";
import MyPayslips from "@/pages/employee/MyPayslips";

import AiAssistant from "@/pages/ai/AiAssistant";
import OrgSetup from "@/pages/admin/OrgSetup";
import Announcements from "@/pages/comms/Announcements";
import AuditLog from "@/pages/admin/AuditLog";
import Notifications from "@/pages/employee/Notifications";

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
        <Route path="/signup" element={<Setup />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        <Route element={<ProtectedRoute roles={["admin"]} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/employees" element={<EmployeeList />} />
            <Route path="/admin/employees/:id" element={<EmployeeDetail />} />
            <Route path="/admin/attendance" element={<AttendanceBoard />} />
            <Route path="/admin/leave" element={<LeaveInbox />} />
            <Route path="/admin/organization" element={<OrgSetup />} />
            <Route path="/admin/payroll" element={<PayrollRuns />} />
            <Route path="/admin/payroll/:id" element={<PayrollRunDetail />} />
            <Route path="/admin/ai" element={<AiAssistant />} />
            <Route path="/admin/comms" element={<Announcements />} />
            <Route path="/admin/audit" element={<AuditLog />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute roles={["hr"]} />}>
          <Route element={<HrLayout />}>
            <Route path="/hr" element={<HrDashboard />} />
            <Route path="/hr/employees" element={<EmployeeList />} />
            <Route path="/hr/employees/new" element={<EmployeeCreate />} />
            <Route path="/hr/employees/import" element={<EmployeeImport />} />
            <Route path="/hr/employees/:id" element={<EmployeeDetail />} />
            <Route path="/hr/attendance" element={<AttendanceBoard />} />
            <Route path="/hr/attendance/corrections" element={<CorrectionRequests />} />
            <Route path="/hr/leave" element={<LeaveInbox />} />
            <Route path="/hr/payroll" element={<PayrollRuns />} />
            <Route path="/hr/payroll/:id" element={<PayrollRunDetail />} />
            <Route path="/hr/ai" element={<AiAssistant />} />
            <Route path="/hr/comms" element={<Announcements />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute roles={["employee"]} />}>
          <Route element={<EmployeeLayout />}>
            <Route path="/employee" element={<EmployeeDashboard />} />
            <Route path="/employee/profile/:id" element={<EmployeeDetail />} />
            <Route path="/employee/attendance" element={<MyAttendance />} />
            <Route path="/employee/leave" element={<MyLeave />} />
            <Route path="/employee/payslips" element={<MyPayslips />} />
            <Route path="/employee/ai" element={<AiAssistant />} />
            <Route path="/employee/notifications" element={<Notifications />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}
