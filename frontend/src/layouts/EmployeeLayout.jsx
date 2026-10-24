import DashboardLayout from "./DashboardLayout";
import { LayoutDashboard, Clock, Calendar, Wallet, Bot, Bell } from "lucide-react";

const navItems = [
    { to: "/employee", label: "Dashboard", icon: LayoutDashboard },
    { to: "/employee/attendance", label: "My Attendance", icon: Clock },
    { to: "/employee/leave", label: "My Leave", icon: Calendar },
    { to: "/employee/payslips", label: "Payslips", icon: Wallet },
    { to: "/employee/ai", label: "AI Assistant", icon: Bot },
    { to: "/employee/notifications", label: "Notifications", icon: Bell },
];

export default function EmployeeLayout() {
    return <DashboardLayout navItems={navItems} roleLabel="Employee" />;
}